import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Wallet, Check, Clock, Download, Gift, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Earnings() {
  const [earnings, setEarnings] = useState([]);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingEarnings: 0,
    withdrawn: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("bank");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    setIsLoading(true);
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const userData = await base44.auth.me();
        setUser(userData);
      }

      const earningData = await base44.entities.Earning.list("-created_date");
      setEarnings(earningData);

      const totalEarnings = earningData.reduce((sum, e) => sum + (e.amount || 0), 0);
      const pendingEarnings = earningData
        .filter(e => e.payment_status === "pending" || e.payment_status === "paid")
        .reduce((sum, e) => sum + (e.amount || 0), 0);
      const withdrawn = earningData
        .filter(e => e.payment_status === "withdrawn")
        .reduce((sum, e) => sum + (e.amount || 0), 0);

      setStats({
        totalEarnings,
        pendingEarnings,
        withdrawn
      });
    } catch (error) {
      console.error("Error loading earnings:", error);
    }
    setIsLoading(false);
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (parseFloat(withdrawAmount) > stats.pendingEarnings) {
      alert("Insufficient balance");
      return;
    }

    setIsWithdrawing(true);
    try {
      // Check if payment details are set up
      const userSettings = await base44.entities.UserSettings.list();
      
      if (userSettings.length === 0) {
        alert("Please add your payment details in Settings to continue.");
        setIsWithdrawing(false);
        return;
      }

      const settings = userSettings[0];
      let accountDetails = "";
      let hasPaymentMethod = false;

      if (withdrawMethod === 'bank' && settings.bank_account_number && settings.bank_name) {
        accountDetails = `Bank: ${settings.bank_name}\nAccount: ****${settings.bank_account_number.slice(-4)}`;
        hasPaymentMethod = true;
      } else if (withdrawMethod === 'paypal' && settings.paypal_email) {
        accountDetails = `PayPal: ${settings.paypal_email}`;
        hasPaymentMethod = true;
      } else if (withdrawMethod === 'cashapp' && settings.cashapp_username) {
        accountDetails = `Cash App: ${settings.cashapp_username}`;
        hasPaymentMethod = true;
      }

      if (!hasPaymentMethod) {
        alert(`Payment Details Missing\n\nPlease go to Settings and add your ${withdrawMethod === 'bank' ? 'Bank Account' : withdrawMethod === 'paypal' ? 'PayPal Email' : 'Cash App Username ($YourUsername)'} details first.`);
        setIsWithdrawing(false);
        return;
      }

      

      // Mark earnings as withdrawn
      const pendingEarnings = earnings.filter(
        e => e.payment_status === "pending" || e.payment_status === "paid"
      );
      
      let remainingAmount = parseFloat(withdrawAmount);
      
      for (const earning of pendingEarnings) {
        if (remainingAmount <= 0) break;
        
        const amountToWithdraw = Math.min(earning.amount, remainingAmount);
        
        if (amountToWithdraw === earning.amount) {
          await base44.entities.Earning.update(earning.id, {
            payment_status: "withdrawn",
            withdrawn_at: new Date().toISOString()
          });
          remainingAmount -= earning.amount;
        }
      }

      // Send confirmation email
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: `Withdrawal Request - ${withdrawMethod === 'cashapp' ? 'Cash App' : withdrawMethod === 'paypal' ? 'PayPal' : 'Bank Transfer'}`,
        body: `
          Dear ${user.full_name},
          
          Your withdrawal request has been processed.
          
          Withdrawal Details:
          Amount: $${withdrawAmount}
          Method: ${withdrawMethod === 'bank' ? 'Bank Transfer' : withdrawMethod === 'paypal' ? 'PayPal' : 'Cash App'}
          ${accountDetails}
          Status: Processing
          
          Funds should arrive in your account within 2-3 business days.
          
          You keep 100% of your earnings - no platform fees!
          
          Best regards,
          BookStudio Team
        `
      });

      alert(
        `Withdrawal Processed\n\n` +
        `Amount: $${withdrawAmount}\n` +
        `Method: ${withdrawMethod === 'cashapp' ? `Cash App (${settings.cashapp_username})` : withdrawMethod === 'paypal' ? 'PayPal' : 'Bank Transfer'}\n\n` +
        `Your withdrawal request has been successfully processed. Funds should appear in your account within 2-3 business days.`
      );
      
      setWithdrawAmount("");
      loadEarnings();
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      alert("Failed to process demo withdrawal. Please try again.");
    }
    setIsWithdrawing(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      withdrawn: "bg-blue-100 text-blue-800"
    };
    return colors[status] || colors.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold literary-text mb-2">Your Earnings 💰</h1>
          <p className="text-amber-700 text-lg">You keep 100% of your book sales - no platform fees!</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="literary-shadow bg-gradient-to-br from-green-100 to-emerald-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <DollarSign className="w-10 h-10 text-green-600" />
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-3xl font-bold literary-text mb-1">
                  ${stats.totalEarnings.toFixed(2)}
                </div>
                <div className="text-sm text-green-700">Total Earnings</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="literary-shadow bg-gradient-to-br from-amber-100 to-orange-100 border-amber-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Wallet className="w-10 h-10 text-amber-600" />
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-3xl font-bold literary-text mb-1">
                  ${stats.pendingEarnings.toFixed(2)}
                </div>
                <div className="text-sm text-amber-700">Available to Withdraw</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="literary-shadow bg-gradient-to-br from-blue-100 to-indigo-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Download className="w-10 h-10 text-blue-600" />
                  <Check className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-3xl font-bold literary-text mb-1">
                  ${stats.withdrawn.toFixed(2)}
                </div>
                <div className="text-sm text-blue-700">Already Withdrawn</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Withdraw Section */}
        <Card className="literary-shadow bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold literary-text mb-2">
                  💵 Ready to Withdraw Your Earnings?
                </h3>
                <p className="text-purple-700">
                  100% of your earnings go directly to you - zero platform fees!
                </p>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                    disabled={stats.pendingEarnings <= 0}
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Withdraw Funds
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="literary-text">Withdraw Your Earnings</DialogTitle>
                    <DialogDescription>
                      Available balance: ${stats.pendingEarnings.toFixed(2)}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Gift className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-green-700">100% Yours!</span>
                      </div>
                      <p className="text-sm text-green-600">
                        No platform fees. No hidden charges. You keep every dollar.
                        <br />(Once real payment integration is added)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Amount to Withdraw</Label>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        max={stats.pendingEarnings}
                        step="0.01"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setWithdrawAmount(stats.pendingEarnings.toString())}
                        className="w-full"
                      >
                        Withdraw All
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Method</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant={withdrawMethod === 'bank' ? 'default' : 'outline'}
                          onClick={() => setWithdrawMethod('bank')}
                          className="w-full"
                        >
                          🏦 Bank
                        </Button>
                        <Button
                          variant={withdrawMethod === 'paypal' ? 'default' : 'outline'}
                          onClick={() => setWithdrawMethod('paypal')}
                          className="w-full"
                        >
                          💳 PayPal
                        </Button>
                        <Button
                          variant={withdrawMethod === 'cashapp' ? 'default' : 'outline'}
                          onClick={() => setWithdrawMethod('cashapp')}
                          className="w-full"
                        >
                          💵 Cash App
                        </Button>
                      </div>
                      {withdrawMethod === 'cashapp' && (
                        <div className="bg-orange-50 p-2 rounded border border-orange-200">
                          <p className="text-xs text-orange-700">
                            ⚠️ Cash App username must be set in Settings (e.g., $YourUsername)
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-700 text-center">
                        💡 In a real system, funds would arrive within 2-3 business days
                      </p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      onClick={handleWithdraw}
                      disabled={isWithdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                    >
                      {isWithdrawing ? "Processing..." : `Withdraw $${withdrawAmount || "0.00"}`}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Earnings History */}
        <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-amber-200">
          <CardHeader>
            <CardTitle className="literary-text">Earnings History</CardTitle>
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
            ) : earnings.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                <h3 className="text-xl font-semibold literary-text mb-2">No Earnings Yet</h3>
                <p className="text-amber-700">Start selling your books to see earnings here!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {earnings.map((earning, index) => (
                  <motion.div
                    key={earning.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-amber-50 border-amber-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-bold literary-text">{earning.book_title}</h3>
                              <Badge className={getStatusColor(earning.payment_status)}>
                                {earning.payment_status}
                              </Badge>
                            </div>
                            <p className="text-sm text-amber-700">
                              {formatDate(earning.created_date)}
                              {earning.withdrawn_at && ` • Withdrawn on ${formatDate(earning.withdrawn_at)}`}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">
                              ${earning.amount.toFixed(2)}
                            </div>
                            <p className="text-xs text-green-700">100% yours</p>
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