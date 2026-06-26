import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lightbulb, Sparkles, Download, Image as ImageIcon, Plus, Star, Tag, Trash2 } from "lucide-react";
import MarketingCopyGenerator from "@/components/tools/MarketingCopyGenerator";
import TagSuggester from "@/components/tools/TagSuggester";
import AiToolbox from "@/components/tools/AiToolbox";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Tools() {
  const [ideas, setIdeas] = useState([]);
  const [newIdea, setNewIdea] = useState({ title: "", content: "", category: "plot", tags: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [user, setUser] = useState(null);


  useEffect(() => {
    loadIdeas();
    checkUserStatus();
  }, []);

  const checkUserStatus = async () => {
    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      const userData = await base44.auth.me();
      setUser(userData);
      if (userData.subscription_end_date) {
        const endDate = new Date(userData.subscription_end_date);
        const today = new Date();
        const diffTime = endDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setIsPremium(diffDays > 0);
      } else {
        setIsPremium(false);
      }
    }
  };

  const loadIdeas = async () => {
    setIsLoading(true);
    const data = await base44.entities.Idea.list("-created_date");
    setIdeas(data);
    setIsLoading(false);
  };

  const saveIdea = async () => {
    if (!newIdea.title || !newIdea.content) return;
    await base44.entities.Idea.create(newIdea);
    setNewIdea({ title: "", content: "", category: "plot", tags: [] });
    loadIdeas();
  };

  const deleteIdea = async (ideaId) => {
    try {
      await base44.entities.Idea.delete(ideaId);
      loadIdeas();
    } catch (error) {
      console.error("Error deleting idea:", error);
      alert("Failed to delete idea. Please try again.");
    }
  };

  const toggleFavorite = async (ideaId, currentFavorite) => {
    await base44.entities.Idea.update(ideaId, { is_favorite: !currentFavorite });
    loadIdeas();
  };



  const tools = [
    { icon: Sparkles, title: "AI Assistant", description: "Get plot ideas, fix grammar, generate titles", color: "from-purple-500 to-pink-500" },
    { icon: ImageIcon, title: "Cover Designer", description: "Create beautiful book covers with AI", color: "from-blue-500 to-indigo-500" },
    { icon: Download, title: "Export Center", description: "Export as PDF, EPUB, or HTML", color: "from-green-500 to-emerald-500" },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold literary-text mb-2">Author Tools 🛠️</h1>
          <p className="text-amber-700 text-lg">Powerful utilities for your creative process</p>
        </div>

        {/* Tool Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="literary-shadow hover:shadow-xl transition-all duration-300 cursor-pointer group">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold literary-text text-lg mb-2">{tool.title}</h3>
                  <p className="text-sm text-amber-700">{tool.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div class="grid grid-cols-1 gap-6">
<AiToolbox isPremium={isPremium} />
<MarketingCopyGenerator />
<TagSuggester />

          {/* Idea Vault */}
          <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="literary-text flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Idea Vault 🧠
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Idea title..."
                value={newIdea.title}
                onChange={(e) => setNewIdea({...newIdea, title: e.target.value})}
                className="border-amber-200"
              />
              <Textarea
                placeholder="Write your idea..."
                value={newIdea.content}
                onChange={(e) => setNewIdea({...newIdea, content: e.target.value})}
                rows={3}
                className="border-amber-200"
              />
              <Select value={newIdea.category} onValueChange={(val) => setNewIdea({...newIdea, category: val})}>
                <SelectTrigger className="border-amber-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="plot">Plot Idea</SelectItem>
                  <SelectItem value="character">Character</SelectItem>
                  <SelectItem value="setting">Setting</SelectItem>
                  <SelectItem value="dialogue">Dialogue</SelectItem>
                  <SelectItem value="quote">Quote</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={saveIdea} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Save Idea
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Saved Ideas */}
        <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-amber-200 mt-6">
          <CardHeader>
            <CardTitle className="literary-text">Saved Ideas ({ideas.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {ideas.length === 0 ? (
              <div className="text-center py-12">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                <p className="text-amber-700">No ideas saved yet. Start capturing your inspiration!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ideas.map((idea) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card className="bg-amber-50 border-amber-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold literary-text flex-1">{idea.title}</h3>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => toggleFavorite(idea.id, idea.is_favorite)}
                            >
                              <Star className={`w-4 h-4 ${idea.is_favorite ? 'fill-yellow-500 text-yellow-500' : 'text-amber-400'}`} />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 hover:bg-red-100"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete this idea?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{idea.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => deleteIdea(idea.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                        <p className="text-sm text-amber-800 mb-2">{idea.content}</p>
                        <div className="flex items-center gap-2">
                          <div className="px-2 py-1 bg-amber-200 rounded-full text-xs text-amber-900">
                            {idea.category}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}