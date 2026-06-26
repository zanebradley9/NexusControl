
import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Calendar, User, Mail, Check, Gift, XCircle, AlertTriangle, Clock } from "lucide-react";
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

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const userData = await base44.auth.me();
        setUser(userData);
      }

      const data = await base44.entities.Order.list("-created_date");
      setOrders(data);
    } catch (error) {
      console.error("Error loading orders:", error);
      setOrders([]);
    }
    setIsLoading(false);
  };

  const denyOrder = async (order) => {
    try {
      // Update order status to cancelled
      await base44.entities.Order.update(order.id, {
        status: "cancelled"
      });

      // Send cancellation email
      await base44.integrations.Core.SendEmail({
        to: order.buyer_email,
        subject: `Order Cancelled: ${order.book_title}`,
        body: `
          Dear ${order.buyer_name},
          
          Your order for "${order.book_title}" has been cancelled.
          
          Order ID: ${order.id}
          Activation Code: ${order.activation_code}
          Status: Cancelled
          
          If you have any questions, please contact support.
          
          Best regards,
          BookStudio Team
        `
      });

      // Reload orders
      loadOrders();
      
      alert("Order has been denied and buyer has been notified.");
    } catch (error) {
      console.error("Error denying order:", error);
      alert("Failed to deny order. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      activated: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status] || colors.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      activated: <Check className="w-4 h-4" />,
      completed: <Check className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activeOrders = orders.filter(o => o.status !== 'cancelled');
  const cancelledOrders = orders.filter(o => o.status === 'cancelled');

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold literary-text mb-2">Order Management</h1>
          <p className="text-amber-700 text-lg">Track and manage book access requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="literary-shadow bg-gradient-to-br from-green-100 to-emerald-100 border-green-200">
            <CardContent className="p-6 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <div className="text-3xl font-bold literary-text">{orders.length}</div>
              <div className="text-sm text-green-700">Total Downloads</div>
            </CardContent>
          </Card>

          <Card className="literary-shadow bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <Check className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <div className="text-3xl font-bold literary-text">
                {orders.filter(o => o.status === 'activated' || o.status === 'completed').length}
              </div>
              <div className="text-sm text-purple-700">Active Readers</div>
            </CardContent>
          </Card>

          <Card className="literary-shadow bg-gradient-to-br from-amber-100 to-orange-100 border-amber-200">
            <CardContent className="p-6 text-center">
              <Gift className="w-12 h-12 mx-auto mb-4 text-amber-600" />
              <div className="text-3xl font-bold literary-text">100%</div>
              <div className="text-sm text-amber-700">FREE Access</div>
            </CardContent>
          </Card>

          <Card className="literary-shadow bg-gradient-to-br from-red-100 to-rose-100 border-red-200">
            <CardContent className="p-6 text-center">
              <XCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
              <div className="text-3xl font-bold literary-text">{cancelledOrders.length}</div>
              <div className="text-sm text-red-700">Denied Orders</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Orders List */}
        <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-amber-200 mb-8">
          <CardHeader>
            <CardTitle className="literary-text">Active Downloads</CardTitle>
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
            ) : activeOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                <h3 className="text-xl font-semibold literary-text mb-2">No Active Orders</h3>
                <p className="text-amber-700">Active downloads will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-amber-50 border-amber-200">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-lg literary-text">{order.book_title}</h3>
                              <Badge className={getStatusColor(order.status)}>
                                <span className="flex items-center gap-1">
                                  {getStatusIcon(order.status)}
                                  {order.status}
                                </span>
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-amber-700">
                                <User className="w-4 h-4" />
                                <span>{order.buyer_name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-amber-700">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">{order.buyer_email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-amber-700">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(order.created_date)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-green-700 font-semibold">
                                <Gift className="w-4 h-4" />
                                <span>FREE Access</span>
                              </div>
                            </div>

                            {order.activation_code && (
                              <div className="bg-white p-3 rounded-lg border border-amber-200">
                                <p className="text-xs text-amber-600 mb-1">Activation Code:</p>
                                <p className="font-mono font-bold text-amber-900">{order.activation_code}</p>
                              </div>
                            )}

                            {order.activated_at && (
                              <div className="flex items-center gap-2 text-xs text-green-600">
                                <Check className="w-3 h-3" />
                                <span>Activated on {formatDate(order.activated_at)}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="whitespace-nowrap"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Deny Order
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-600" />
                                    Deny This Order?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="space-y-2">
                                    <p>You are about to deny the order for:</p>
                                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                                      <p className="font-bold text-amber-900">{order.book_title}</p>
                                      <p className="text-sm text-amber-700">Reader: {order.buyer_name}</p>
                                      <p className="text-sm text-amber-700">Email: {order.buyer_email}</p>
                                    </div>
                                    <p className="text-red-600 font-semibold">
                                      The buyer will be notified via email and will lose access to this book.
                                    </p>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => denyOrder(order)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Yes, Deny Order
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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

        {/* Cancelled Orders */}
        {cancelledOrders.length > 0 && (
          <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-red-200">
            <CardHeader>
              <CardTitle className="literary-text flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Denied Orders ({cancelledOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cancelledOrders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-red-50 border-red-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold literary-text">{order.book_title}</h3>
                              <Badge className={getStatusColor(order.status)}>
                                <span className="flex items-center gap-1">
                                  <XCircle className="w-3 h-3" />
                                  Denied
                                </span>
                              </Badge>
                            </div>
                            <p className="text-sm text-red-700">
                              {order.buyer_name} ({order.buyer_email})
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              Originally requested: {formatDate(order.created_date)}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
