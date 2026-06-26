import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Download } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function ReadBook() {
  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadBook();
  }, []);

  const loadBook = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    
    if (!bookId) {
      alert("No book selected");
      navigate(cn("Showcase"));
      return;
    }

    try {
      const bookData = await base44.entities.Book.get(bookId);
      setBook(bookData);

      // Check if user has access (owns book or has active order)
      const user = await base44.auth.me();
      
      // Check if user created this book
      if (bookData.created_by === user.email) {
        setHasAccess(true);
      } else {
        // Check if user has an active order
        const orders = await base44.entities.Order.filter({
          book_id: bookId,
          buyer_email: user.email,
          status: "activated"
        });
        setHasAccess(orders.length > 0);
      }
    } catch (error) {
      console.error("Error loading book:", error);
      alert("Failed to load book");
      navigate(createPageUrl("Showcase"));
    }
    setIsLoading(false);
  };

  const downloadBook = () => {
    if (!book) return;
    
    const element = document.createElement("a");
    const file = new Blob([book.content || ""], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${book.title}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-amber-600 animate-pulse" />
        <p className="text-amber-700">Loading book...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="p-8 text-center">
        <BookOpen className="w-16 h-16 mx-auto mb-4 text-red-500" />
        <h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">You don't have permission to read this book.</p>
        <Link to={createPageUrl("Showcase")}>
          <Button>Go to Showcase</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link to={createPageUrl("Showcase")}>
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <Button onClick={downloadBook} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        <Card className="p-6 md:p-12 bg-white shadow-lg">
          <h1 className="text-3xl md:text-4xl font-bold literary-text mb-4 text-center">
            {book?.title}
          </h1>
          
          {book?.description && (
            <p className="text-center text-gray-600 italic mb-8">
              {book.description}
            </p>
          )}

          <div className="border-t-2 border-amber-200 pt-8">
            <div 
              className="prose prose-lg max-w-none"
              style={{ 
                fontFamily: 'Georgia, serif',
                lineHeight: '1.8',
                fontSize: '1.1rem',
                whiteSpace: 'pre-wrap'
              }}
            >
              {book?.content || "No content available"}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}