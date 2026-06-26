import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Upload, FileText, BookOpen, Loader2, Sparkles, Film } from "lucide-react";

export default function NewProjectModal({ onClose, onCreated }) {
  const [step, setStep] = useState(1); // 1=source, 2=settings
  const [sourceType, setSourceType] = useState("prompt");
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [quality, setQuality] = useState("4K");
  const [tone, setTone] = useState("cinematic");
  const [genre, setGenre] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("dynamic");
  const fileRef = useRef(null);

  const sourceTypes = [
    { id: "prompt", label: "Write a Prompt", icon: Sparkles, desc: "Describe your story idea" },
    { id: "book", label: "Upload a Book", icon: BookOpen, desc: "TXT, PDF, ePub content" },
    { id: "script", label: "Upload a Script", icon: Film, desc: "Screenplay or script file" },
    { id: "text_file", label: "Text File", icon: FileText, desc: "Any text document" },
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setIsUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploadedUrl(file_url);
    setIsUploading(false);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    setIsCreating(true);

    const projectData = {
      title: title.trim(),
      source_type: sourceType,
      status: "draft",
      quality,
      tone,
      genre,
      time_of_day: timeOfDay,
    };

    if (sourceType === "prompt") {
      projectData.source_content = prompt;
    } else if (uploadedUrl) {
      projectData.source_file_url = uploadedUrl;
      if (uploadedFile) {
        // Read file content for text files
        if (uploadedFile.type === "text/plain") {
          const text = await uploadedFile.text();
          projectData.source_content = text.substring(0, 50000); // cap at 50k chars
        }
      }
    }

    const project = await base44.entities.FilmProject.create(projectData);
    setIsCreating(false);
    onCreated(project);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-950 border border-amber-500/30 rounded-2xl w-full max-w-2xl shadow-2xl shadow-amber-500/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">New Film Project</h2>
            <p className="text-sm text-gray-400 mt-1">Step {step} of 2</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label className="text-white mb-3 block font-semibold">Choose Your Source</Label>
                <div className="grid grid-cols-2 gap-3">
                  {sourceTypes.map(({ id, label, icon: Icon, desc }) => (
                    <button
                      key={id}
                      onClick={() => setSourceType(id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        sourceType === id
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-gray-700 bg-gray-900/40 hover:border-gray-600"
                      }`}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${sourceType === id ? "text-amber-400" : "text-gray-500"}`} />
                      <p className={`text-sm font-medium ${sourceType === id ? "text-amber-300" : "text-white"}`}>{label}</p>
                      <p className="text-xs text-gray-500 mt-1">{desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-white mb-2 block">Project Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your film project..."
                  className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>

              {sourceType === "prompt" ? (
                <div>
                  <Label className="text-white mb-2 block">Story / Prompt</Label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your story in detail. Include characters, settings, plot, mood, and any specific scenes you want generated. The more detail, the better the film..."
                    rows={6}
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 resize-none"
                  />
                </div>
              ) : (
                <div>
                  <Label className="text-white mb-2 block">Upload File</Label>
                  <input ref={fileRef} type="file" accept=".txt,.pdf,.doc,.docx,.epub,.md" className="hidden" onChange={handleFileUpload} />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-amber-500/50 transition-all"
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                        <p className="text-gray-400 text-sm">Uploading...</p>
                      </div>
                    ) : uploadedFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-8 h-8 text-amber-400" />
                        <p className="text-amber-300 text-sm font-medium">{uploadedFile.name}</p>
                        <p className="text-gray-500 text-xs">Click to change file</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-gray-600" />
                        <p className="text-gray-400 text-sm">Click to upload your file</p>
                        <p className="text-gray-600 text-xs">TXT, PDF, DOC, EPUB, MD supported</p>
                      </div>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white mb-2 block text-sm">Video Quality</Label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      <SelectItem value="1080p">1080p Full HD</SelectItem>
                      <SelectItem value="4K">4K Ultra HD</SelectItem>
                      <SelectItem value="8K">8K Cinema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white mb-2 block text-sm">Cinematic Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      {["cinematic", "dramatic", "comedic", "horror", "documentary", "fantasy", "sci-fi"].map(t => (
                        <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white mb-2 block text-sm">Lighting Cycle</Label>
                  <Select value={timeOfDay} onValueChange={setTimeOfDay}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      {["dynamic", "dawn", "day", "dusk", "night"].map(t => (
                        <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white mb-2 block text-sm">Genre (optional)</Label>
                  <Input
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    placeholder="Action, Romance, Thriller..."
                    className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-900/60 border border-gray-700 rounded-xl p-4">
                <p className="text-sm font-semibold text-white mb-2">Project Summary</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
                  <span>Title: <span className="text-white">{title}</span></span>
                  <span>Source: <span className="text-white capitalize">{sourceType.replace("_", " ")}</span></span>
                  <span>Quality: <span className="text-amber-300">{quality}</span></span>
                  <span>Tone: <span className="text-white capitalize">{tone}</span></span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-800">
          <Button
            variant="ghost"
            onClick={step === 1 ? onClose : () => setStep(1)}
            className="text-gray-400 hover:text-white"
          >
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          {step === 1 ? (
            <Button
              onClick={() => setStep(2)}
              disabled={!title.trim() || (sourceType === "prompt" && !prompt.trim()) || (sourceType !== "prompt" && !uploadedUrl)}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold"
            >
              Next: Settings
            </Button>
          ) : (
            <Button
              onClick={handleCreate}
              disabled={isCreating}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold"
            >
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Create Project
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}