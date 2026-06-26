import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipForward, SkipBack, Loader2, Film,
  Volume2, VolumeX, ChevronRight, Sparkles, RefreshCw, Wind,
  Music2, Cloud, Users, Bird, Waves, Trees
} from "lucide-react";

const AMBIENT_SOUNDS = [
  { id: "city_crowd", label: "City Crowd", icon: Users, desc: "Urban buzz, traffic, voices", prompt: "dense city street ambience with crowd chatter, traffic, and urban sounds" },
  { id: "birds_forest", label: "Forest Birds", icon: Bird, desc: "Birds, rustling leaves, wind", prompt: "peaceful forest ambience with birds chirping, leaves rustling in breeze, crickets" },
  { id: "strong_wind", label: "Mountain Wind", icon: Wind, desc: "Howling wind, echoes", prompt: "dramatic mountain wind ambience, howling gusts, distant echo" },
  { id: "ocean_waves", label: "Ocean Waves", icon: Waves, desc: "Crashing waves, seabirds", prompt: "immersive ocean shore ambience, waves crashing, seagulls, sea breeze" },
  { id: "rain_storm", label: "Rain & Thunder", icon: Cloud, desc: "Heavy rain, thunder", prompt: "intense rain storm ambience with thunder rumbles, rain on surfaces" },
  { id: "crowd_cheering", label: "Crowd Cheering", icon: Users, desc: "Arena crowd, chanting", prompt: "large arena crowd cheering and chanting ambience" },
  { id: "jungle_night", label: "Jungle Night", icon: Trees, desc: "Insects, frogs, mystery", prompt: "deep jungle night ambience with insects, frogs, exotic birds, mysterious sounds" },
  { id: "marketplace", label: "Marketplace", icon: Music2, desc: "Vendors, haggling, bustle", prompt: "busy marketplace ambience with vendor calls, haggling, crowd movement" },
];

export default function ScenePlayerTab({ project, onUpdate }) {
  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [isGeneratingAmbient, setIsGeneratingAmbient] = useState(false);
  const [ambientTracks, setAmbientTracks] = useState(project.generated_media?.filter(m => m.type === "ambient") || []);
  const [selectedAmbient, setSelectedAmbient] = useState(null);
  const [generatingSceneAudio, setGeneratingSceneAudio] = useState(null);
  const [slideShow, setSlideShow] = useState(false);
  const ambientRef = useRef(null);
  const intervalRef = useRef(null);

  const scenes = project.scenes || [];
  const images = project.storyboard_images || [];
  const hasContent = scenes.length > 0 && images.length > 0;

  useEffect(() => {
    if (slideShow && isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentScene(prev => {
          if (prev >= scenes.length - 1) {
            setIsPlaying(false);
            setSlideShow(false);
            return 0;
          }
          return prev + 1;
        });
      }, 6000);
    }
    return () => clearInterval(intervalRef.current);
  }, [slideShow, isPlaying, scenes.length]);

  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.muted = muted;
    }
  }, [muted]);

  const generateSceneAmbient = async (scene, index) => {
    setGeneratingSceneAudio(index);
    const env = AMBIENT_SOUNDS.find(a => a.id === selectedAmbient);
    const prompt = env
      ? `${env.prompt} — scene context: ${scene.setting || scene.title}`
      : `cinematic ambient audio for: ${scene.audio_cues || scene.setting || scene.title}. Include crowd murmurs, environmental sounds, wind, birds, or relevant background audio.`;

    const desc = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a 2-sentence immersive audio narration/ambient description for this film scene to generate as speech:
Scene: ${scene.title}
Setting: ${scene.setting}
Audio cues: ${scene.audio_cues}
Atmosphere: ${project.tone}
Write it as rich environmental description, not a script. Include sounds like: ${env?.desc || "crowd, wind, nature, ambience"}.`
    });

    const result = await base44.integrations.Core.GenerateSpeech({
      text: desc.substring(0, 500),
      voice: "river"
    });

    const newTrack = { type: "ambient", scene_index: index, url: result.url, label: scene.title };
    const updatedMedia = [...(project.generated_media || []), newTrack];
    const updated = await base44.entities.FilmProject.update(project.id, { generated_media: updatedMedia });

    setAmbientTracks(prev => [...prev, newTrack]);
    setGeneratingSceneAudio(null);
    onUpdate(updated);
  };

  const generateAllAmbient = async () => {
    setIsGeneratingAmbient(true);
    for (let i = 0; i < scenes.length; i++) {
      const already = ambientTracks.find(t => t.scene_index === i);
      if (!already) await generateSceneAmbient(scenes[i], i);
    }
    setIsGeneratingAmbient(false);
  };

  const startCinematicPlay = () => {
    setCurrentScene(0);
    setIsPlaying(true);
    setSlideShow(true);
  };

  const scene = scenes[currentScene];
  const image = images[currentScene];
  const ambientForScene = ambientTracks.find(t => t.scene_index === currentScene);

  if (!hasContent) {
    return (
      <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-2xl">
        <Film className="w-16 h-16 text-gray-700 mx-auto mb-4" />
        <p className="text-gray-500 text-lg mb-2">No scenes to play yet</p>
        <p className="text-gray-600 text-sm">Generate a storyboard first to enable the cinematic player</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cinematic Player */}
      <div className="bg-black rounded-2xl overflow-hidden border border-amber-500/20">
        {/* Main Screen */}
        <div className="relative aspect-video bg-black">
          <AnimatePresence mode="wait">
            {image && (
              <motion.img
                key={currentScene}
                src={image}
                alt={scene?.title}
                className="w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>

          {/* Cinematic bars */}
          <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none" />

          {/* Scene counter */}
          <div className="absolute top-3 left-3 bg-black/80 text-amber-300 text-xs px-2 py-1 rounded font-mono">
            SCENE {currentScene + 1} / {scenes.length}
          </div>

          {/* Quality badge */}
          <div className="absolute top-3 right-3 bg-black/80 text-amber-300 text-xs px-2 py-0.5 rounded font-mono">
            {project.quality}
          </div>

          {/* Scene title overlay */}
          <AnimatePresence>
            {scene && (
              <motion.div
                key={`title-${currentScene}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-4 left-4 right-4"
              >
                <p className="text-white font-bold text-lg drop-shadow-lg">{scene.title}</p>
                {scene.dialogue_hint && (
                  <p className="text-amber-200/80 text-sm italic mt-1 drop-shadow">"{scene.dialogue_hint}"</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ambient audio player (hidden) */}
          {ambientForScene?.url && (
            <audio ref={ambientRef} src={ambientForScene.url} autoPlay={isPlaying && !muted} loop key={`audio-${currentScene}`} />
          )}
        </div>

        {/* Controls */}
        <div className="px-4 py-3 bg-gray-950 flex items-center gap-3">
          <button onClick={() => setCurrentScene(Math.max(0, currentScene - 1))} className="text-gray-400 hover:text-white transition-colors">
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={() => { setIsPlaying(!isPlaying); setSlideShow(!slideShow); }}
            className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 flex items-center justify-center transition-colors"
          >
            {isPlaying ? <Pause className="w-5 h-5 text-black" /> : <Play className="w-5 h-5 text-black ml-0.5" />}
          </button>

          <button onClick={() => setCurrentScene(Math.min(scenes.length - 1, currentScene + 1))} className="text-gray-400 hover:text-white transition-colors">
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Progress */}
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden cursor-pointer" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              setCurrentScene(Math.round(pct * (scenes.length - 1)));
            }}>
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                animate={{ width: `${((currentScene + 1) / scenes.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className="text-xs text-gray-500 font-mono">{currentScene + 1}/{scenes.length}</span>
          </div>

          <button onClick={() => setMuted(!muted)} className="text-gray-400 hover:text-white transition-colors">
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Scene thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {scenes.map((s, i) => (
          <button
            key={i}
            onClick={() => setCurrentScene(i)}
            className={`flex-shrink-0 w-24 rounded-lg overflow-hidden border-2 transition-all ${
              i === currentScene ? "border-amber-400" : "border-transparent hover:border-gray-600"
            }`}
          >
            <div className="aspect-video bg-gray-800">
              {images[i] && <img src={images[i]} alt={s.title} className="w-full h-full object-cover" />}
            </div>
            <p className="text-[9px] text-gray-400 text-center py-1 truncate px-1">S{i + 1}</p>
          </button>
        ))}
      </div>

      {/* Ambient Audio Section */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-white font-semibold flex items-center gap-2">
            <Music2 className="w-4 h-4 text-amber-400" />
            Ambient Soundscape
          </h4>
          <Button
            onClick={generateAllAmbient}
            disabled={isGeneratingAmbient}
            size="sm"
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold"
          >
            {isGeneratingAmbient ? (
              <><Loader2 className="w-3 h-3 animate-spin mr-2" /> Generating...</>
            ) : (
              <><Sparkles className="w-3 h-3 mr-2" /> Generate All Scenes</>
            )}
          </Button>
        </div>

        {/* Ambient type selector */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {AMBIENT_SOUNDS.map(a => {
            const Icon = a.icon;
            return (
              <button
                key={a.id}
                onClick={() => setSelectedAmbient(selectedAmbient === a.id ? null : a.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedAmbient === a.id
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-gray-700 bg-gray-950 hover:border-gray-600"
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${selectedAmbient === a.id ? "text-amber-400" : "text-gray-500"}`} />
                <p className={`text-[10px] font-medium leading-tight ${selectedAmbient === a.id ? "text-amber-300" : "text-white"}`}>{a.label}</p>
                <p className="text-[9px] text-gray-600 mt-0.5">{a.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Per-scene audio */}
        <div className="space-y-2">
          {scenes.map((s, i) => {
            const track = ambientTracks.find(t => t.scene_index === i);
            return (
              <div key={i} className="flex items-center gap-3 bg-gray-950 rounded-xl px-3 py-2.5">
                <div className="w-12 h-8 rounded overflow-hidden bg-gray-800 flex-shrink-0">
                  {images[i] && <img src={images[i]} alt="" className="w-full h-full object-cover" />}
                </div>
                <p className="text-xs text-gray-300 flex-1 truncate">Scene {i + 1}: {s.title}</p>
                <p className="text-[10px] text-gray-600 flex-shrink-0 w-24 truncate">{s.audio_cues}</p>
                {track ? (
                  <audio controls src={track.url} className="h-7 w-36 flex-shrink-0" />
                ) : (
                  <Button
                    onClick={() => generateSceneAmbient(s, i)}
                    disabled={generatingSceneAudio !== null}
                    size="sm"
                    variant="outline"
                    className="border-amber-500/40 text-amber-300 hover:bg-amber-500/10 text-xs h-7 px-2 flex-shrink-0"
                  >
                    {generatingSceneAudio === i ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <><Sparkles className="w-3 h-3 mr-1" /> Generate</>
                    )}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}