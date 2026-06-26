import React, { useState } from 'react';
import { useMusic } from './MusicProvider';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, Music } from 'lucide-react';

export default function MusicSearch() {
  const { playVideo } = useMusic();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    setIsSearching(true);
    setResults([]);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Search YouTube for music with the query "${query}". Return the top 5 video results.`,
        response_json_schema: {
          type: 'object',
          properties: {
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  video_id: { type: 'string' },
                  title: { type: 'string' },
                  channel: { type: 'string' },
                },
                required: ['video_id', 'title', 'channel'],
              },
            },
          },
        },
        add_context_from_internet: true,
      });
      setResults(response.results || []);
    } catch (error) {
      console.error("Search failed:", error);
    }
    setIsSearching(false);
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input 
          placeholder="Search for music on YouTube..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button type="submit" size="icon" disabled={isSearching}>
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </form>

      <div className="mt-3 space-y-2">
        {isSearching && (
            <div className="text-center p-4 text-amber-700">Searching...</div>
        )}
        {results.map((video) => (
          <button 
            key={video.video_id}
            onClick={() => playVideo(video)}
            className="w-full text-left p-2 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-3"
          >
            <img src={`https://i.ytimg.com/vi/${video.video_id}/default.jpg`} alt={video.title} className="w-12 h-9 rounded object-cover" />
            <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold truncate literary-text">{video.title}</p>
                <p className="text-xs text-amber-600 truncate">{video.channel}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}