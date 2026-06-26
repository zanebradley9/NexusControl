import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, Send, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

export default function BookReviews() {
  const [book, setBook] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    
    if (!bookId) return;

    const isAuth = await base44.auth.isAuthenticated();
    if (isAuth) {
      const userData = await base44.auth.me();
      setUser(userData);
    }

    const bookData = await base44.entities.Book.get(bookId);
    setBook(bookData);

    const reviewData = await base44.entities.BookReview.filter({ book_id: bookId }, "-created_date");
    setReviews(reviewData);
    setIsLoading(false);
  };

  const submitReview = async () => {
    if (!user) {
      alert("Please sign in to submit a review");
      return;
    }
    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    await base44.entities.BookReview.create({
      book_id: book.id,
      book_title: book.title,
      rating,
      review_text: reviewText,
      reviewer_name: user.full_name,
      reviewer_email: user.email
    });
    
    setRating(0);
    setReviewText("");
    loadData();
    setIsSubmitting(false);
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to={cn("Showcase")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold literary-text">{book?.title}</h1>
            <p className="text-amber-700">Reviews & Ratings</p>
          </div>
        </div>

        {/* Average Rating */}
        <Card className="literary-shadow bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200 mb-8">
          <CardContent className="p-6 text-center">
            <div className="text-5xl font-bold literary-text mb-2">{averageRating}</div>
            <div className="flex justify-center gap-1 mb-2">
              {[1,2,3,4,5].map(star => (
                <Star
                  key={star}
                  className={`w-6 h-6 ${star <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <p className="text-amber-700">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</p>
          </CardContent>
        </Card>

        {/* Submit Review */}
        {user && (
          <Card className="literary-shadow bg-white border-amber-200 mb-8">
            <CardHeader>
              <CardTitle>Write a Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm mb-2">Your Rating</p>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <Star
                      key={star}
                      className={`w-8 h-8 cursor-pointer transition-colors ${
                        star <= (hoverRating || rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    />
                  ))}
                </div>
              </div>
              
              <Textarea
                placeholder="Share your thoughts about this book..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="min-h-[120px]"
              />
              
              <Button
                onClick={submitReview}
                disabled={isSubmitting || rating === 0}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold literary-text">All Reviews</h2>
          {reviews.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-amber-700">No reviews yet. Be the first to review this book!</p>
            </Card>
          ) : (
            reviews.map(review => (
              <Card key={review.id} className="literary-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{review.reviewer_name}</CardTitle>
                      <div className="flex gap-1 mt-1">
                        {[1,2,3,4,5].map(star => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-amber-600">
                      {format(new Date(review.created_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </CardHeader>
                {review.review_text && (
                  <CardContent>
                    <p className="text-amber-900">{review.review_text}</p>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}