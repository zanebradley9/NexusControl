import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, ImageIcon, BookOpen, ShoppingCart, Search, Wind, UploadCloud, BookImage, Star } from 'lucide-react';
import PremiumModal from "@/components/premium/PremiumModal";
import { base44 } from "@/api/base44Client";

// Mock icons for Google Drive and OneDrive
const GoogleDriveIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.70999 20.09L3.90999 13.5L7.04999 8.24001L10.85 14.74L7.70999 20.09Z" fill="#0066DA"/>
    <path d="M12.98 20.09L7.70999 20.09L10.85 14.74L16.12 14.74L12.98 20.09Z" fill="#00AC47"/>
    <path d="M10.85 14.74L7.04999 8.24001H17.55L21.35 14.74H10.85Z" fill="#FFC107"/>
    <path d="M17.55 8.24001L14.41 2.91001C13.97 2.15001 12.9 2.08001 12.36 2.76001L10.22 5.56001L7.04999 8.24001L10.85 14.74L14.28 9.27001L17.55 8.24001Z" fill="#0066DA" fillOpacity="0.5"/>
  </svg>
);

const OneDriveIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 8.45C4.07 7.57 4.5 6.78 5.17 6.2C5.85 5.62 6.73 5.3 7.63 5.31H14.96C15.34 5.31 15.71 5.4 16.03 5.59C16.35 5.77 16.6 6.04 16.76 6.36L20 12.42C20.35 13.06 20.25 13.84 19.78 14.39C19.31 14.94 18.53 15.09 17.84 14.78L13.75 12.97C13.2 12.74 12.59 12.74 12.04 12.97L7.95 14.78C7.26 15.09 6.48 14.94 6.01 14.39C5.54 13.84 5.44 13.06 5.79 12.42L9.04 6.36C9.2 6.04 9.45 5.77 9.77 5.59C10.09 5.4 10.46 5.31 10.84 5.31H7.63C6.73 5.3 5.85 5.62 5.17 6.2C4.5 6.78 4.07 7.57 4 8.45Z" fill="#094792"/>
        <path d="M4.09 15.2C4.55 15.74 5.32 15.89 6.01 15.58L10.1 13.77C10.65 13.54 11.26 13.54 11.81 13.77L15.9 15.58C16.59 15.89 17.37 15.74 17.84 15.2C18.31 14.65 18.41 13.87 18.06 13.23L14.81 7.17C14.65 6.85 14.4 6.58 14.08 6.4C13.76 6.22 13.39 6.13 13.01 6.13H16.26C17.16 6.12 18.04 6.44 18.72 7C19.4 7.56 19.83 8.35 19.9 9.23C19.83 10.11 19.4 10.9 18.72 11.48C18.04 12.06 17.16 12.38 16.26 12.37H13.01C12.46 12.37 11.93 12.54 11.5 12.86L4.09 15.2Z" fill="#094792"/>
    </svg>
);


export default function AiToolbox({ isPremium }) {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [file, setFile] = useState(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleGenerate = async (generationType) => {
    if (generationType === 'book_cover' && !isPremium) {
      setShowPremiumModal(true);
      return;
    }
    if (!prompt && generationType !== 'image') {
      alert("Please enter a prompt.");
      return;
    }
    
    setIsGenerating(true);
    setResult(null);

    try {
      let fileUrl = null;
      if (file) {
        const uploadRes = await base44.integrations.Core.UploadFile({ file });
        fileUrl = uploadRes.file_url;
      }
      
      let response;
      switch(generationType) {
        case 'book_cover':
          response = await base44.integrations.Core.GenerateImage({
            prompt: `Create a book cover for a page. The book is about: ${prompt}.`,
            existing_image_urls: fileUrl ? [fileUrl] : null
          });
          setResult({ type: 'image', data: response.url });
          break;
        case 'image':
          response = await base44.integrations.Core.GenerateImage({
            prompt: prompt || "A beautiful, abstract image representing artificial intelligence.",
            existing_image_urls: fileUrl ? [fileUrl] : null
          });
          setResult({ type: 'image', data: response.url });
          break;
        case 'research':
          response = await base44.integrations.Core.InvokeLLM({
            prompt: `Research the following topic: ${prompt}`,
            add_context_from_internet: true,
            file_urls: fileUrl ? [fileUrl] : null
          });
          setResult({ type: 'text', data: response });
          break;
        case 'shopping':
          response = await base44.integrations.Core.InvokeLLM({
            prompt: `Find shopping results for: ${prompt}`,
            add_context_from_internet: true,
            response_json_schema: {
              type: "object",
              properties: {
                products: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      price: { type: "string" },
                      url: { type: "string" }
                    },
                    required: ["name", "price", "url"]
                  }
                }
              }
            },
            file_urls: fileUrl ? [fileUrl] : null
          });
          setResult({ type: 'shopping', data: response.products });
          break;
        default:
          response = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            file_urls: fileUrl ? [fileUrl] : null
          });
          setResult({ type: 'text', data: response });
      }

    } catch (error) {
      console.error("Error during generation:", error);
      setResult({ type: 'error', data: 'An error occurred. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto literary-shadow bg-white/80 backdrop-blur-sm border-amber-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 literary-text">
          <Wind className="w-6 h-6 text-purple-600" />
          AI Toolbox
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Textarea
            placeholder="Enter your prompt here... (e.g., 'Create a marketing slogan for a new coffee brand')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] border-amber-200"
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button variant="outline" className="flex items-center gap-2" onClick={() => document.getElementById('file-upload').click()}>
              <Paperclip className="w-4 h-4" /> Add File
            </Button>
            <input type="file" id="file-upload" className="hidden" onChange={handleFileChange} />
            <Button variant="outline" className="flex items-center gap-2">
              <GoogleDriveIcon /> Google Drive
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <OneDriveIcon /> OneDrive
            </Button>
            {file && <span className="text-sm text-gray-500 col-span-full">{file.name}</span>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button onClick={() => handleGenerate('image')} disabled={isGenerating} className="bg-gradient-to-r from-blue-500 to-indigo-500">
              <ImageIcon className="w-4 h-4 mr-2" /> Image
            </Button>
            <Button onClick={() => handleGenerate('book_cover')} disabled={isGenerating} className="bg-gradient-to-r from-cyan-500 to-blue-500 relative">
              {!isPremium && <Star className="w-4 h-4 absolute -top-1 -right-1 text-yellow-400 fill-yellow-400" />}
              <BookImage className="w-4 h-4 mr-2" /> Book Cover
            </Button>
            <Button onClick={() => handleGenerate('research')} disabled={isGenerating} className="bg-gradient-to-r from-green-500 to-emerald-500">
              <BookOpen className="w-4 h-4 mr-2" /> Research
            </Button>
            <Button onClick={() => handleGenerate('shopping')} disabled={isGenerating} className="bg-gradient-to-r from-amber-500 to-orange-500">
              <ShoppingCart className="w-4 h-4 mr-2" /> Shopping
            </Button>
          </div>
          <Button onClick={() => handleGenerate('default')} disabled={isGenerating} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Search className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate with AI'}
          </Button>
        </div>

        {isGenerating && (
          <div className="mt-4 text-center">
            <UploadCloud className="w-8 h-8 mx-auto animate-pulse text-purple-500" />
            <p className="text-sm text-gray-500">Generating, please wait...</p>
          </div>
        )}

        {result && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-100 rounded-lg">
            <h3 className="font-semibold mb-2 literary-text">Result:</h3>
            {result.type === 'text' && <p className="text-sm text-gray-700 whitespace-pre-wrap">{result.data}</p>}
            {result.type === 'image' && <img src={result.data} alt="Generated" className="rounded-lg max-w-full" />}
            {result.type === 'shopping' && (
              <div className="space-y-2">
                {result.data.map((item, index) => (
                  <div key={index} className="p-2 border rounded-md bg-white">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">{item.name}</a>
                    <p className="text-sm text-gray-600">{item.price}</p>
                  </div>
                ))}
              </div>
            )}
            {result.type === 'error' && <p className="text-sm text-red-600">{result.data}</p>}
          </div>
        )}
      </CardContent>
      <PremiumModal isOpen={showPremiumModal} onOpenChange={setShowPremiumModal} featureName="AI Book Cover Generation" />
    </Card>
  );
}