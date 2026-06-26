import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, ArrowLeft, Eye, FileText, Target, Check, Users, MessageSquare, Sparkles } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Collaborators from "@/components/write/Collaborators";
import Comments from "@/components/write/Comments";
import AiWriter from "@/components/write/AiWriter";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export default function Write() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookId, setBookId] = useState(id);
  const [autoSaved, setAutoSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const quillRef = useRef(null);
  const wordCountGoal = 1000;

  useEffect(() => {
    if (bookId) {
      loadBook(bookId);
    } else {
        setBook({
            title: "Untitled Book",
            content: "",
            description: "",
            genre: "fiction",
            status: "draft",
            word_count: 0
        })
    }
  }, [bookId]);

  const autoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !book?.title) return;
    
    try {
      if (bookId) {
        await base44.entities.Book.update(bookId, book);
      } else {
        const newBook = await base44.entities.Book.create(book);
        setBookId(newBook.id);
        navigate(cn(`Write?id=${newBook.id}`), { replace: true });
      }
      setAutoSaved(true);
      setHasUnsavedChanges(false);
      
      setTimeout(() => setAutoSaved(false), 2000);
    } catch (error) {
      console.error("Auto-save error:", error);
    }
  }, [book, bookId, hasUnsavedChanges, navigate]);

  useEffect(() => {
    if (hasUnsavedChanges) {
      const timer = setTimeout(autoSave, 30000);
      return () => clearTimeout(timer);
    }
  }, [autoSave, hasUnsavedChanges]);

  const loadBook = async (id) => {
    setIsLoading(true);
    try {
      const bookData = await base44.entities.Book.find(id);
      if (bookData) {
        setBook(bookData);
        if (quillRef.current) {
            (bookData.comments || []).forEach(comment => {
                if (!comment.resolved) {
                    quillRef.current.getEditor().formatText(comment.selection_start, comment.selection_end - comment.selection_start, 'background', '#FFDDC1');
                }
            });
        }
      }
    } catch (error) {
      console.error("Error loading book:", error);
    }
    setIsLoading(false);
  };

  const updateBook = (field, value) => {
    setBook(prev => {
        if (!prev) return null;
        const updated = { ...prev, [field]: value };
        if (field === 'content') {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = value;
            const text = tempDiv.textContent || tempDiv.innerText || "";
            updated.word_count = text.trim().split(/\s+/).filter(Boolean).length;
        }
        return updated;
    });
    setHasUnsavedChanges(true);
  };

  const saveBook = async () => {
    if (!book) return;
    setIsSaving(true);
    try {
      if (bookId) {
        await base44.entities.Book.update(bookId, book);
      } else {
        const newBook = await base44.entities.Book.create(book);
        setBookId(newBook.id);
        navigate(createPageUrl(`Write?id=${newBook.id}`), { replace: true });
      }
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error saving book:", error);
    }
    setIsSaving(false);
  };

  const progressPercentage = book ? Math.min((book.word_count / wordCountGoal) * 100, 100) : 0;

  return (
    <div className="p-4 md:p-8 flex flex-col h-screen">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Library")}>
              <Button variant="outline" size="icon" className="border-amber-300 hover:bg-amber-100">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold literary-text">
                {bookId ? "Edit Book" : "Write New Book"}
              </h1>
              <div className="flex items-center gap-2 text-amber-700">
                <span>Let your creativity flow</span>
                {autoSaved && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Check className="w-3 h-3" />
                    <span className="text-xs">Auto-saved</span>
                  </div>
                )}
                {hasUnsavedChanges && !autoSaved && (
                  <span className="text-xs text-orange-600">• Unsaved changes</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-amber-300 hover:bg-amber-100"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={saveBook}
              disabled={isSaving || !book?.title}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white literary-shadow"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Now"}
            </Button>
          </div>
        </div>
      </div>

        {isLoading || !book ? (
          <div className="space-y-6 max-w-7xl mx-auto w-full">
            <Card className="literary-shadow animate-pulse">
              <CardHeader>
                <div className="h-6 bg-amber-200 rounded w-1/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-40 bg-amber-100 rounded"></div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <ResizablePanelGroup direction="horizontal" className="flex-1 max-w-7xl mx-auto w-full">
            <ResizablePanel defaultSize={75}>
                <div className="h-full overflow-y-auto pr-6 space-y-6">
                    <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-amber-200">
                        <CardHeader>
                        <CardTitle className="flex items-center gap-2 literary-text">
                            <FileText className="w-5 h-5" />
                            Book Details
                        </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                        <Input
                            placeholder="Book Title"
                            value={book.title}
                            onChange={(e) => updateBook('title', e.target.value)}
                            className="text-lg font-semibold border-amber-200"
                        />
                        <div className="grid md:grid-cols-2 gap-4">
                            <Select
                            value={book.genre}
                            onValueChange={(value) => updateBook('genre', value)}
                            >
                            <SelectTrigger className="border-amber-200">
                                <SelectValue placeholder="Select Genre" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fiction">Fiction</SelectItem>
                                <SelectItem value="non_fiction">Non-Fiction</SelectItem>
                                <SelectItem value="poetry">Poetry</SelectItem>
                                <SelectItem value="mystery">Mystery</SelectItem>
                                <SelectItem value="romance">Romance</SelectItem>
                                <SelectItem value="adventure">Adventure</SelectItem>
                                <SelectItem value="biography">Biography</SelectItem>
                                <SelectItem value="self_help">Self-Help</SelectItem>
                                <SelectItem value="educational">Educational</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                            </Select>

                            <Select
                            value={book.status}
                            onValueChange={(value) => updateBook('status', value)}
                            >
                            <SelectTrigger className="border-amber-200">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                            </Select>
                        </div>
                        <Textarea
                            placeholder="Brief description of your book..."
                            value={book.description}
                            onChange={(e) => updateBook('description', e.target.value)}
                            className="border-amber-200"
                            rows={3}
                        />
                        </CardContent>
                    </Card>

                    <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-amber-200 h-full flex flex-col">
                        <CardHeader>
                        <CardTitle className="literary-text">My Story</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow h-full">
                            <ReactQuill
                                ref={quillRef}
                                theme="snow"
                                value={book.content || ""}
                                onChange={(content, delta, source, editor) => updateBook("content", editor.getHTML())}
                                className="h-[calc(100%-42px)]"
                            />
                        </CardContent>
                    </Card>
                </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={25} minSize={20}>
              <div className="p-4 h-full overflow-auto bg-amber-50/50 border-l border-amber-200">
                <Tabs defaultValue="comments" className="flex flex-col h-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="comments"><MessageSquare className="w-4 h-4 mr-2"/>Comments</TabsTrigger>
                    <TabsTrigger value="collaborators"><Users className="w-4 h-4 mr-2"/>Team</TabsTrigger>
                    <TabsTrigger value="ai_writer"><Sparkles className="w-4 h-4 mr-2"/>AI Tools</TabsTrigger>
                  </TabsList>
                  <TabsContent value="comments" className="flex-grow mt-4">
                    <Comments book={book} onUpdate={setBook} quillRef={quillRef} />
                  </TabsContent>
                  <TabsContent value="collaborators" className="flex-grow mt-4">
                    <Collaborators book={book} onUpdate={setBook} />
                  </TabsContent>
                  <TabsContent value="ai_writer" className="flex-grow mt-4">
                    <AiWriter book={book} onApply={(text) => updateBook("content", book.content + "<br/>" + text)} />
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )}
    </div>
  );
}