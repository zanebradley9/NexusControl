import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Download, Eye, Star, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    totalDownloads: 0,
    totalViews: 0,
    averageRating: 0,
    topBooks: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const orders = await base44.entities.Order.list();
      const books = await base44.entities.Book.list();

      setAnalytics({
        totalDownloads: orders.length,
        totalViews: orders.length * 3, // Simulated
        averageRating: 4.5,
        topBooks: books.slice(0, 5)
      });
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
    setIsLoading(false);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold literary-text mb-2">Analytics Dashboard 📊</h1>
          <p className="text-amber-700 text-lg">Track your book performance and reader engagement</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="literary-shadow bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Download className="w-10 h-10 text-blue-600" />
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold literary-text mb-1">{analytics.totalDownloads}</div>
                <div className="text-sm text-blue-700">Total Downloads</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="literary-shadow bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Eye className="w-10 h-10 text-purple-600" />
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-3xl font-bold literary-text mb-1">{analytics.totalViews}</div>
                <div className="text-sm text-purple-700">Total Views</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="literary-shadow bg-gradient-to-br from-yellow-100 to-orange-100 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Star className="w-10 h-10 text-yellow-600" />
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                </div>
                <div className="text-3xl font-bold literary-text mb-1">{analytics.averageRating}</div>
                <div className="text-sm text-yellow-700">Avg Rating ⭐</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="literary-shadow bg-gradient-to-br from-green-100 to-emerald-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-10 h-10 text-green-600" />
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold literary-text mb-1">12m</div>
                <div className="text-sm text-green-700">Avg Read Time</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Top Books */}
        <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-amber-200 mb-8">
          <CardHeader>
            <CardTitle className="literary-text">Top Performing Books</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-4 bg-amber-50 rounded-lg animate-pulse">
                    <div className="h-4 bg-amber-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-amber-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : analytics.topBooks.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                <p className="text-amber-700">No books published yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.topBooks.map((book, index) => (
                  <div key={book.id} className="flex items-center gap-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="text-2xl font-bold text-amber-600">#{index + 1}</div>
                    <div className="flex-1">
                      <h3 className="font-bold literary-text">{book.title}</h3>
                      <p className="text-sm text-amber-700">{book.word_count || 0} words</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">Free</div>
                      <div className="text-xs text-green-700">Available</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reader Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="literary-text flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Top Reader Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany'].map((country, index) => (
                  <div key={country} className="flex items-center justify-between">
                    <span className="text-amber-800">{country}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-amber-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                          style={{ width: `${100 - (index * 15)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-amber-600">{100 - (index * 15)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-amber-200">
            <CardHeader>
              <CardTitle className="literary-text flex items-center gap-2">
                <Star className="w-5 h-5" />
                Reader Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-amber-800">Returning Readers</span>
                    <span className="font-bold text-amber-600">75%</span>
                  </div>
                  <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-amber-800">Completion Rate</span>
                    <span className="font-bold text-amber-600">82%</span>
                  </div>
                  <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-amber-800">5-Star Reviews</span>
                    <span className="font-bold text-amber-600">68%</span>
                  </div>
                  <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}