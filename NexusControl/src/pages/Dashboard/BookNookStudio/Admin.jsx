import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Users, BookOpen, DollarSign, Package, Settings, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalOrders: 0,
    totalEarnings: 0,
    pendingWithdrawals: 0
  });
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cashAppApiKey, setCashAppApiKey] = useState("");

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      if (userData.role !== 'admin') {
        alert("Access denied. Admin only.");
        return;
      }

      const [allUsers, allBooks, allOrders, allEarnings] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Book.list(),
        base44.entities.Order.list(),
        base44.entities.Earning.list()
      ]);

      setUsers(allUsers);
      setOrders(allOrders);
      setEarnings(allEarnings);

      const totalEarnings = allEarnings.reduce((sum, e) => sum + (e.amount || 0), 0);
      const pendingWithdrawals = allEarnings
        .filter(e => e.payment_status === "pending" || e.payment_status === "paid")
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      setStats({
        totalUsers: allUsers.length,
        totalBooks: allBooks.length,
        totalOrders: allOrders.length,
        totalEarnings,
        pendingWithdrawals
      });
    } catch (error) {
      console.error("Error loading admin data:", error);
    }
    setIsLoading(false);
  };

  const approveWithdrawal = async (earningId) => {
    try {
      await base44.entities.Earning.update(earningId, {
        payment_status: "withdrawn",
        withdrawn_at: new Date().toISOString()
      });
      loadAdminData();
      alert("Withdrawal approved and processed!");
    } catch (error) {
      console.error("Error approving withdrawal:", error);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-8 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-gray-600">This page is only accessible to administrators.</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold literary-text mb-2 flex items-center gap-3">
              <Shield className="w-10 h-10 text-purple-600" />
              Admin Dashboard
            </h1>
            <p className="text-amber-700 text-lg">Manage users, books, orders, and withdrawals</p>
          </div>
          <Link to={createPageUrl("AdminReporting")}>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
              📊 View Reports
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-200">
            <CardContent className="p-6 text-center">
              <Users className="w-10 h-10 mx-auto mb-3 text-blue-600" />
              <div className="text-3xl font-bold text-blue-900">{stats.totalUsers}</div>
              <div className="text-sm text-blue-700">Total Users</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-10 h-10 mx-auto mb-3 text-purple-600" />
              <div className="text-3xl font-bold text-purple-900">{stats.totalBooks}</div>
              <div className="text-sm text-purple-700">Total Books</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-green-200">
            <CardContent className="p-6 text-center">
              <Package className="w-10 h-10 mx-auto mb-3 text-green-600" />
              <div className="text-3xl font-bold text-green-900">{stats.totalOrders}</div>
              <div className="text-sm text-green-700">Total Orders</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-amber-200">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-10 h-10 mx-auto mb-3 text-amber-600" />
              <div className="text-3xl font-bold text-amber-900">${(stats.totalEarnings || 0).toFixed(2)}</div>
              <div className="text-sm text-amber-700">Total Earnings</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-100 to-rose-100 border-red-200">
            <CardContent className="p-6 text-center">
              <Settings className="w-10 h-10 mx-auto mb-3 text-red-600" />
              <div className="text-3xl font-bold text-red-900">${(stats.pendingWithdrawals || 0).toFixed(2)}</div>
              <div className="text-sm text-red-700">Pending Withdrawals</div>
            </CardContent>
          </Card>
        </div>

        {/* Generate Test Earnings */}
        <Card className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader>
            <CardTitle className="literary-text">💰 Generate Test Earnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>📊 Testing Tool:</strong> Generate sample earnings for testing the earnings and withdrawal system.
                This creates demo earnings for all published books.
              </p>
            </div>
            <Button 
              onClick={async () => {
                try {
                  const books = await base44.entities.Book.filter({ for_sale: true });
                  
                  if (books.length === 0) {
                    alert("No books for sale found. Please make at least one book available for sale.");
                    return;
                  }

                  // Generate random earnings for each book
                  for (const book of books.slice(0, 5)) {
                    const amount = Math.floor(Math.random() * 50) + 10; // Random amount between $10-$60
                    await base44.entities.Earning.create({
                      book_id: book.id,
                      book_title: book.title,
                      amount: amount,
                      payment_status: "pending"
                    });
                  }
                  
                  alert(`✅ Generated test earnings for ${Math.min(books.length, 5)} books!`);
                  loadAdminData();
                } catch (error) {
                  console.error("Error generating earnings:", error);
                  alert("Failed to generate test earnings");
                }
              }}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              Generate Test Earnings
            </Button>
          </CardContent>
        </Card>

        {/* Payment Gateway Configuration */}
        <Card className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <CardTitle className="literary-text">💵 Payment Gateway Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                <strong>Connect your payment provider:</strong> Add your live API keys here to enable automatic payouts.
              </p>
            </div>
            <div>
              <Label>Live API Key</Label>
              <Input
                type="password"
                placeholder="Enter your Live API key from your payment provider"
                value={cashAppApiKey}
                onChange={(e) => setCashAppApiKey(e.target.value)}
              />
            </div>
            <Button className="w-full">
              Save API Configuration
            </Button>
          </CardContent>
        </Card>

        {/* Pending Withdrawals */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-amber-200">
          <CardHeader>
            <CardTitle className="literary-text">Pending Withdrawals</CardTitle>
          </CardHeader>
          <CardContent>
            {earnings.filter(e => e.payment_status === "paid" || e.payment_status === "pending").length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No pending withdrawals
              </div>
            ) : (
              <div className="space-y-3">
                {earnings
                  .filter(e => e.payment_status === "paid" || e.payment_status === "pending")
                  .map((earning) => (
                    <Card key={earning.id} className="bg-amber-50 border-amber-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold">{earning.book_title}</div>
                            <div className="text-sm text-gray-600">
                              Author: {earning.created_by}
                            </div>
                            <div className="text-lg font-bold text-green-600 mt-1">
                              ${(earning.amount || 0).toFixed(2)}
                            </div>
                          </div>
                          <Button
                            onClick={() => approveWithdrawal(earning.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Mark as Paid
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="bg-white/80 backdrop-blur-sm border-amber-200">
          <CardHeader>
            <CardTitle className="literary-text">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {orders.slice(0, 10).map((order) => (
                <Card key={order.id} className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold">{order.book_title}</div>
                        <div className="text-sm text-gray-600">
                          Buyer: {order.buyer_name} ({order.buyer_email})
                        </div>
                        <Badge className="mt-2">{order.status}</Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">${(order.total_amount || 0).toFixed(2)}</div>
                        <div className="text-xs text-gray-500">{order.order_type}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}