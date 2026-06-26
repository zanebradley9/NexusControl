import React, { useState, useEffect } from 'react';
import { useMusic } from './MusicProvider';
import { base44 } from '@/api/base44Client';
import { BarChart3 } from 'lucide-react';

export default function TrendingMusic() {
  const { playVideo } = useMusic();
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const trendingSongs = await base44.entities.MusicLog.list('-play_count', 5);
        setTrending(trendingSongs);
      } catch (error) {
        console.error("Failed to fetch trending music:", error);
      }
    };
    fetchTrending();
    const interval = setInterval(fetchTrending, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (trending.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider px-3 mb-2">
        Popular in BookStudio
      </h4>
      <div className="space-y-1">
        {trending.map((song) => (
          <button
            key={song.video_id}
            onClick={() => playVideo(song)}
            className="w-full text-left p-2 rounded-lg hover:bg-amber-100 transition-colors flex items-center gap-3"
          >
             <img src={`https://i.ytimg.com/vi/${song.video_id}/default.jpg`} alt={song.title} className="w-12 h-9 rounded object-cover" />
            <div className="flex-1 overflow-hidden">
                <p className="text-xs font-semibold truncate literary-text">{song.title}</p>
                <p className="text-xs text-amber-600 truncate">{song.channel}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}