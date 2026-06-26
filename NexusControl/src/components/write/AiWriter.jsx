import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2 } from "lucide-react";

export default function AiWriter({ book, onApply }) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [aiTask, setAiTask] = useState("plot_outline");

  const prompts = {
    plot_outline: `Generate a plot outline for a ${book.genre || 'story'} titled "${book.title}". Include key plot points like introduction, rising action, climax, falling action, and resolution.`,
    character_archetypes: `Suggest 3 character archetypes for a ${book.genre || 'story'} titled "${book.title}". For each, provide a brief backstory and their potential role in the story.`,
    expand_text: `Expand the following text passage in a way that is stylistically consistent: "${book.content.slice(-500)}" `,
    stylistic_suggestions: `Provide stylistic and grammar suggestions for the following text. Format the output as a list of suggestions. Text: "${book.content.slice(-1000)}"`,
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedContent("");
    try {
      const result = await base44.integrations.Core.InvokeLLM({ prompt: prompts[aiTask] });
      setGeneratedContent(result);
    } catch (error) {
      console.error("AI generation failed:", error);
      setGeneratedContent("Sorry, I couldn't generate a response. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-4 p-1">
      <Select value={aiTask} onValueChange={setAiTask}>
        <SelectTrigger>
          <SelectValue placeholder="Select AI Task" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="plot_outline">Plot Outline</SelectItem>
          <SelectItem value="character_archetypes">Character Suggestions</SelectItem>
          <SelectItem value="expand_text">Expand Passage</SelectItem>
          <SelectItem value="stylistic_suggestions">Style & Grammar</SelectItem>
        </SelectContent>
      </Select>

      <Button onClick={handleGenerate} disabled={isLoading} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
        {isLoading ? "Generating..." : "Generate with AI"}
      </Button>

      {generatedContent && (
        <div className="space-y-2">
          <Textarea
            readOnly
            value={generatedContent}
            className="min-h-[200px] bg-amber-50/50"
          />
          <Button onClick={() => onApply(generatedContent)} size="sm">Apply to Content</Button>
        </div>
      )}
    </div>
  );
}