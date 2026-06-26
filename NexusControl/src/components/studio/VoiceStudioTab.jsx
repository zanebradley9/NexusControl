import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Mic, Play, Plus, Sparkles, User, Users, Volume2, Music } from "lucide-react";
import { motion } from "framer-motion";

const VOICE_OPTIONS = [
  { id: "river", label: "River", gender: "neutral", desc: "Calm, neutral" },
  { id: "honey", label: "Honey", gender: "female", desc: "Warm, soft" },
  { id: "sunny", label: "Sunny", gender: "female", desc: "Bright, upbeat" },
  { id: "storm", label: "Storm", gender: "male", desc: "Formal, authoritative" },
  { id: "spark", label: "Spark", gender: "male", desc: "Energetic, quick" },
];

const AUDIO_ENVIRONMENTS = [
  { id: "city_day", label: "City Day", desc: "Traffic, crowd chatter, distant horns, pigeons" },
  { id: "forest_birds", label: "Forest & Birds", desc: "Birdsong, rustling leaves, soft breeze" },
  { id: "ocean", label: "Ocean Shore", desc: "Crashing waves, seagulls, sea wind" },
  { id: "rain_thunder", label: "Rain & Thunder", desc: "Heavy rain, thunder rumbles, wet streets" },
  { id: "crowd_arena", label: "Crowd Cheering", desc: "Stadium roar, chanting, energy" },
  { id: "mountain_wind", label: "Mountain Wind", desc: "Howling gusts, distant echo, cold air" },
  { id: "night_crickets", label: "Night Crickets", desc: "Crickets, owls, eerie stillness" },
  { id: "battle", label: "Battle / Action", desc: "Explosions, shouts, chaos, fire" },
  { id: "marketplace", label: "Busy Market", desc: "Vendor calls, haggling, footsteps" },
  { id: "jungle", label: "Jungle", desc: "Exotic birds, insects, humidity" },
  { id: "winter_wind", label: "Winter Wind", desc: "Cold wind, snow crunch, emptiness" },
  { id: "interior_pub", label: "Pub / Tavern", desc: "Low chatter, glass clinks, warmth" },
];

export default function VoiceStudioTab({ project, onUpdate }) {
  const [characters, setCharacters] = useState([
    { name: "Narrator", voice: "river", gender: "neutral", lines: "" }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingIndex, setGeneratingIndex] = useState(null);
  const [generatedVoices, setGeneratedVoices] = useState([]);
  const [selectedEnv, setSelectedEnv] = useState(null);
  const [isAutoScript, setIsAutoScript] = useState(false);
  const [audioRefs] = useState({});

  const addCharacter = () => {
    setCharacters(prev => [...prev, { name: `Character ${prev.length + 1}`, voice: "honey", gender: "female", lines: "" }]);
  };

  const updateCharacter = (i, field, value) => {
    setCharacters(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));
  };

  const generateAutoScript = async () => {
    setIsAutoScript(true);
    const sourceContent = project.source_content || `A ${project.tone} film titled "${project.title}"`;
    const scenes = project.scenes || [];

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a voice script for this film: "${project.title}"

Story context: ${sourceContent.substring(0, 3000)}
Scenes: ${scenes.map((s, i) => `Scene ${i+1}: ${s.title} - ${s.description}`).join("\n")}

Generate a voice/dialogue script. Include:
1. A narrator voice and 2-3 main characters
2. Dialogue for key scenes
3. Character-appropriate lines

Return JSON: {
  "characters": [
    {
      "name": "Character name",
      "voice": "river|honey|sunny|storm|spark",
      "gender": "male|female|neutral",
      "lines": "Their full script text with scene markers like [SCENE 1] lines here [SCENE 2] lines here"
    }
  ]
}`,
      response_json_schema: {
        type: "object",
        properties: {
          characters: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                voice: { type: "string" },
                gender: { type: "string" },
                lines: { type: "string" }
              },
              required: ["name", "voice", "lines"]
            }
          }
        },
        required: ["characters"]
      }
    });

    if (result.characters) {
      setCharacters(result.characters.map(c => ({
        ...c,
        gender: c.gender || "neutral"
      })));
    }
    setIsAutoScript(false);
  };

  const generateVoice = async (charIndex) => {
    const char = characters[charIndex];
    if (!char.lines.trim()) return;

    setGeneratingIndex(charIndex);
    const result = await base44.integrations.Core.GenerateSpeech({
      text: char.lines.substring(0, 3000),
      voice: char.voice || "river"
    });

    const voiceEntry = {
      character: char.name,
      voice: char.voice,
      url: result.url,
      text: char.lines.substring(0, 100)
    };

    const updated = [...generatedVoices, voiceEntry];
    setGeneratedVoices(updated);

    await base44.entities.MediaLibraryItem.create({
      title: `${project.title} — Voice: ${char.name}`,
      type: "voice",
      url: result.url,
      project_id: project.id,
      project_title: project.title,
      prompt_used: char.lines.substring(0, 200),
      tags: [char.voice, char.gender]
    });

    setGeneratingIndex(null);
  };

  const generateAllVoices = async () => {
    setIsGenerating(true);
    for (let i = 0; i < characters.length; i++) {
      if (characters[i].lines.trim()) {
        await generateVoice(i);
      }
    }
    setIsGenerating(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Mic className="w-5 h-5 text-amber-400" />
            Voice Studio
          </h3>
          <p className="text-gray-400 text-sm mt-1">Multi-character voice acting with natural speech and environmental audio</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={generateAutoScript}
            disabled={isAutoScript}
            variant="outline"
            className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
          >
            {isAutoScript ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Auto Script
          </Button>
          <Button
            onClick={generateAllVoices}
            disabled={isGenerating}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Volume2 className="w-4 h-4 mr-2" />}
            Generate All Voices
          </Button>
        </div>
      </div>

      {/* Characters */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-400" />
            Characters ({characters.length})
          </h4>
          <Button
            onClick={addCharacter}
            variant="ghost"
            size="sm"
            className="text-amber-300 hover:text-amber-200 hover:bg-amber-500/10"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Character
          </Button>
        </div>

        {characters.map((char, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/60 border border-gray-800 rounded-xl p-4"
          >
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <Label className="text-xs text-gray-400 mb-1 block">Character Name</Label>
                <Input
                  value={char.name}
                  onChange={(e) => updateCharacter(i, "name", e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white text-sm h-8"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400 mb-1 block">Voice</Label>
                <Select value={char.voice} onValueChange={(v) => updateCharacter(i, "voice", v)}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-sm h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700 text-white">
                    {VOICE_OPTIONS.map(v => (
                      <SelectItem key={v.id} value={v.id}>
                        <div className="flex items-center gap-2">
                          <span>{v.label}</span>
                          <span className="text-xs text-gray-500">· {v.desc}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => generateVoice(i)}
                  disabled={generatingIndex !== null || !char.lines.trim()}
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold w-full h-8"
                >
                  {generatingIndex === i ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <><Mic className="w-3 h-3 mr-1" /> Generate</>
                  )}
                </Button>
              </div>
            </div>

            <Textarea
              value={char.lines}
              onChange={(e) => updateCharacter(i, "lines", e.target.value)}
              placeholder={`Enter ${char.name}'s lines and dialogue here...`}
              rows={3}
              className="bg-gray-800 border-gray-700 text-white text-sm resize-none placeholder:text-gray-600"
            />
          </motion.div>
        ))}
      </div>

      {/* Environmental Audio */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Music className="w-4 h-4 text-amber-400" />
          Environmental Audio
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {AUDIO_ENVIRONMENTS.map(env => (
            <button
              key={env.id}
              onClick={() => setSelectedEnv(selectedEnv === env.id ? null : env.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedEnv === env.id
                  ? "border-amber-500 bg-amber-500/10"
                  : "border-gray-700 bg-gray-900/40 hover:border-gray-600"
              }`}
            >
              <p className={`text-xs font-medium ${selectedEnv === env.id ? "text-amber-300" : "text-white"}`}>{env.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5">{env.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Generated Voices */}
      {generatedVoices.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-amber-400" />
            Generated Voice Tracks ({generatedVoices.length})
          </h4>
          <div className="space-y-2">
            {generatedVoices.map((v, i) => (
              <div key={i} className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{v.character}</p>
                  <p className="text-xs text-gray-500 truncate">{v.text}...</p>
                </div>
                <audio controls src={v.url} className="h-8 w-48 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}