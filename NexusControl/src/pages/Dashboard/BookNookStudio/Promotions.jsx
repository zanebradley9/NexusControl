import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone, Calendar, Tag, Percent, PlusCircle } from "lucide-react";
import { format } from "date-fns";

export default function Promotions() {
  const [promotions, setPromotions] = useState([]);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPromo, setNewPromo] = useState({
    book_id: "",
    discount_percentage: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const promoData = await base44.entities.Promotion.list("-start_date");
      setPromotions(promoData);

      const bookData = await base44.entities.Book.list();
      setBooks(bookData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPromo({ ...newPromo, [name]: value });
  };
  
  const handleBookChange = (value) => {
      setNewPromo({...newPromo, book_id: value});
  }

  const handleCreatePromotion = async (e) => {
    e.preventDefault();
    if (!newPromo.book_id || !newPromo.discount_percentage || !newPromo.start_date || !newPromo.end_date) {
      alert("Please fill out all fields.");
      return;
    }
    
    const selectedBook = books.find(b => b.id === newPromo.book_id);
    if (!selectedBook) {
        alert("Selected book not found.");
        return;
    }

    try {
      await base44.entities.Promotion.create({
        ...newPromo,
        book_title: selectedBook.title,
        discount_percentage: parseInt(newPromo.discount_percentage),
        status: new Date(newPromo.start_date) > new Date() ? "scheduled" : "active",
      });
      alert("Promotion created successfully!");
      setNewPromo({ book_id: "", discount_percentage: "", start_date: "", end_date: "" });
      loadData();
    } catch (error) {
      console.error("Error creating promotion:", error);
      alert("Failed to create promotion.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold literary-text mb-2 flex items-center gap-3">
            <Megaphone className="w-8 h-8 text-indigo-500" /> Book Promotions
          </h1>
          <p className="text-amber-700 text-lg">Schedule discounts and special offers for your books.</p>
        </div>

        <Card className="mb-8 literary-shadow bg-white/80 backdrop-blur-sm border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-500" />
              Create a New Promotion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreatePromotion} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="book_id">Book</Label>
                  <Select onValueChange={handleBookChange} value={newPromo.book_id}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a book to promote" />
                    </SelectTrigger>
                    <SelectContent>
                      {books.map((book) => (
                        <SelectItem key={book.id} value={book.id}>
                          {book.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discount_percentage">Discount (%)</Label>
                  <Input
                    id="discount_percentage"
                    name="discount_percentage"
                    type="number"
                    placeholder="e.g., 25"
                    value={newPromo.discount_percentage}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={newPromo.start_date}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={newPromo.end_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600">
                Schedule Promotion
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-amber-200">
          <CardHeader>
            <CardTitle>Your Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading promotions...</p>
            ) : promotions.length === 0 ? (
              <p className="text-center text-gray-500">You haven't scheduled any promotions yet.</p>
            ) : (
              <div className="space-y-4">
                {promotions.map((promo) => (
                  <div key={promo.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{promo.book_title}</h3>
                      <p className="text-sm text-gray-600">
                        <Percent className="w-4 h-4 inline-block mr-1" />
                        {promo.discount_percentage}% off
                      </p>
                      <p className="text-sm text-gray-600">
                        <Calendar className="w-4 h-4 inline-block mr-1" />
                        {format(new Date(promo.start_date), "MMM d, yyyy")} - {format(new Date(promo.end_date), "MMM d, yyyy")}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(promo.status)}`}>
                      {promo.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}