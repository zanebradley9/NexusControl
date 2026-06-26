import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tags, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function TagSuggester() {
  const [bookContent, setBookContent] = useState('');
  const [suggestions, setSuggestions] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const getSuggestions = async () => {
    if (!bookContent) {
      alert("Please provide some content from your book.");
      return;
    }
    setIsGenerating(true);
    setSuggestions(null);
    try {
      const prompt = `Based on the following book content, suggest relevant categories and tags.

Content: "${bookContent.substring(0, 1000)}"

Return a JSON object with two keys: "categories" (an array of 1-3 relevant genres/categories) and "tags" (an array of 5-10 keywords).`;
      
      const result = await base44.integrations.Core.InvokeLLM({ 
          prompt,
          response_json_schema: {
              type: "object",
              properties: {
                  categories: { type: "array", items: { type: "string" }},
                  tags: { type: "array", items: { type: "string" }}
              }
          }
       });
       
      setSuggestions(result);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      alert("Failed to generate suggestions.");
    }
    setIsGenerating(false);
  };

  return (
    <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 literary-text">
          <Tags className="w-5 h-5 text-teal-500" />
          AI Tag & Category Suggester
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Paste a chapter or summary of your book here..."
          value={bookContent}
          onChange={(e) => setBookContent(e.target.value)}
          rows={6}
        />
        <Button onClick={getSuggestions} disabled={isGenerating} className="w-full bg-teal-500 hover:bg-teal-600">
          {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Tags className="w-4 h-4 mr-2" />}
          Get Suggestions
        </Button>
        {suggestions && (
          <div className="p-4 bg-teal-50 rounded-lg border border-teal-200 space-y-4">
            <div>
                <h4 className="font-semibold mb-2">Suggested Categories:</h4>
                <div className="flex flex-wrap gap-2">
                    {suggestions.categories?.map(cat => <Badge key={cat} variant="secondary">{cat}</Badge>)}
                </div>
            </div>
            <div>
                <h4 className="font-semibold mb-2">Suggested Tags:</h4>
                <div className="flex flex-wrap gap-2">
                    {suggestions.tags?.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}