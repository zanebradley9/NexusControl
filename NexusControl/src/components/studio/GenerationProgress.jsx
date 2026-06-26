import React from "react";
import { Loader2, Clapperboard, Film, Mic, Sparkles } from "lucide-react";

const stages = [
  { key: "parsing", label: "Parsing Story", icon: Sparkles },
  { key: "storyboarding", label: "Storyboarding", icon: Clapperboard },
  { key: "generating", label: "Generating Scenes", icon: Film },
  { key: "rendering", label: "Rendering", icon: Mic },
];

export default function GenerationProgress({ project }) {
  const currentStageIndex = stages.findIndex(s => s.key === project.status);
  const sceneProgress = project.total_scenes > 0
    ? Math.round((project.completed_scenes / project.total_scenes) * 100)
    : 0;

  return (
    <div className="border-b border-amber-500/20 bg-amber-500/5 px-4 py-3">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-6 mb-2">
          {stages.map((stage, i) => {
            const Icon = stage.icon;
            const isDone = i < currentStageIndex;
            const isCurrent = i === currentStageIndex;
            return (
              <div key={stage.key} className="flex items-center gap-1.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                  isDone ? "bg-green-500" : isCurrent ? "bg-amber-500" : "bg-gray-700"
                }`}>
                  <Icon className={`w-3 h-3 ${isDone || isCurrent ? "text-black" : "text-gray-500"} ${isCurrent ? "animate-spin" : ""}`} />
                </div>
                <span className={`text-xs ${isCurrent ? "text-amber-300 font-medium" : isDone ? "text-green-400" : "text-gray-600"}`}>
                  {stage.label}
                </span>
                {i < stages.length - 1 && (
                  <div className={`w-6 h-px ml-1 ${i < currentStageIndex ? "bg-green-500" : "bg-gray-700"}`} />
                )}
              </div>
            );
          })}
        </div>
        {project.total_scenes > 0 && (
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-500"
                style={{ width: `${sceneProgress}%` }}
              />
            </div>
            <span className="text-xs text-amber-300 font-mono">
              {project.completed_scenes}/{project.total_scenes} scenes ({sceneProgress}%)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}