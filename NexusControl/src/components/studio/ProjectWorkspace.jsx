import React, { useState } from "react";
import { ArrowLeft, Clapperboard, Film, Mic, Youtube, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import StoryboardTab from "./StoryboardTab";
import SceneGeneratorTab from "./SceneGeneratorTab";
import VoiceStudioTab from "./VoiceStudioTab";
import PublishTab from "./PublishTab";
import ScenePlayerTab from "./ScenePlayerTab";
import GenerationProgress from "./GenerationProgress";

const tabs = [
  { id: "storyboard", label: "Storyboard", icon: Clapperboard },
  { id: "player", label: "Cinematic Player", icon: Play },
  { id: "scenes", label: "Scenes", icon: Film },
  { id: "voice", label: "Voice Studio", icon: Mic },
  { id: "publish", label: "Publish", icon: Youtube },
];

export default function ProjectWorkspace({ project, onBack, onUpdate }) {
  const [activeTab, setActiveTab] = useState("storyboard");

  const isProcessing = ["parsing", "storyboarding", "generating", "rendering"].includes(project.status);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-amber-500/20 bg-black/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Projects
            </Button>
            <div className="w-px h-5 bg-gray-700" />
            <div>
              <h2 className="font-bold text-white text-sm">{project.title}</h2>
              <p className="text-xs text-gray-500 capitalize">{(project.source_type || "").replace("_", " ")} · {project.quality} · {project.tone}</p>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === id
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {isProcessing && <GenerationProgress project={project} />}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "storyboard" && <StoryboardTab project={project} onUpdate={onUpdate} />}
            {activeTab === "player" && <ScenePlayerTab project={project} onUpdate={onUpdate} />}
            {activeTab === "scenes" && <SceneGeneratorTab project={project} onUpdate={onUpdate} />}
            {activeTab === "voice" && <VoiceStudioTab project={project} onUpdate={onUpdate} />}
            {activeTab === "publish" && <PublishTab project={project} onUpdate={onUpdate} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}