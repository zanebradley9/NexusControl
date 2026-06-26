import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { BookOpen, Plus, Edit, Eye, DollarSign, Clock, Trash2, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

export default function Library() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bookRatings, setBookRatings] = useState({});

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    setIsLoading(true);
    const data = await base44.entities.Book.list("-updated_date");
    setBooks(data);
    
    // Load ratings for all books
    const ratings = {};
    for (const book of data) {
      const reviews = await base44.entities.BookReview.filter({ book_id: book.id });
      if (reviews.length > 0) {
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        ratings[book.id] = { average: avg.toFixed(1), count: reviews.length };
      }
    }
    setBookRatings(ratings);
    setIsLoading(false);
  };

  const deleteBook = async (bookId) => {
    if (window.confirm("Are you sure you want to delete this book? This action cannot be undone.")) {
      try {
        await base44.entities.Book.delete(bookId);
        setBooks(prevBooks => prevBooks.filter(book => book.id !== bookId));
      } catch (error) {
        console.error("Error deleting book:", error);
        alert("There was an error deleting the book. Please try again.");
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: "bg-amber-100 text-amber-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      published: "bg-purple-100 text-purple-800"
    };
    return colors[status] || colors.draft;
  };

  const getGenreColor = (genre) => {
    const colors = {
      fiction: "bg-rose-100 text-rose-800",
      non_fiction: "bg-indigo-100 text-indigo-800",
      poetry: "bg-purple-100 text-purple-800",
      mystery: "bg-gray-100 text-gray-800",
      romance: "bg-pink-100 text-pink-800",
      adventure: "bg-orange-100 text-orange-800",
      biography: "bg-teal-100 text-teal-800",
      self_help: "bg-emerald-100 text-emerald-800",
      educational: "bg-cyan-100 text-cyan-800",
      other: "bg-slate-100 text-slate-800"
    };
    return colors[genre] || colors.other;
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold literary-text mb-2">Your Library</h1>
            <p className="text-amber-700 text-sm md:text-base lg:text-lg">A collection of your creative works</p>
          </div>
          <Link to={createPageUrl("Write")}>
            <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white literary-shadow">
              <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Start Writing
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i} className="literary-shadow animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-amber-200 rounded w-3/4"></div>
                  <div className="h-3 bg-amber-100 rounded w-1/2 mt-2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-amber-100 rounded mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-amber-200 rounded"></div>
                    <div className="h-3 bg-amber-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : books.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 md:py-16"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6 literary-float">
              <BookOpen className="w-10 h-10 md:w-12 md:h-12 text-amber-700" />
            </div>
            <h3 className="text-lg md:text-xl font-semibold literary-text mb-2">Start Your First Book</h3>
            <p className="text-amber-700 mb-6 max-w-md mx-auto text-sm md:text-base px-4">
              Every great story begins with a single word. Create your first book and let your imagination flow.
            </p>
            <Link to={createPageUrl("Write")}>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white literary-shadow">
                <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Create Your First Book
              </Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {books.map((book, index) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full literary-shadow hover:shadow-lg transition-all duration-300 bg-white/80 backdrop-blur-sm border-amber-200">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-base md:text-lg font-bold literary-text line-clamp-2">
                        {book.title}
                      </CardTitle>
                      <div className="flex gap-1 flex-shrink-0">
                        <Badge className={`${getStatusColor(book.status)} text-xs`}>
                          {book.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    {book.genre && (
                      <Badge variant="outline" className={`${getGenreColor(book.genre)} text-xs w-fit`}>
                        {book.genre.replace('_', ' ')}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {book.description && (
                      <p className="text-xs md:text-sm text-amber-800 line-clamp-3">
                        {book.description}
                      </p>
                    )}

                    <div className="flex items-center -space-x-2 overflow-hidden mt-2">
                        <Avatar className="h-8 w-8 border-2 border-white rounded-full">
                            <AvatarFallback>{book.created_by?.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {(book.collaborators || []).slice(0, 3).map(email => (
                            <Avatar key={email} className="h-8 w-8 border-2 border-white rounded-full">
                                <AvatarFallback>{email.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                        ))}
                        {(book.collaborators?.length || 0) > 3 && (
                            <Avatar className="h-8 w-8 border-2 border-white rounded-full">
                                <AvatarFallback>+{(book.collaborators?.length || 0) - 3}</AvatarFallback>
                            </Avatar>
                        )}
                    </div>
<div className="flex items-center justify-between text-xs text-amber-600 mt-2">
  <div className="flex items-center gap-1">
    <Clock className="w-3 h-3" />
    <span>{book.word_count || 0} words</span>
  </div>
  {bookRatings[book.id] && (
    <div className="flex items-center gap-1">
      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
      <span>{bookRatings[book.id].average} ({bookRatings[book.id].count})</span>
    </div>
  )}
</div>

                    <div className="flex gap-2 pt-2">
                      <Link to={createPageUrl(`Write?id=${book.id}`)} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full border-amber-300 hover:bg-amber-100 text-xs md:text-sm">
                          <Edit className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Link to={createPageUrl(`ReadBook?id=${book.id}`)}>
                        <Button variant="outline" size="sm" className="border-amber-300 hover:bg-amber-100">
                          <Eye className="w-3 h-3 md:w-4 md:h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteBook(book.id)}
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}