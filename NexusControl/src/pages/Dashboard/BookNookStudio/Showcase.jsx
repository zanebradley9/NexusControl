import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { BookOpen, Eye, Star, Download, Check, Package, Gift, Calendar, AlertCircle, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Showcase() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookRatings, setBookRatings] = useState({});
  const [selectedBook, setSelectedBook] = useState(null);
  const [orderType, setOrderType] = useState("digital");
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    phone: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setUserLoading(true);
    
    // Load books
    const bookData = await base44.entities.Book.list("-updated_date");
    setBooks(bookData);
    
    // Load ratings
    const ratings = {};
    for (const book of bookData) {
      const reviews = await base44.entities.BookReview.filter({ book_id: book.id });
      if (reviews.length > 0) {
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        ratings[book.id] = { average: avg.toFixed(1), count: reviews.length };
      }
    }
    setBookRatings(ratings);
    setIsLoading(false);

    // Check if user is authenticated
    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Initialize subscription if new user
        if (!userData.subscription_end_date) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 20);
          await base44.auth.updateMe({
            subscription_end_date: endDate.toISOString(),
            is_active: true
          });
          setDaysRemaining(20);
        } else {
          // Calculate days remaining
          const endDate = new Date(userData.subscription_end_date);
          const today = new Date();
          const diffTime = endDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysRemaining(Math.max(0, diffDays));
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    }
    setUserLoading(false);
  };

  const toggleForSale = async (bookId, currentStatus) => {
    const updatedBook = await base44.entities.Book.update(bookId, {
      for_sale: !currentStatus
    });
    
    setBooks(prev => prev.map(book => 
      book.id === bookId ? { ...book, ...updatedBook } : book
    ));
  };

  const togglePhysicalAvailable = async (bookId, currentStatus) => {
    const updatedBook = await base44.entities.Book.update(bookId, {
      physical_available: !currentStatus
    });
    
    setBooks(prev => prev.map(book => 
      book.id === bookId ? { ...book, ...updatedBook } : book
    ));
  };

  const generateActivationCode = () => {
            return 'FREE-' + Math.random().toString(36).substring(2, 15).toUpperCase();
          };

          const downloadBookAsTxt = (book) => {
            if (!book || !book.content) {
              alert("Book content is not available for download.");
              return;
            }
            const blob = new Blob([book.content], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${book.title}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          };

  const handleDownloadClick = (book) => {
    setSelectedBook(book);
    setOrderType("digital");
    setOrderSuccess(null);
    setDialogOpen(true);
  };

  const handleOrder = async () => {
    if (!user) {
      alert("Please sign in to download books");
      return;
    }

    if (!selectedBook) {
      alert("Book information missing");
      return;
    }

    // Validate shipping info for physical orders
    if (orderType === "physical") {
      if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.state || !shippingInfo.zip || !shippingInfo.country || !shippingInfo.phone) {
        alert("Please fill in all shipping details");
        return;
      }
    }

    try {
      const activationCode = generateActivationCode();
      const bookPrice = orderType === "digital" ? 0 : (selectedBook.physical_price || 0);
      const shipping = orderType === "physical" ? (selectedBook.shipping_cost || 5.99) : 0;
      const totalAmount = bookPrice + shipping;
      
      const orderData = {
        book_id: selectedBook.id,
        book_title: selectedBook.title,
        buyer_email: user.email,
        buyer_name: user.full_name,
        order_type: orderType,
        price: bookPrice,
        shipping_cost: shipping,
        total_amount: totalAmount,
        status: orderType === "digital" ? "activated" : "pending",
        activation_code: activationCode,
        activated_at: orderType === "digital" ? new Date().toISOString() : null
      };

      // Add shipping info for physical orders
      if (orderType === "physical") {
        orderData.shipping_address = shippingInfo.address;
        orderData.shipping_city = shippingInfo.city;
        orderData.shipping_state = shippingInfo.state;
        orderData.shipping_zip = shippingInfo.zip;
        orderData.shipping_country = shippingInfo.country;
        orderData.phone_number = shippingInfo.phone;
      }

      const order = await base44.entities.Order.create(orderData);

      // Send confirmation email (skip creating earnings for free downloads)
      try {
        await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: orderType === "digital" 
          ? `Your Book: ${selectedBook.title}`
          : `Order Confirmed: ${selectedBook.title}`,
        body: orderType === "digital"
          ? `Dear ${user.full_name},\n\nThank you for downloading "${selectedBook.title}"!\n\nActivation Code: ${activationCode}\nStatus: Ready to Read\n\nBest regards,\nBookStudio Team`
          : `Dear ${user.full_name},\n\nYour order for "${selectedBook.title}" is confirmed!\n\nOrder Total: $${totalAmount.toFixed(2)}\nShipping to: ${shippingInfo.address}, ${shippingInfo.city}\n\nBest regards,\nBookStudio Team`
        });
      } catch (emailError) {
        console.log("Email sending failed, but order was created:", emailError);
      }

      setOrderSuccess({
        code: activationCode,
        book: selectedBook.title,
        type: orderType,
        totalAmount: totalAmount
      });

      setShippingInfo({
        address: "",
        city: "",
        state: "",
        zip: "",
        country: "",
        phone: ""
      });
    } catch (error) {
      console.error("Error creating order:", error);
      alert(`Failed to complete order: ${error.message || 'Please try again.'}`);
    }
  };

  const completedBooks = books.filter(book => book.status === 'completed' || book.status === 'published');
  const booksForSale = books.filter(book => book.for_sale);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold literary-text mb-2">Book Showcase</h1>
          <p className="text-amber-700 text-lg">Share your completed works - Digital & Physical copies available!</p>
        </div>

        {/* Free Access Banner */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-center md:text-left">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-green-100">
                  <Gift className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-lg literary-text">All Digital Downloads FREE!</h3>
                  <p className="text-sm text-amber-700">
                    Download and read any book instantly - no payment required
                  </p>
                </div>
              </div>
              <Badge className="bg-green-500">100% Free</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="literary-shadow bg-gradient-to-br from-amber-100 to-orange-100 border-amber-200">
            <CardContent className="p-6 text-center">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-amber-600" />
              <div className="text-3xl font-bold literary-text">{completedBooks.length}</div>
              <div className="text-sm text-amber-700">Completed Books</div>
            </CardContent>
          </Card>

          <Card className="literary-shadow bg-gradient-to-br from-green-100 to-emerald-100 border-green-200">
            <CardContent className="p-6 text-center">
              <Download className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <div className="text-3xl font-bold literary-text">{booksForSale.filter(b => (b.digital_price || 0) === 0).length}</div>
              <div className="text-sm text-green-700">Free Digital Downloads</div>
            </CardContent>
          </Card>

          <Card className="literary-shadow bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200">
            <CardContent className="p-6 text-center">
              <Truck className="w-12 h-12 mx-auto mb-4 text-purple-600" />
              <div className="text-3xl font-bold literary-text">{books.filter(b => b.physical_available).length}</div>
              <div className="text-sm text-purple-700">Physical Copies Available</div>
            </CardContent>
          </Card>
        </div>

        {/* Books Management */}
        {user && (
          <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-amber-200 mb-12">
            <CardHeader>
              <CardTitle className="literary-text">Manage Your Books</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-amber-50 rounded-lg animate-pulse">
                      <div className="space-y-2">
                        <div className="h-4 bg-amber-200 rounded w-48"></div>
                        <div className="h-3 bg-amber-100 rounded w-32"></div>
                      </div>
                      <div className="h-8 w-16 bg-amber-200 rounded mt-2 md:mt-0"></div>
                    </div>
                  ))}
                </div>
              ) : completedBooks.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-amber-400" />
                  <h3 className="text-xl font-semibold literary-text mb-2">No Completed Books Yet</h3>
                  <p className="text-amber-700">Finish writing your books to showcase them here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedBooks.map((book, index) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-amber-50 rounded-lg border border-amber-100 gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="font-bold literary-text">{book.title}</h3>
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            {book.status}
                          </Badge>
                          {book.for_sale && (
                            <Badge className="bg-green-100 text-green-800">
                              <Download className="w-3 h-3 mr-1" />
                              Digital
                            </Badge>
                          )}
                          {book.physical_available && (
                            <Badge className="bg-purple-100 text-purple-800">
                              <Truck className="w-3 h-3 mr-1" />
                              Physical
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-amber-700">
                          <span>{book.word_count || 0} words</span>
                          <span>{book.genre?.replace('_', ' ')}</span>
                          {book.digital_price !== undefined && (
                            <span>Digital: ${(book.digital_price || 0).toFixed(2)}</span>
                          )}
                          {book.physical_price && (
                            <span>Physical: ${(book.physical_price || 0).toFixed(2)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`sale-${book.id}`}
                            checked={book.for_sale || false}
                            onCheckedChange={() => toggleForSale(book.id, book.for_sale)}
                          />
                          <Label htmlFor={`sale-${book.id}`} className="text-sm">Digital Available</Label>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`physical-${book.id}`}
                            checked={book.physical_available || false}
                            onCheckedChange={() => togglePhysicalAvailable(book.id, book.physical_available)}
                          />
                          <Label htmlFor={`physical-${book.id}`} className="text-sm">Physical Available</Label>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Public Showcase */}
        {booksForSale.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold literary-text mb-6">Public Showcase - Digital & Physical Copies</h2>
            
            {!user && !userLoading && (
              <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-lg text-blue-900">Create Free Account</h3>
                      <p className="text-sm text-blue-700">Sign up for 20 days of free digital access + order physical books!</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {booksForSale.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full literary-shadow hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-amber-50 border-amber-200 flex flex-col">
                    <CardHeader>
                      <div className="aspect-[3/4] bg-gradient-to-br from-amber-200 to-orange-200 rounded-lg mb-4 flex items-center justify-center relative">
                        {book.cover_image ? (
                          <img
                            src={book.cover_image}
                            alt={book.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <BookOpen className="w-16 h-16 text-amber-600" />
                        )}
                        {(book.digital_price === 0 || book.digital_price === undefined) && (
                          <Badge className="absolute top-2 right-2 bg-green-500 text-white">
                            <Gift className="w-3 h-3 mr-1" />
                            FREE
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="literary-text line-clamp-2">{book.title}</CardTitle>
                      {book.description && (
                        <p className="text-sm text-amber-800 line-clamp-3">{book.description}</p>
                      )}
                    </CardHeader>
                    <CardContent className="flex-grow flex flex-col justify-end space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-semibold text-amber-700">Digital:</span>
                          <div className="text-xl font-bold text-green-600">
                            {(book.digital_price === 0 || book.digital_price === undefined) ? 'FREE' : `$${(book.digital_price || 0).toFixed(2)}`}
                          </div>
                        </div>
                        
                        {book.physical_available && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-amber-700">Physical:</span>
                            <div className="text-xl font-bold text-purple-600">
                              ${(book.physical_price || 0).toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>

                      {bookRatings[book.id] ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[1,2,3,4,5].map(star => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${star <= Math.round(bookRatings[book.id].average) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-amber-700">
                            {bookRatings[book.id].average} ({bookRatings[book.id].count})
                          </span>
                        </div>
                      ) : (
                        <p className="text-sm text-amber-600">No reviews yet</p>
                      )}

                      <Link to={createPageUrl(`BookReviews?id=${book.id}`)}>
                        <Button variant="outline" size="sm" className="w-full mt-2">
                          View Reviews
                        </Button>
                      </Link>

                      <div className="text-xs text-amber-600 space-y-1">
                        <div>📖 {book.word_count || 0} words</div>
                        <div>📚 {book.genre?.replace('_', ' ')}</div>
                      </div>

                      <Dialog open={dialogOpen && selectedBook?.id === book.id} onOpenChange={(open) => {
                        if (!open) {
                          setDialogOpen(false);
                          setOrderSuccess(null);
                          setSelectedBook(null);
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button 
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                            onClick={() => {
                              if (!user) {
                                base44.auth.redirectToLogin(window.location.href);
                                return;
                              }
                              handleDownloadClick(book);
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {user ? ((book.digital_price === 0 || book.digital_price === undefined) ? 'Get FREE' : 'Get Options') : 'Sign Up'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          {orderSuccess ? (
                            <div className="text-center py-6 space-y-4">
                              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <Check className="w-8 h-8 text-green-600" />
                              </div>
                              <h3 className="text-xl font-bold text-green-600">
                                {orderSuccess.type === 'digital' ? 'Book Downloaded!' : 'Order Confirmed!'}
                              </h3>
                              {orderSuccess.type === 'digital' ? (
                                <>
                                <div className="bg-amber-50 p-4 rounded-lg space-y-2">
                                  <p className="text-sm font-semibold">Activation Code:</p>
                                  <p className="text-2xl font-mono font-bold text-amber-900">{orderSuccess.code}</p>
                                  <p className="text-xs text-amber-600">Check your email for details</p>
                                </div>

                                <div className="space-y-2">
                                  <Link to={createPageUrl(`ReadBook?id=${selectedBook.id}`)}>
                                    <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white">
                                      <BookOpen className="w-4 h-4 mr-2" />
                                      Read Now
                                    </Button>
                                  </Link>

                                  {selectedBook.content && (
                                                                            <Button variant="outline" className="w-full" onClick={() => downloadBookAsTxt(selectedBook)}>
                                                                              <Download className="w-4 h-4 mr-2" />
                                                                              Download as .txt File
                                                                            </Button>
                                                                          )}
                                </div>

                                </>
                              ) : (
                                <>
                                  <div className="bg-purple-50 p-4 rounded-lg space-y-2">
                                    <p className="text-sm font-semibold">Order Total:</p>
                                    <p className="text-2xl font-bold text-purple-900">${orderSuccess.totalAmount.toFixed(2)}</p>
                                    <p className="text-xs text-purple-600">Your book will ship within 2-3 business days</p>
                                  </div>
                                </>
                              )}
                              <Button 
                                onClick={() => {
                                  setDialogOpen(false);
                                  setOrderSuccess(null);
                                  setSelectedBook(null);
                                }}
                                className="w-full"
                              >
                                Close
                              </Button>
                            </div>
                          ) : selectedBook && (
                            <>
                              <DialogHeader>
                                <DialogTitle className="literary-text">{selectedBook.title}</DialogTitle>
                                <DialogDescription>
                                  Choose how you want to enjoy this book
                                </DialogDescription>
                              </DialogHeader>
                              
                              <Tabs value={orderType} onValueChange={setOrderType} className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                  <TabsTrigger value="digital">
                                    <Download className="w-4 h-4 mr-2" />
                                    Digital
                                  </TabsTrigger>
                                  {selectedBook.physical_available && (
                                    <TabsTrigger value="physical">
                                      <Truck className="w-4 h-4 mr-2" />
                                      Physical
                                    </TabsTrigger>
                                  )}
                                </TabsList>
                                
                                <TabsContent value="digital" className="space-y-4">
                                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                      <Download className="w-5 h-5 text-green-600" />
                                      <span className="font-bold text-green-700 text-lg">FREE</span>
                                    </div>
                                    <p className="text-xs text-green-600 text-center">
                                      Instant download - Read on any device
                                    </p>
                                  </div>

                                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                    <p className="text-sm text-amber-800 text-center">
                                      <strong>Downloading as:</strong> {user?.full_name} ({user?.email})
                                    </p>
                                  </div>
                                </TabsContent>
                                
                                {selectedBook.physical_available && (
                                  <TabsContent value="physical" className="space-y-4">
                                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-purple-700">Book Price:</span>
                                        <span className="font-bold text-purple-900">${(selectedBook.physical_price || 0).toFixed(2)}</span>
                                      </div>
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-purple-700">Shipping:</span>
                                        <span className="font-bold text-purple-900">${(selectedBook.shipping_cost || 5.99).toFixed(2)}</span>
                                      </div>
                                      <div className="border-t border-purple-300 pt-2 mt-2">
                                        <div className="flex items-center justify-between">
                                          <span className="font-semibold text-purple-700">Total:</span>
                                          <span className="font-bold text-purple-900 text-lg">
                                            ${((selectedBook.physical_price || 0) + (selectedBook.shipping_cost || 5.99)).toFixed(2)}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-3">
                                      <div>
                                        <Label>Full Address</Label>
                                        <Input
                                          placeholder="123 Main Street, Apt 4B"
                                          value={shippingInfo.address}
                                          onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                                        />
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <Label>City</Label>
                                          <Input
                                            placeholder="New York"
                                            value={shippingInfo.city}
                                            onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                                          />
                                        </div>
                                        <div>
                                          <Label>State</Label>
                                          <Input
                                            placeholder="NY"
                                            value={shippingInfo.state}
                                            onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                                          />
                                        </div>
                                      </div>

                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <Label>ZIP Code</Label>
                                          <Input
                                            placeholder="10001"
                                            value={shippingInfo.zip}
                                            onChange={(e) => setShippingInfo({...shippingInfo, zip: e.target.value})}
                                          />
                                        </div>
                                        <div>
                                          <Label>Country</Label>
                                          <Input
                                            placeholder="USA"
                                            value={shippingInfo.country}
                                            onChange={(e) => setShippingInfo({...shippingInfo, country: e.target.value})}
                                          />
                                        </div>
                                      </div>

                                      <div>
                                        <Label>Phone Number</Label>
                                        <Input
                                          placeholder="+1 (555) 123-4567"
                                          value={shippingInfo.phone}
                                          onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                                        />
                                      </div>
                                    </div>

                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                      <p className="text-xs text-blue-700 text-center">
                                        📦 Delivered within 5-7 business days
                                      </p>
                                    </div>
                                  </TabsContent>
                                )}
                              </Tabs>

                              <DialogFooter>
                                <Button
                                  onClick={handleOrder}
                                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                                >
                                  {orderType === 'digital' ? (
                                    <>
                                      <Download className="w-4 h-4 mr-2" />
                                      Download FREE
                                    </>
                                  ) : (
                                    <>
                                      <Truck className="w-4 h-4 mr-2" />
                                      Order Physical Book
                                    </>
                                  )}
                                </Button>
                              </DialogFooter>
                            </>
                          )}
                        </DialogContent>
                      </Dialog>
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