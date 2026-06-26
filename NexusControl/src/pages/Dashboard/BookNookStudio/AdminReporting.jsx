import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, TrendingUp, Users, DollarSign, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

export default function AdminReporting() {
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState([]);
  const [bookSalesData, setBookSalesData] = useState([]);
  const [userGrowthData, setUserGrowthData] = useState([]);
  const [earningsBreakdown, setEarningsBreakdown] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalStats, setTotalStats] = useState({
    totalSales: 0,
    totalEarnings: 0,
    totalUsers: 0,
    totalBooks: 0
  });

  useEffect(() => {
    loadReportingData();
  }, []);

  const loadReportingData = async () => {
    setIsLoading(true);
    try {
      // Fetch all data
      const orders = await base44.entities.Order.list();
      const books = await base44.entities.Book.list();
      const users = await base44.entities.User.list();
      const earnings = await base44.entities.Earning.list();
      const reviews = await base44.entities.BookReview.list();

      // Calculate total stats
      setTotalStats({
        totalSales: orders.length,
        totalEarnings: earnings.reduce((sum, e) => sum + e.amount, 0),
        totalUsers: users.length,
        totalBooks: books.length
      });

      // Average Rating
      if (reviews.length > 0) {
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        setAverageRating(avgRating.toFixed(2));
      }

      // Sales Over Time (last 7 days)
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const ordersOnDay = orders.filter(o => {
          const orderDate = new Date(o.created_date).toISOString().split('T')[0];
          return orderDate === dateStr;
        });

        last7Days.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sales: ordersOnDay.length,
          earnings: ordersOnDay.reduce((sum, o) => sum + (o.total_amount || 0), 0)
        });
      }
      setSalesData(last7Days);

      // Best-Selling Books (top 5)
      const bookSales = {};
      orders.forEach(order => {
        if (bookSales[order.book_title]) {
          bookSales[order.book_title]++;
        } else {
          bookSales[order.book_title] = 1;
        }
      });

      const topBooks = Object.entries(bookSales)
        .map(([title, count]) => ({ name: title.substring(0, 20), sales: count }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);
      setBookSalesData(topBooks);

      // User Growth (last 7 days)
      const userGrowth = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const usersOnDay = users.filter(u => {
          const userDate = new Date(u.created_date).toISOString().split('T')[0];
          return userDate === dateStr;
        });

        userGrowth.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          users: usersOnDay.length
        });
      }
      setUserGrowthData(userGrowth);

      // Earnings Breakdown by Status
      const pendingEarnings = earnings.filter(e => e.payment_status === 'pending').reduce((sum, e) => sum + e.amount, 0);
      const paidEarnings = earnings.filter(e => e.payment_status === 'paid').reduce((sum, e) => sum + e.amount, 0);
      const withdrawnEarnings = earnings.filter(e => e.payment_status === 'withdrawn').reduce((sum, e) => sum + e.amount, 0);

      setEarningsBreakdown([
        { name: 'Pending', value: pendingEarnings, color: '#f59e0b' },
        { name: 'Paid', value: paidEarnings, color: '#10b981' },
        { name: 'Withdrawn', value: withdrawnEarnings, color: '#6366f1' }
      ]);

    } catch (error) {
      console.error("Error loading reporting data:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-6">
            {Array(4).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-100 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl("Admin")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl font-bold literary-text">📊 Admin Reporting Dashboard</h1>
            <p className="text-amber-700 text-lg">Comprehensive analytics and insights</p>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 font-semibold">Total Sales</p>
                    <p className="text-3xl font-bold text-blue-900">{totalStats.totalSales}</p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 font-semibold">Total Earnings</p>
                    <p className="text-3xl font-bold text-green-900">${totalStats.totalEarnings.toFixed(2)}</p>
                  </div>
                  <DollarSign className="w-10 h-10 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 font-semibold">Total Users</p>
                    <p className="text-3xl font-bold text-purple-900">{totalStats.totalUsers}</p>
                  </div>
                  <Users className="w-10 h-10 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-600 font-semibold">Avg Rating</p>
                    <p className="text-3xl font-bold text-yellow-900">{averageRating || 'N/A'}</p>
                  </div>
                  <Star className="w-10 h-10 text-yellow-600 fill-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sales Over Time */}
        <Card className="mb-8 literary-shadow">
          <CardHeader>
            <CardTitle className="literary-text">📈 Sales & Earnings (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} name="Sales" />
                <Line yAxisId="right" type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={2} name="Earnings ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Best-Selling Books */}
          <Card className="literary-shadow">
            <CardHeader>
              <CardTitle className="literary-text">📚 Top 5 Best-Selling Books</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bookSalesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="#f59e0b" name="Sales" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* User Growth */}
          <Card className="literary-shadow">
            <CardHeader>
              <CardTitle className="literary-text">👥 User Growth (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} name="New Users" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Breakdown */}
        <Card className="literary-shadow">
          <CardHeader>
            <CardTitle className="literary-text">💰 Earnings Breakdown by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={earningsBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {earningsBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}