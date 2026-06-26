import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Film, Sparkles, Image as ImageIcon, Plus, RefreshCw, Download, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SceneGeneratorTab({ project, onUpdate }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, label: "" });
  const [generatedMedia, setGeneratedMedia] = useState(project.generated_media || []);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isCustomGenerating, setIsCustomGenerating] = useState(false);
  const [selectedScene, setSelectedScene] = useState(null);

  const scenes = project.scenes || [];

  const generateAllScenes = async () => {
    if (scenes.length === 0) {
      alert("Please generate a storyboard first to create scenes.");
      return;
    }

    setIsGenerating(true);
    const media = [...generatedMedia];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      setProgress({
        current: i + 1,
        total: scenes.length,
        label: `Generating Scene ${i + 1}: ${scene.title}`
      });

      const imagePrompt = `${scene.image_prompt}, ultra-realistic photographic, ${project.quality} cinematic film still, IMAX quality, professional cinematography, ${project.tone} atmosphere, detailed environment, realistic lighting and shadows, ${scene.time_of_day || "golden hour"} lighting, ${scene.weather || ""}, filmic color grading`;

      const imageData = await base44.integrations.Core.GenerateImage({ prompt: imagePrompt });

      const sceneMedia = {
        scene_index: i,
        scene_title: scene.title,
        url: imageData.url,
        type: "image",
        prompt: imagePrompt,
        characters: scene.characters || [],
        audio_cues: scene.audio_cues || "",
        time_of_day: scene.time_of_day || project.time_of_day
      };

      media.push(sceneMedia);
      setGeneratedMedia([...media]);

      // Save to media library
      await base44.entities.MediaLibraryItem.create({
        title: `${project.title} — Scene ${i + 1}: ${scene.title}`,
        type: "scene",
        url: imageData.url,
        project_id: project.id,
        project_title: project.title,
        scene_index: i,
        prompt_used: imagePrompt,
        quality: project.quality,
        tags: [project.tone, project.genre || "cinematic"].filter(Boolean)
      });

      // Update project progress
      await base44.entities.FilmProject.update(project.id, {
        completed_scenes: i + 1,
        status: "generating"
      });
    }

    const updated = await base44.entities.FilmProject.update(project.id, {
      generated_media: media,
      status: "complete"
    });

    setIsGenerating(false);
    onUpdate(updated);
  };

  const generateCustomScene = async () => {
    if (!customPrompt.trim()) return;
    setIsCustomGenerating(true);

    const enhanced = await base44.integrations.Core.InvokeLLM({
      prompt: `Enhance this scene prompt for cinematic image generation: "${customPrompt}". 
      Make it highly detailed, photorealistic, and cinematically compelling.
      Include: camera angle, lighting, environment, character details, mood, atmosphere.
      Film settings: tone=${project.tone}, quality=${project.quality}, time=${project.time_of_day}.
      Return only the enhanced prompt.`
    });

    const imageData = await base44.integrations.Core.GenerateImage({
      prompt: `${enhanced}, photorealistic ${project.quality} cinematic film still, professional cinematography`
    });

    const newMedia = {
      scene_index: generatedMedia.length,
      scene_title: customPrompt.substring(0, 40),
      url: imageData.url,
      type: "custom",
      prompt: customPrompt
    };

    const allMedia = [...generatedMedia, newMedia];
    setGeneratedMedia(allMedia);

    await base44.entities.MediaLibraryItem.create({
      title: `${project.title} — Custom: ${customPrompt.substring(0, 40)}`,
      type: "scene",
      url: imageData.url,
      project_id: project.id,
      project_title: project.title,
      prompt_used: customPrompt,
      quality: project.quality
    });

    await base44.entities.FilmProject.update(project.id, { generated_media: allMedia });
    setCustomPrompt("");
    setIsCustomGenerating(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-400" />
            Scene Generator
          </h3>
          <p className="text-gray-400 text-sm mt-1">Generate cinematic {project.quality} scene images from your storyboard</p>
        </div>
        <Button
          onClick={generateAllScenes}
          disabled={isGenerating || scenes.length === 0}
          className="bg-amber-500 hover:bg-amber-400 text-black font-bold"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Generate All Scenes</>
          )}
        </Button>
      </div>

      {/* Progress */}
      {isGenerating && (
        <div className="mb-6 bg-gray-900/60 border border-amber-500/20 rounded-xl p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-amber-300">{progress.label}</span>
            <span className="text-gray-400">{progress.current}/{progress.total}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full"
              animate={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 5}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="grid grid-cols-4 gap-1 mt-3">
            {scenes.map((_, i) => (
              <div key={i} className={`h-1 rounded-full ${i < progress.current ? "bg-amber-400" : "bg-gray-700"}`} />
            ))}
          </div>
        </div>
      )}

      {/* Custom Scene */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 mb-6">
        <p className="text-sm font-medium text-white mb-3">Generate Custom Scene</p>
        <div className="flex gap-3">
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Describe a specific scene... e.g. 'A woman running through a rain-soaked neon-lit alley at night, realistic, cinematic'"
            rows={2}
            className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-sm resize-none"
          />
          <Button
            onClick={generateCustomScene}
            disabled={isCustomGenerating || !customPrompt.trim()}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold self-end"
          >
            {isCustomGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Generated Scenes Grid */}
      {generatedMedia.length === 0 && !isGenerating && (
        <div className="text-center py-16 border-2 border-dashed border-gray-800 rounded-2xl">
          <ImageIcon className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">{scenes.length === 0 ? "Generate a storyboard first" : "No scenes generated yet"}</p>
          <p className="text-gray-600 text-sm">{scenes.length > 0 ? `${scenes.length} scenes ready to generate` : "Go to the Storyboard tab to create your scenes"}</p>
        </div>
      )}

      {generatedMedia.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {generatedMedia.map((media, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className="group bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all"
            >
              <div className="aspect-video bg-gray-800 relative overflow-hidden">
                <img src={media.url} alt={media.scene_title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 left-2 bg-black/70 text-amber-300 text-xs px-2 py-1 rounded font-mono">
                  {media.type === "custom" ? "CUSTOM" : `SCENE ${media.scene_index + 1}`}
                </div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/50 flex items-center justify-center gap-3 transition-all">
                  <a href={media.url} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" className="bg-amber-500 text-black hover:bg-amber-400">
                      <Eye className="w-4 h-4 mr-1" /> View
                    </Button>
                  </a>
                </div>
              </div>
              <div className="p-3">
                <p className="text-xs font-medium text-white truncate">{media.scene_title}</p>
                {media.time_of_day && (
                  <p className="text-xs text-gray-500 mt-1 capitalize">{media.time_of_day} · {media.audio_cues?.substring(0, 40) || "Cinematic scene"}</p>
                )}
                {media.characters?.length > 0 && (
                  <p className="text-xs text-gray-600 mt-0.5">Cast: {media.characters.join(", ")}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}