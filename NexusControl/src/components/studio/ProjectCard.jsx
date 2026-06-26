import React from "react";
import { Film, Clock, CheckCircle, Loader2, Clapperboard, BookOpen, FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const statusConfig = {
  draft: { label: "Draft", color: "text-gray-400", bg: "bg-gray-800", icon: Clock },
  parsing: { label: "Parsing", color: "text-blue-400", bg: "bg-blue-500/20", icon: Loader2 },
  storyboarding: { label: "Storyboarding", color: "text-purple-400", bg: "bg-purple-500/20", icon: Clapperboard },
  generating: { label: "Generating", color: "text-amber-400", bg: "bg-amber-500/20", icon: Sparkles },
  rendering: { label: "Rendering", color: "text-orange-400", bg: "bg-orange-500/20", icon: Film },
  complete: { label: "Complete", color: "text-green-400", bg: "bg-green-500/20", icon: CheckCircle },
  published: { label: "Published", color: "text-emerald-400", bg: "bg-emerald-500/20", icon: CheckCircle },
};

const sourceIcons = {
  prompt: Sparkles,
  book: BookOpen,
  script: Film,
  text_file: FileText,
  pdf: FileText,
  story: Sparkles,
};

export default function ProjectCard({ project, onClick }) {
  const status = statusConfig[project.status] || statusConfig.draft;
  const StatusIcon = status.icon;
  const SourceIcon = sourceIcons[project.source_type] || Sparkles;

  const progress = project.total_scenes > 0
    ? Math.round((project.completed_scenes / project.total_scenes) * 100)
    : 0;

  const thumbnail = project.storyboard_images?.[0] ||
    project.generated_media?.find(m => m.url)?.url;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-gray-900/60 border border-gray-800 rounded-2xl overflow-hidden hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/10 transition-all group"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-800 relative overflow-hidden">
        {thumbnail ? (
          <img src={thumbnail} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Clapperboard className="w-12 h-12 text-gray-700" />
          </div>
        )}
        {/* Quality Badge */}
        {project.quality && (
          <div className="absolute top-2 right-2 bg-black/70 text-amber-300 text-xs px-2 py-0.5 rounded font-mono">
            {project.quality}
          </div>
        )}
        {/* Tone Badge */}
        {project.tone && (
          <div className="absolute top-2 left-2 bg-black/70 text-gray-300 text-xs px-2 py-0.5 rounded capitalize">
            {project.tone}
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Title & Status */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2">{project.title}</h3>
          <div className={`flex items-center gap-1 ${status.bg} rounded-full px-2 py-0.5 flex-shrink-0`}>
            <StatusIcon className={`w-3 h-3 ${status.color} ${["parsing","generating","rendering"].includes(project.status) ? "animate-spin" : ""}`} />
            <span className={`text-[10px] font-medium ${status.color}`}>{status.label}</span>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <SourceIcon className="w-3 h-3 text-amber-400" />
            <span className="capitalize">{(project.source_type || "prompt").replace("_", " ")}</span>
          </div>
          {project.genre && (
            <>
              <span>·</span>
              <span>{project.genre}</span>
            </>
          )}
          {project.total_scenes > 0 && (
            <>
              <span>·</span>
              <span>{project.total_scenes} scenes</span>
            </>
          )}
        </div>

        {/* Progress Bar */}
        {project.total_scenes > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <p className="text-xs text-gray-600 mt-3">
          {new Date(project.created_date).toLocaleDateString()}
        </p>
      </div>
    </button>
  );
}