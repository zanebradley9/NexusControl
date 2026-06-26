import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Loader2 } from 'lucide-react';

export default function MarketingCopyGenerator() {
  const [bookInfo, setBookInfo] = useState('');
  const [marketingCopy, setMarketingCopy] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCopy = async () => {
    if (!bookInfo) {
      alert("Please provide some information about your book.");
      return;
    }
    setIsGenerating(true);
    setMarketingCopy('');
    try {
      const prompt = `Generate 3 short and engaging marketing copy snippets for a book with the following description: "${bookInfo}". The copy should be suitable for social media platforms like Twitter and Instagram. Include relevant hashtags. Format the output as a simple text.`;
      const result = await base44.integrations.Core.InvokeLLM({ prompt });
      setMarketingCopy(result);
    } catch (error) {
      console.error("Error generating marketing copy:", error);
      alert("Failed to generate marketing copy.");
    }
    setIsGenerating(false);
  };

  return (
    <Card className="literary-shadow bg-white/80 backdrop-blur-sm border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 literary-text">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI Marketing Copy Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter your book's title, genre, and a brief description..."
          value={bookInfo}
          onChange={(e) => setBookInfo(e.target.value)}
          rows={4}
        />
        <Button onClick={generateCopy} disabled={isGenerating} className="w-full bg-purple-500 hover:bg-purple-600">
          {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Generate Copy
        </Button>
        {marketingCopy && (
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-semibold mb-2">Generated Copy:</h4>
            <pre className="whitespace-pre-wrap text-sm text-gray-700">{marketingCopy}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}