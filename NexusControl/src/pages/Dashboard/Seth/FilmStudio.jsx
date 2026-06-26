import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Film, Sparkles, Play, BookOpen, Mic,
  Plus, Loader2, Clapperboard, Library, Youtube,
  ArrowLeft, Camera, Music, Sun, Trash2
} from "lucide-react";
import { Link } from "react-router-dom";
import ProjectCard from "@/components/studio/ProjectCard";
import NewProjectModal from "@/components/studio/NewProjectModal";
import ProjectWorkspace from "@/components/studio/ProjectWorkspace";
import DeleteConfirmModal from "@/components/studio/DeleteConfirmModal";
import TrashTab from "@/components/studio/TrashTab";

export default function FilmStudio() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [activeTab, setActiveTab] = useState("projects");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setIsLoading(true);
    const data = await base44.entities.FilmProject.list("-created_date", 50);
    setProjects(data);
    setIsLoading(false);
  };

  const handleProjectCreated = (project) => {
    setProjects(prev => [project, ...prev]);
    setShowNewProject(false);
    setActiveProject(project);
  };

  const handleProjectUpdate = (updated) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
    setActiveProject(updated);
  };

  const handleDeleteRequest = (e, project) => {
    e.stopPropagation();
    setDeleteTarget(project);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    // Archive to DeletedProject before removing
    const { id, created_date, updated_date, created_by_id, ...archiveData } = deleteTarget;
    await base44.entities.DeletedProject.create({
      ...archiveData,
      original_id: id,
      deleted_at: new Date().toISOString(),
    });
    await base44.entities.FilmProject.delete(id);
    setProjects(prev => prev.filter(p => p.id !== id));
    setDeleteTarget(null);
    setIsDeleting(false);
  };

  const handleRestored = (restoredProject) => {
    setProjects(prev => [restoredProject, ...prev]);
    setActiveTab("projects");
  };

  if (activeProject) {
    return (
      <ProjectWorkspace
        project={activeProject}
        onBack={() => setActiveProject(null)}
        onUpdate={handleProjectUpdate}
      />
    );
  }

  const tabs = [
    { id: "projects", label: "Projects", icon: Film },
    { id: "library", label: "Library", icon: Library },
    { id: "trash", label: "Trash", icon: Trash2 },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-amber-500/20 bg-black/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                <ArrowLeft className="w-4 h-4 mr-2" />
                SETH
              </Button>
            </Link>
            <div className="w-px h-6 bg-gray-700" />
            <div className="flex items-center gap-2">
              <Clapperboard className="w-6 h-6 text-amber-400" />
              <h1 className="text-xl font-bold text-amber-300 tracking-wider">FILM STUDIO</h1>
            </div>
          </div>
          <nav className="flex gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === id
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "projects" && (
          <>
            {/* Hero */}
            <div className="mb-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-2 mb-4"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-amber-300 text-sm font-medium">AI Film Studio — Real Actors, Real Environments</span>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl font-bold text-white mb-3"
              >
                Your AI Movie Production
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-gray-400 max-w-2xl mx-auto"
              >
                Upload books, scripts, or write prompts. SETH generates photorealistic cinematic scenes, synchronized audio, voice acting, and immersive ambient soundscapes.
              </motion.p>
            </div>

            {/* Capability Chips */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {[
                { icon: Camera, label: "4K & 8K Photorealistic" },
                { icon: Film, label: "Cinematic Player" },
                { icon: Mic, label: "Voice Acting" },
                { icon: Music, label: "Crowd & Ambient Audio" },
                { icon: Sun, label: "Day/Night Lighting" },
                { icon: BookOpen, label: "Book / Script to Film" },
                { icon: Youtube, label: "YouTube Publishing" },
                { icon: Clapperboard, label: "Auto Storyboard" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 bg-gray-900/60 border border-gray-700 rounded-full px-3 py-1.5 text-xs text-gray-300">
                  <Icon className="w-3 h-3 text-amber-400" />
                  {label}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-white">
                {projects.length > 0 ? `${projects.length} Project${projects.length !== 1 ? "s" : ""}` : "Get Started"}
              </h3>
              <Button
                onClick={() => setShowNewProject(true)}
                className="bg-amber-500 hover:bg-amber-400 text-black font-bold"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>

            {/* Projects Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center h-48">
                <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <Clapperboard className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No projects yet</p>
                <p className="text-gray-600 text-sm mb-6">Create your first film project to get started</p>
                <Button
                  onClick={() => setShowNewProject(true)}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Project
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative group"
                  >
                    <ProjectCard
                      project={project}
                      onClick={() => setActiveProject(project)}
                    />
                    {/* Delete button overlay */}
                    <button
                      onClick={(e) => handleDeleteRequest(e, project)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 hover:bg-red-600/80 text-gray-400 hover:text-white rounded-lg p-1.5 z-10"
                      title="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "library" && <MediaLibraryTab />}

        {activeTab === "trash" && <TrashTab onRestored={handleRestored} />}
      </main>

      <AnimatePresence>
        {showNewProject && (
          <NewProjectModal
            onClose={() => setShowNewProject(false)}
            onCreated={handleProjectCreated}
          />
        )}
        {deleteTarget && (
          <DeleteConfirmModal
            project={deleteTarget}
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeleteTarget(null)}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MediaLibraryTab() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const load = async () => {
      const data = await base44.entities.MediaLibraryItem.list("-created_date", 100);
      setItems(data);
      setIsLoading(false);
    };
    load();
  }, []);

  const types = ["all", "image", "storyboard", "video", "voice", "ambient"];
  const filtered = filterType === "all" ? items : items.filter(i => i.type === filterType);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h3 className="text-lg font-semibold text-white">Media Library</h3>
        <div className="flex gap-2 flex-wrap">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filterType === t
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-gray-400 hover:text-white bg-gray-900/60 border border-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <Library className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No media generated yet. Create a project to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative bg-gray-900/60 border border-gray-800 rounded-xl overflow-hidden hover:border-amber-500/40 transition-all cursor-pointer"
            >
              {(item.type === "image" || item.type === "storyboard") && item.url && (
                <img src={item.url} alt={item.title} className="w-full aspect-video object-cover" />
              )}
              {item.type === "video" && (
                <div className="w-full aspect-video bg-gray-800 flex items-center justify-center">
                  <Play className="w-10 h-10 text-amber-400" />
                </div>
              )}
              {(item.type === "voice" || item.type === "ambient") && (
                <div className="w-full aspect-video bg-gray-800 flex flex-col items-center justify-center gap-2">
                  <Mic className="w-8 h-8 text-purple-400" />
                  {item.url && <audio controls src={item.url} className="w-full h-7 px-2" />}
                </div>
              )}
              <div className="p-3">
                <p className="text-xs font-medium text-white truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded capitalize ${
                    item.type === "image" ? "bg-green-500/20 text-green-400" :
                    item.type === "storyboard" ? "bg-purple-500/20 text-purple-400" :
                    item.type === "video" ? "bg-red-500/20 text-red-400" :
                    item.type === "ambient" ? "bg-cyan-500/20 text-cyan-400" :
                    "bg-blue-500/20 text-blue-400"
                  }`}>{item.type}</span>
                  {item.project_title && (
                    <span className="text-[10px] text-gray-500 truncate">{item.project_title}</span>
                  )}
                </div>
              </div>
              {item.url && (item.type === "image" || item.type === "storyboard") && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/60 flex items-center justify-center transition-all"
                >
                  <span className="text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-lg">Open Full Size</span>
                </a>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}