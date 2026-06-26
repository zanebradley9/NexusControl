import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Users, Trophy, Bell, Heart, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "discussion" });
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      const userData = await base44.auth.me();
      setUser(userData);
    }
    
    const postData = await base44.entities.CommunityPost.list("-created_date");
    setPosts(postData);
    setIsLoading(false);
  };

  const createPost = async () => {
    if (!newPost.title || !newPost.content || !user) return;
    
    await base44.entities.CommunityPost.create({
      ...newPost,
      author_name: user.full_name
    });
    
    setNewPost({ title: "", content: "", category: "discussion" });
    loadData();
  };

  const likePost = async (postId, currentLikes) => {
    await base44.entities.CommunityPost.update(postId, { likes: currentLikes + 1 });
    loadData();
  };

  const categories = [
    { value: "discussion", label: "💬 Discussion", color: "blue" },
    { value: "challenge", label: "🏆 Challenge", color: "yellow" },
    { value: "feedback", label: "📝 Feedback", color: "green" },
    { value: "announcement", label: "📢 Announcement", color: "red" },
    { value: "fanart", label: "🎨 Fan Art", color: "purple" }
  ];

  const getCategoryColor = (category) => {
    const colors = {
      discussion: "bg-blue-100 text-blue-800",
      challenge: "bg-yellow-100 text-yellow-800",
      feedback: "bg-green-100 text-green-800",
      announcement: "bg-red-100 text-red-800",
      fanart: "bg-purple-100 text-purple-800"
    };
    return colors[category] || colors.discussion;
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold literary-text mb-2">Community Hub 💬</h1>
          <p className="text-amber-700 text-lg">Connect with fellow writers and readers</p>
        </div>

        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="literary-shadow bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <Users className="w-10 h-10 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold literary-text">1,234</div>
              <div className="text-xs text-blue-700">Active Members</div>
            </CardContent>
          </Card>

          <Card className="literary-shadow bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-10 h-10 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold literary-text">{posts.length}</div>
              <div className="text-xs text-purple-700">Total Posts</div>
            </CardContent>
          </Card>

          <Card className="literary-shadow bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-200">
            <CardContent className="p-6 text-center">
              <Trophy className="w-10 h-10 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold literary-text">12</div>
              <div className="text-xs text-yellow-700">Active Challenges</div>
            </CardContent>
          </Card>

          <Card className="literary-shadow bg-gradient-to-br from-green-100 to-emerald-100 border-green-200">
            <CardContent className="p-6 text-center">
              <Bell className="w-10 h-10 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold literary-text">Live</div>
              <div className="text-xs text-green-700">Community Active</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Post */}
          <div className="lg:col-span-1">
            <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-amber-200 sticky top-4">
              <CardHeader>
                <CardTitle className="literary-text">Create Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Post title..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="border-amber-200"
                />
                <Textarea
                  placeholder="Share your thoughts..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  rows={4}
                  className="border-amber-200"
                />
                <Select value={newPost.category} onValueChange={(val) => setNewPost({...newPost, category: val})}>
                  <SelectTrigger className="border-amber-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={createPost} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" disabled={!user}>
                  Post to Community
                </Button>
                {!user && (
                  <p className="text-xs text-amber-700 text-center">Sign in to post</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Posts Feed */}
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <Card key={i} className="literary-shadow animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-amber-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-amber-100 rounded w-full mb-2"></div>
                    <div className="h-3 bg-amber-100 rounded w-5/6"></div>
                  </CardContent>
                </Card>
              ))
            ) : posts.length === 0 ? (
              <Card className="literary-shadow">
                <CardContent className="p-12 text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                  <p className="text-amber-700">No posts yet. Be the first to start a discussion!</p>
                </CardContent>
              </Card>
            ) : (
              posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="literary-shadow hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-amber-200">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(post.category)} mb-2`}>
                            {categories.find(c => c.value === post.category)?.label || post.category}
                          </div>
                          <h3 className="font-bold text-lg literary-text mb-1">{post.title}</h3>
                          <p className="text-xs text-amber-600">by {post.author_name}</p>
                        </div>
                      </div>
                      
                      <p className="text-amber-800 mb-4">{post.content}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => likePost(post.id, post.likes || 0)}
                          className="hover:bg-red-50"
                        >
                          <Heart className="w-4 h-4 mr-1 text-red-500" />
                          {post.likes || 0}
                        </Button>
                        <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                          <MessageSquare className="w-4 h-4 mr-1 text-blue-500" />
                          {post.replies_count || 0}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}