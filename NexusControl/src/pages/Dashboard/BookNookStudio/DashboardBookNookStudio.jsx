import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BookOpen, Users, Flame, Cloud, Plus, Edit, Lightbulb, TrendingUp, Award, Calendar, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

import MobileAppInfo from "../../../components/MobileAppInfo";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeReaders: 0,
    writingStreak: 0,
    recentAchievements: []
  });
  const [user, setUser] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load user data
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const userData = await base44.auth.me();
        setUser(userData);
        
        if (userData.subscription_end_date) {
          const endDate = new Date(userData.subscription_end_date);
          const today = new Date();
          const diffTime = endDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysRemaining(Math.max(0, diffDays));
        }
      }

      // Load stats
      const books = await base44.entities.Book.list();
      const orders = await base44.entities.Order.list();
      const achievements = await base44.entities.Achievement.list();

      setStats({
        totalBooks: books.length,
        activeReaders: orders.filter(o => o.status === 'activated').length,
        writingStreak: 7, // Calculate from actual writing data
        recentAchievements: achievements.slice(0, 3)
      });
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
    setIsLoading(false);
  };

  const quickActions = [
    { icon: Plus, label: "Start New Book", url: createPageUrl("Write"), color: "from-amber-500 to-orange-500" },
    { icon: Edit, label: "Resume Writing", url: createPageUrl("Library"), color: "from-blue-500 to-indigo-500" },
    { icon: Lightbulb, label: "Idea Vault", url: createPageUrl("Tools"), color: "from-purple-500 to-pink-500" },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold literary-text mb-2">
            Welcome back, {user?.full_name || 'Writer'}! ✨
          </h1>
          <p className="text-amber-700 text-lg">Your creative workspace awaits</p>
        </motion.div>

        {/* Account Status Banner */}
        {daysRemaining !== null && (
          <Card className={`mb-8 ${daysRemaining > 5 ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200'} literary-shadow`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${daysRemaining > 5 ? 'bg-green-100' : 'bg-orange-100'}`}>
                    <Calendar className={`w-6 h-6 ${daysRemaining > 5 ? 'text-green-600' : 'text-orange-600'}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg literary-text">
                      {daysRemaining > 0 ? `${daysRemaining} Days of Free Access Remaining` : 'Free Period Ended'}
                    </h3>
                    <p className="text-sm text-amber-700">
                      {daysRemaining > 0 ? 'Make the most of your creative journey!' : 'Contact support to continue'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="literary-shadow bg-gradient-to-br from-amber-100 to-orange-100 border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="w-10 h-10 text-amber-600" />
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-3xl font-bold literary-text mb-1">{stats.totalBooks}</div>
                <div className="text-sm text-amber-700">Total Books</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="literary-shadow bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-10 h-10 text-blue-600" />
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold literary-text mb-1">{stats.activeReaders}</div>
                <div className="text-sm text-blue-700">Active Readers</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="literary-shadow bg-gradient-to-br from-red-100 to-orange-100 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Flame className="w-10 h-10 text-red-600" />
                  <TrendingUp className="w-5 h-5 text-red-600" />
                </div>
                <div className="text-3xl font-bold literary-text mb-1">{stats.writingStreak}</div>
                <div className="text-sm text-red-700">Day Streak 🔥</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="literary-shadow bg-gradient-to-br from-green-100 to-emerald-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Cloud className="w-10 h-10 text-green-600" />
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div className="text-3xl font-bold literary-text mb-1">Synced</div>
                <div className="text-sm text-green-700">Cloud Backup</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Withdrawal System Notice */}
        {user && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 literary-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100 flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg literary-text mb-2">
                    💰 About Earnings & Withdrawals
                  </h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <p>
                      <strong>Demo System:</strong> This app simulates the withdrawal process. For real money transfers, you need:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li><strong>Payment Gateway:</strong> Stripe Connect or PayPal Business API</li>
                      <li><strong>Manual Processing:</strong> Admin manually sends payments via Cash App/PayPal/Bank</li>
                      <li><strong>Compliance:</strong> Banking licenses and regulatory approval</li>
                    </ul>
                    <p className="mt-3 font-semibold text-blue-900">
                      💡 How It Works Now: You request a withdrawal → Admin receives notification → Admin manually sends payment to your account within 2-3 days
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold literary-text mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link to={action.url}>
                  <Card className="literary-shadow hover:shadow-xl transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-bold literary-text text-lg">{action.label}</h3>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile App Info */}
        <div className="mb-8">
          <MobileAppInfo />
        </div>

        {/* Recent Achievements */}
        {stats.recentAchievements.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold literary-text">Recent Achievements</h2>
              <Link to={createPageUrl("Profile")}>
                <Button variant="outline" size="sm" className="border-amber-300">
                  View All
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.recentAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="literary-shadow bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardContent className="p-6">
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <h3 className="font-bold literary-text mb-1">{achievement.title}</h3>
                      <p className="text-sm text-purple-700">{achievement.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}