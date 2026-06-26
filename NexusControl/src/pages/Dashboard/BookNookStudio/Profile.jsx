import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Award, Star, Flame, BookOpen, TrendingUp, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [stats, setStats] = useState({
    booksPublished: 0,
    totalReaders: 0,
    writingStreak: 7
  });
  const [isLoading, setIsLoading] = useState(true);
  const [newAchievement, setNewAchievement] = useState({
    title: "",
    description: "",
    icon: "🏆",
    category: "milestone"
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      const userData = await base44.auth.me();
      setUser(userData);
    }

    const achievementData = await base44.entities.Achievement.list();
    setAchievements(achievementData);

    const books = await base44.entities.Book.list();
    const orders = await base44.entities.Order.list();
    
    setStats({
      booksPublished: books.filter(b => b.status === 'published' || b.status === 'completed').length,
      totalReaders: orders.length,
      writingStreak: 7
    });

    setIsLoading(false);
  };

  const createAchievement = async () => {
    if (!newAchievement.title || !newAchievement.description) {
      alert("Please fill in title and description");
      return;
    }

    try {
      await base44.entities.Achievement.create({
        ...newAchievement,
        earned_date: new Date().toISOString()
      });
      
      setNewAchievement({
        title: "",
        description: "",
        icon: "🏆",
        category: "milestone"
      });
      setDialogOpen(false);
      loadProfile();
      alert("Achievement created successfully!");
    } catch (error) {
      console.error("Error creating achievement:", error);
      alert("Failed to create achievement");
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold literary-text mb-2">Author Profile 🪶</h1>
          <p className="text-amber-700 text-lg">Your creative journey and achievements</p>
        </div>

        {/* Profile Card */}
        <Card className="literary-shadow bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 literary-float">
                <span className="text-4xl md:text-5xl text-white font-bold">
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'W'}
                </span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-bold literary-text mb-2">{user?.full_name || 'Writer'}</h2>
                <p className="text-amber-700 mb-4">{user?.email || 'author@bookstudio.com'}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge className="bg-amber-500 text-white">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {stats.booksPublished} Books
                  </Badge>
                  <Badge className="bg-blue-500 text-white">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stats.totalReaders} Readers
                  </Badge>
                  <Badge className="bg-red-500 text-white">
                    <Flame className="w-3 h-3 mr-1" />
                    {stats.writingStreak} Day Streak
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-amber-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="literary-text flex items-center gap-2">
                <Award className="w-5 h-5" />
                Achievements ({achievements.length})
              </CardTitle>
              
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Achievement
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Custom Achievement</DialogTitle>
                    <DialogDescription>
                      Add a personal milestone or achievement to your profile
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Achievement Title</Label>
                      <Input
                        placeholder="e.g., 100 Pages Written"
                        value={newAchievement.title}
                        onChange={(e) => setNewAchievement({...newAchievement, title: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Description</Label>
                      <Input
                        placeholder="e.g., Reached 100 pages in my novel"
                        value={newAchievement.description}
                        onChange={(e) => setNewAchievement({...newAchievement, description: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Icon (Emoji)</Label>
                      <Input
                        placeholder="🏆"
                        value={newAchievement.icon}
                        onChange={(e) => setNewAchievement({...newAchievement, icon: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <Label>Category</Label>
                      <Select 
                        value={newAchievement.category} 
                        onValueChange={(val) => setNewAchievement({...newAchievement, category: val})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="writing">Writing</SelectItem>
                          <SelectItem value="community">Community</SelectItem>
                          <SelectItem value="reading">Reading</SelectItem>
                          <SelectItem value="streak">Streak</SelectItem>
                          <SelectItem value="milestone">Milestone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button onClick={createAchievement} className="w-full">
                      Create Achievement
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {achievements.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                <p className="text-amber-700">Keep writing to earn achievements!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                      <CardContent className="p-6 text-center">
                        <div className="text-5xl mb-3">{achievement.icon}</div>
                        <h3 className="font-bold literary-text mb-1">{achievement.title}</h3>
                        <p className="text-sm text-purple-700 mb-2">{achievement.description}</p>
                        <Badge className="bg-purple-500 text-white text-xs">
                          {new Date(achievement.earned_date).toLocaleDateString()}
                        </Badge>
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