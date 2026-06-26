import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Play, Pause, SkipForward, SkipBack, Music, Volume2 } from "lucide-react";

const jazzPlaylists = [
  "Coffee Shop Jazz",
  "Literary Lo-fi",
  "Jazz Cafe Vibes", 
  "Smooth Writing Flow",
  "Relaxing Inspiration"
];

export default function SimpleMusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % jazzPlaylists.length);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + jazzPlaylists.length) % jazzPlaylists.length);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-amber-200 literary-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-amber-900">Writing Music</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm font-medium text-amber-800 truncate h-5">
            {jazzPlaylists[currentTrack]}
          </p>
          <p className="text-xs text-amber-600 mt-1">
            Simulated jazz playlist
          </p>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 border-amber-200 hover:bg-amber-100" 
            onClick={prevTrack}
          >
            <SkipBack className="w-4 h-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 border-amber-300 hover:bg-amber-100" 
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 border-amber-200 hover:bg-amber-100" 
            onClick={nextTrack}
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-amber-600" />
          <div className="flex-1 bg-amber-200 h-2 rounded-full">
            <div className="bg-amber-500 h-2 rounded-full w-3/4"></div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-amber-600 italic h-4">
            {isPlaying ? "♪ Imagine smooth jazz playing..." : "♪ Click play for ambient vibes"}
          </p>
        </div>
        
        <div className="text-center bg-amber-50 p-2 rounded-lg">
          <p className="text-xs text-amber-700">
            🎵 For real jazz music, try playing your favorite playlist from Spotify, Apple Music, or YouTube in another tab while you write!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}