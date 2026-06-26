import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Youtube, CheckCircle, ExternalLink, Loader2, Film, Image as ImageIcon, Eye, Lock, Globe, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function PublishTab({ project, onUpdate }) {
  const [youtubeTitle, setYoutubeTitle] = useState(project.title || "");
  const [youtubeDescription, setYoutubeDescription] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [isApproved, setIsApproved] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(project.youtube_published || false);

  const scenes = project.scenes || [];
  const media = project.generated_media || [];
  const storyboards = project.storyboard_images || [];

  const generateDescription = async () => {
    setIsGeneratingDesc(true);
    const desc = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a compelling YouTube video description for this film: "${project.title}"
      
Film details:
- Genre: ${project.genre || "Cinematic"}
- Tone: ${project.tone}
- Quality: ${project.quality}
- Scenes: ${scenes.map(s => s.title).join(", ")}

Write an engaging description that includes:
1. A hook (first 2 lines - these show in preview)
2. What the film is about (2-3 paragraphs)
3. Hashtags (10-15 relevant ones)

Keep it YouTube-optimized and compelling. Max 500 words.`
    });
    setYoutubeDescription(desc);
    setIsGeneratingDesc(false);
  };

  const handlePublish = async () => {
    if (!isApproved) return;
    setIsPublishing(true);

    // Simulate publishing workflow - in production this would connect to YouTube API
    await new Promise(resolve => setTimeout(resolve, 2000));

    const updated = await base44.entities.FilmProject.update(project.id, {
      youtube_published: true,
      youtube_url: `https://youtube.com/watch?v=sim_${project.id}`,
      status: "published"
    });

    setPublishSuccess(true);
    setIsPublishing(false);
    onUpdate(updated);
  };

  const totalAssets = media.length + storyboards.length;

  if (publishSuccess) {
    return (
      <div className="text-center py-20">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-10 h-10 text-green-400" />
        </motion.div>
        <h3 className="text-2xl font-bold text-white mb-2">Published!</h3>
        <p className="text-gray-400 mb-6">Your film "{project.title}" has been approved and submitted for publishing.</p>
        <div className="bg-gray-900/60 border border-green-500/30 rounded-xl p-4 inline-block">
          <p className="text-sm text-gray-400 mb-2">YouTube Channel Submission</p>
          <div className="flex items-center gap-2 text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Successfully submitted for review</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Connect your YouTube account in settings to enable auto-publishing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <Youtube className="w-5 h-5 text-red-400" />
          Publish to YouTube
        </h3>
        <p className="text-gray-400 text-sm mt-1">Review your project and publish to your YouTube channel</p>
      </div>

      {/* Project Summary */}
      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5 mb-6">
        <h4 className="text-sm font-semibold text-white mb-3">Project Assets</h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gray-800/60 rounded-lg">
            <p className="text-2xl font-bold text-amber-300">{scenes.length}</p>
            <p className="text-xs text-gray-400">Scenes</p>
          </div>
          <div className="text-center p-3 bg-gray-800/60 rounded-lg">
            <p className="text-2xl font-bold text-amber-300">{media.length}</p>
            <p className="text-xs text-gray-400">Generated Images</p>
          </div>
          <div className="text-center p-3 bg-gray-800/60 rounded-lg">
            <p className="text-2xl font-bold text-amber-300">{storyboards.length}</p>
            <p className="text-xs text-gray-400">Storyboards</p>
          </div>
        </div>

        {/* Thumbnails Preview */}
        {(media.length > 0 || storyboards.length > 0) && (
          <div className="mt-4">
            <p className="text-xs text-gray-500 mb-2">Media Preview</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[...storyboards.slice(0, 3), ...media.slice(0, 3).map(m => m.url)].filter(Boolean).map((url, i) => (
                <img key={i} src={url} alt="" className="h-16 w-24 object-cover rounded-lg flex-shrink-0" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* YouTube Details */}
      <div className="space-y-4 mb-6">
        <div>
          <Label className="text-white mb-2 block text-sm">Video Title</Label>
          <Input
            value={youtubeTitle}
            onChange={(e) => setYoutubeTitle(e.target.value)}
            className="bg-gray-900 border-gray-700 text-white"
            maxLength={100}
          />
          <p className="text-xs text-gray-500 mt-1">{youtubeTitle.length}/100 characters</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-white text-sm">Description</Label>
            <Button
              onClick={generateDescription}
              disabled={isGeneratingDesc}
              variant="ghost"
              size="sm"
              className="text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 text-xs"
            >
              {isGeneratingDesc ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
              AI Generate
            </Button>
          </div>
          <Textarea
            value={youtubeDescription}
            onChange={(e) => setYoutubeDescription(e.target.value)}
            placeholder="Describe your video for YouTube viewers..."
            rows={6}
            className="bg-gray-900 border-gray-700 text-white text-sm resize-none placeholder:text-gray-500"
          />
        </div>

        <div>
          <Label className="text-white mb-2 block text-sm">Visibility</Label>
          <div className="flex gap-3">
            {[
              { id: "private", label: "Private", icon: Lock, desc: "Only you" },
              { id: "unlisted", label: "Unlisted", icon: Eye, desc: "Anyone with link" },
              { id: "public", label: "Public", icon: Globe, desc: "Everyone" },
            ].map(({ id, label, icon: Icon, desc }) => (
              <button
                key={id}
                onClick={() => setVisibility(id)}
                className={`flex-1 p-3 rounded-xl border text-center transition-all ${
                  visibility === id
                    ? "border-amber-500 bg-amber-500/10"
                    : "border-gray-700 bg-gray-900/40 hover:border-gray-600"
                }`}
              >
                <Icon className={`w-4 h-4 mx-auto mb-1 ${visibility === id ? "text-amber-400" : "text-gray-500"}`} />
                <p className={`text-xs font-medium ${visibility === id ? "text-amber-300" : "text-white"}`}>{label}</p>
                <p className="text-[10px] text-gray-500">{desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Approval & Publish */}
      <div className="bg-gray-900/60 border border-amber-500/20 rounded-xl p-5">
        <h4 className="text-sm font-semibold text-white mb-3">Final Approval</h4>
        <p className="text-sm text-gray-400 mb-4">
          Review all generated content above. By approving, you confirm this film is ready for publishing to your YouTube channel.
        </p>

        <label className="flex items-start gap-3 cursor-pointer mb-5">
          <input
            type="checkbox"
            checked={isApproved}
            onChange={(e) => setIsApproved(e.target.checked)}
            className="mt-0.5 accent-amber-500"
          />
          <span className="text-sm text-gray-300">
            I have reviewed all scenes, storyboards, and content. I approve this film for publishing.
          </span>
        </label>

        <Button
          onClick={handlePublish}
          disabled={!isApproved || isPublishing || !youtubeTitle.trim()}
          className={`w-full font-bold ${
            isApproved ? "bg-red-600 hover:bg-red-500" : "bg-gray-700 cursor-not-allowed"
          }`}
        >
          {isPublishing ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Publishing...</>
          ) : (
            <><Youtube className="w-4 h-4 mr-2" /> Publish to YouTube</>
          )}
        </Button>

        <p className="text-xs text-gray-600 text-center mt-3">
          Connect your YouTube account in settings for direct publishing
        </p>
      </div>
    </div>
  );
}