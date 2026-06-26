import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Play, Pause, SkipForward, SkipBack, Music, Volume2, VolumeX, Loader2, AlertCircle } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const jazzTracks = [
  { 
    title: "Coffee Shop Jazz", 
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    fallback: "https://file-examples.com/storage/fe68c484bb66f5bb6ee8bb3/2017/11/file_example_MP3_700KB.mp3"
  },
  { 
    title: "Literary Lo-fi", 
    url: "https://file-examples.com/storage/fe68c484bb66f5bb6ee8bb3/2017/11/file_example_MP3_1MG.mp3",
    fallback: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
  },
  { 
    title: "Jazz Cafe Vibes", 
    url: "https://file-examples.com/storage/fe68c484bb66f5bb6ee8bb3/2017/11/file_example_MP3_2MG.mp3",
    fallback: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
  },
  { 
    title: "Smooth Writing Flow", 
    url: "https://file-examples.com/storage/fe68c484bb66f5bb6ee8bb3/2017/11/file_example_MP3_5MG.mp3",
    fallback: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav"
  },
  { 
    title: "Relaxing Inspiration", 
    url: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    fallback: "https://file-examples.com/storage/fe68c484bb66f5bb6ee8bb3/2017/11/file_example_MP3_700KB.mp3"
  }
];

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState([70]);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying && !hasError) {
        audio.play().catch(error => {
          console.error("Playback failed:", error);
          setIsPlaying(false);
          setHasError(true);
        });
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, hasError]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const trackUrl = useFallback ? jazzTracks[currentTrack].fallback : jazzTracks[currentTrack].url;
      audio.src = trackUrl;
      audio.load();
      setIsLoading(true);
      setHasError(false);
      
      if (isPlaying) {
        audio.play().catch(e => {
          console.error("Could not play new track:", e);
          setHasError(true);
        });
      }
    }
  }, [currentTrack, isPlaying, useFallback]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume[0] / 100;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (hasError) {
      setHasError(false);
      setUseFallback(!useFallback);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    setCurrentTrack((prev) => (prev + 1) % jazzTracks.length);
    setHasError(false);
    setUseFallback(false);
  };

  const prevTrack = () => {
    setCurrentTrack((prev) => (prev - 1 + jazzTracks.length) % jazzTracks.length);
    setHasError(false);
    setUseFallback(false);
  };

  const handleTimeUpdate = (e) => setCurrentTime(e.target.currentTime);
  
  const handleLoadedData = (e) => {
    setDuration(e.target.duration);
    setIsLoading(false);
    setHasError(false);
  };
  
  const handleWaiting = () => setIsLoading(true);
  const handlePlaying = () => {
    setIsLoading(false);
    setHasError(false);
  };
  
  const handleError = (e) => {
    console.error("Audio error:", e);
    setIsLoading(false);
    setHasError(true);
    setIsPlaying(false);
    
    // Try fallback URL if not already using it
    if (!useFallback) {
      setUseFallback(true);
    }
  };

  const handleProgressChange = (value) => {
    if (audioRef.current && !hasError) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };
  
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-amber-200 literary-shadow">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={handleLoadedData}
        onEnded={nextTrack}
        onError={handleError}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        preload="metadata"
        crossOrigin="anonymous"
      />
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-amber-900">Writing Music</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm font-medium text-amber-800 truncate h-5">
            {jazzTracks[currentTrack].title}
          </p>
          {hasError && (
            <p className="text-xs text-red-600 mt-1">Audio unavailable - click play to retry</p>
          )}
        </div>
        
        {!hasError && (
          <div className="space-y-1">
            <Slider
              value={[currentTime]}
              onValueChange={handleProgressChange}
              max={duration || 0}
              step={1}
              className="flex-1"
            />
            <div className="flex justify-between text-xs text-amber-600">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}

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
            {hasError ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
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
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted || volume[0] === 0 ? (
              <VolumeX className="w-4 h-4 text-amber-600" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-600" />
            )}
          </Button>
          <Slider 
            value={volume} 
            onValueChange={setVolume} 
            max={100} 
            step={1} 
            disabled={isMuted || hasError} 
            className="flex-1" 
          />
        </div>

        <div className="text-center">
          <p className="text-xs text-amber-600 italic h-4">
            {hasError ? "♪ Audio error - trying different source..." : 
             isPlaying ? "♪ Now Playing..." : 
             "♪ Press play for some jazz"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}