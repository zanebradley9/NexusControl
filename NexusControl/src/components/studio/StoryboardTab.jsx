import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Clapperboard, Sparkles, ChevronRight, Image as ImageIcon, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StoryboardTab({ project, onUpdate }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: "" });
  const [localImages, setLocalImages] = useState(project.storyboard_images || []);
  const [localScenes, setLocalScenes] = useState(project.scenes || []);

  const generateStoryboard = async () => {
    setIsGenerating(true);
    setProgress({ current: 0, total: 0, label: "Analyzing story content..." });

    const sourceContent = project.source_content || `A ${project.tone} ${project.genre || "cinematic"} film titled "${project.title}"`;

    // 1. Parse into scenes
    setProgress({ current: 0, total: 5, label: "Breaking story into scenes..." });
    const storyboardData = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a Hollywood film director and storyboard artist working on a ${project.quality} production. Analyze this story and create a detailed, production-ready storyboard.

Story: "${sourceContent.substring(0, 8000)}"

Film settings:
- Tone: ${project.tone}
- Time of day: ${project.time_of_day}
- Quality: ${project.quality}
- Genre: ${project.genre || "cinematic"}

Create a storyboard with 7-9 key scenes. CRITICAL: All image prompts must be PHOTOREALISTIC — real human actors with detailed faces, real-world iconic buildings and environments (e.g. New York streets, Paris architecture, London fog, desert highways), real lighting conditions (golden hour, overcast, neon city night), cinematic camera angles (low angle, dutch tilt, aerial, close-up), no animation, no illustration, no CGI feel.

For audio_cues, be highly specific: include ambient sounds layered together (e.g. "distant crowd chatter, taxi horns, pigeons cooing, light wind through alleyway"), sync them to the visual mood of the scene.

Return JSON: {
  "title": "film title",
  "synopsis": "2-3 sentence synopsis",
  "scenes": [
    {
      "scene_number": 1,
      "title": "Scene title",
      "description": "What happens in this scene (2-3 sentences)",
      "setting": "Specific real-world location description",
      "characters": ["Character names present"],
      "dialogue_hint": "Key line or action",
      "image_prompt": "Photorealistic ${project.quality} film still — [specific camera angle] of [real human characters with detailed appearance] in [specific real-world environment, e.g. 'rain-soaked Tokyo alley at midnight, neon reflections on wet cobblestones'] — [lighting description], [film stock/color grade], [mood], shot on ARRI Alexa, anamorphic lens",
      "audio_cues": "Layered ambient sounds: [specific sounds] + [environmental sounds] + [background atmosphere]",
      "time_of_day": "specific time",
      "weather": "weather conditions",
      "duration_seconds": 8
    }
  ]
}`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          synopsis: { type: "string" },
          scenes: {
            type: "array",
            items: {
              type: "object",
              properties: {
                scene_number: { type: "number" },
                title: { type: "string" },
                description: { type: "string" },
                setting: { type: "string" },
                characters: { type: "array", items: { type: "string" } },
                dialogue_hint: { type: "string" },
                image_prompt: { type: "string" },
                audio_cues: { type: "string" },
                time_of_day: { type: "string" },
                weather: { type: "string" }
              },
              required: ["scene_number", "title", "description", "image_prompt"]
            }
          }
        },
        required: ["scenes"]
      }
    });

    const scenes = storyboardData.scenes || [];
    setLocalScenes(scenes);
    setProgress({ current: 0, total: scenes.length, label: "Generating storyboard images..." });

    // 2. Generate images for each scene
    const images = [];
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      setProgress({ current: i + 1, total: scenes.length, label: `Rendering Scene ${i + 1}: ${scene.title}` });
      const imageData = await base44.integrations.Core.GenerateImage({
        prompt: `${scene.image_prompt}. Ultra-photorealistic, real humans, real environments, real architecture, no CGI, no illustration. ${project.quality} cinema, ${project.tone} tone, ${scene.weather || ""} weather, ${scene.time_of_day || project.time_of_day} lighting. Shot on ARRI Alexa with anamorphic lens. Professional color grade.`
      });
      images.push(imageData.url);
      setLocalImages([...images]);

      // Save to media library
      await base44.entities.MediaLibraryItem.create({
        title: `${project.title} — Scene ${i + 1}: ${scene.title}`,
        type: "storyboard",
        url: imageData.url,
        project_id: project.id,
        project_title: project.title,
        scene_index: i,
        prompt_used: scene.image_prompt,
        quality: project.quality
      });
    }

    // 3. Update project
    const updated = await base44.entities.FilmProject.update(project.id, {
      scenes,
      storyboard_images: images,
      total_scenes: scenes.length,
      status: "storyboarding"
    });

    setIsGenerating(false);
    onUpdate(updated);
  };

  const hasStoryboard = localImages.length > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Clapperboard className="w-5 h-5 text-amber-400" />
            Storyboard
          </h3>
          <p className="text-gray-400 text-sm mt-1">Auto-generate cinematic storyboard frames from your story</p>
        </div>
        <Button
          onClick={generateStoryboard}
          disabled={isGenerating}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
          ) : hasStoryboard ? (
            <><RefreshCw className="w-4 h-4 mr-2" /> Regenerate</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Generate Storyboard</>
          )}
        </Button>
      </div>

      {/* Progress */}
      {isGenerating && progress.total > 0 && (
        <div className="mb-6 bg-gray-900/60 border border-amber-500/20 rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-amber-300">{progress.label}</span>
            <span className="text-gray-400">{progress.current}/{progress.total}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
              animate={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 5}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {!hasStoryboard && !isGenerating && (
        <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-2xl">
          <Clapperboard className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No storyboard yet</p>
          <p className="text-gray-600 text-sm">Click "Generate Storyboard" to create cinematic scene frames</p>
        </div>
      )}

      {/* Storyboard Grid */}
      {localScenes.length > 0 && localImages.length > 0 && (
        <div className="space-y-6">
          {localScenes.map((scene, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="aspect-video bg-gray-800 relative overflow-hidden">
                  {localImages[i] ? (
                    <img src={localImages[i]} alt={scene.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3 bg-black/80 text-amber-300 text-xs px-2 py-1 rounded font-mono">
                    SCENE {scene.scene_number || i + 1}
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h4 className="font-bold text-white text-base mb-2">{scene.title}</h4>
                  <p className="text-gray-300 text-sm mb-3 leading-relaxed">{scene.description}</p>

                  <div className="space-y-2 text-xs">
                    {scene.setting && (
                      <div className="flex gap-2">
                        <span className="text-amber-400 font-medium w-16 flex-shrink-0">Setting:</span>
                        <span className="text-gray-400">{scene.setting}</span>
                      </div>
                    )}
                    {scene.characters?.length > 0 && (
                      <div className="flex gap-2">
                        <span className="text-amber-400 font-medium w-16 flex-shrink-0">Cast:</span>
                        <span className="text-gray-400">{scene.characters.join(", ")}</span>
                      </div>
                    )}
                    {scene.dialogue_hint && (
                      <div className="flex gap-2">
                        <span className="text-amber-400 font-medium w-16 flex-shrink-0">Key line:</span>
                        <span className="text-gray-400 italic">"{scene.dialogue_hint}"</span>
                      </div>
                    )}
                    {scene.audio_cues && (
                      <div className="flex gap-2">
                        <span className="text-amber-400 font-medium w-16 flex-shrink-0">Audio:</span>
                        <span className="text-gray-400">{scene.audio_cues}</span>
                      </div>
                    )}
                    {scene.time_of_day && (
                      <div className="flex gap-2">
                        <span className="text-amber-400 font-medium w-16 flex-shrink-0">Time:</span>
                        <span className="text-gray-400 capitalize">{scene.time_of_day}</span>
                      </div>
                    )}
                    {scene.weather && (
                      <div className="flex gap-2">
                        <span className="text-amber-400 font-medium w-16 flex-shrink-0">Weather:</span>
                        <span className="text-gray-400 capitalize">{scene.weather}</span>
                      </div>
                    )}
                    {scene.duration_seconds && (
                      <div className="flex gap-2">
                        <span className="text-amber-400 font-medium w-16 flex-shrink-0">Duration:</span>
                        <span className="text-gray-400">{scene.duration_seconds}s</span>
                      </div>
                    )}
                  </div>

                  {/* Audio cues highlight */}
                  {scene.audio_cues && (
                    <div className="mt-3 bg-black/40 border border-amber-500/20 rounded-lg p-2.5">
                      <p className="text-[10px] text-amber-400 font-semibold mb-1 uppercase tracking-wide">🎵 Audio Sync</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{scene.audio_cues}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}