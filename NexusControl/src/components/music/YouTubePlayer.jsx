import React, { useEffect, useRef } from 'react';
import { useMusic } from './MusicProvider';
import { Play, Pause, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function YouTubePlayer() {
  const { currentVideo, isPlaying, setIsPlaying } = useMusic();
  const playerRef = useRef(null);
  const [volume, setVolume] = React.useState(50);
  const [isMuted, setIsMuted] = React.useState(false);

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        createPlayer();
      } else {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        window.onYouTubeIframeAPIReady = createPlayer;
      }
    };

    const createPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      playerRef.current = new window.YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: currentVideo.video_id,
        playerVars: {
          autoplay: isPlaying ? 1 : 0,
        },
        events: {
          'onReady': onPlayerReady,
        }
      });
    };

    loadYouTubeAPI();

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      window.onYouTubeIframeAPIReady = null;
    };
  }, []);

  useEffect(() => {
    if (playerRef.current && playerRef.current.loadVideoById && playerRef.current.getPlayerState) {
      playerRef.current.loadVideoById(currentVideo.video_id);
    }
  }, [currentVideo]);

  useEffect(() => {
    if (playerRef.current && playerRef.current.getPlayerState) {
      if (isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    }
  }, [isPlaying]);
  
  useEffect(() => {
    if (playerRef.current && playerRef.current.setVolume) {
        playerRef.current.setVolume(volume);
    }
  }, [volume]);

  const onPlayerReady = (event) => {
    event.target.setVolume(volume);
    if (isPlaying) {
      event.target.playVideo();
    }
  };
  
  const handleMuteToggle = () => {
      if (isMuted) {
          playerRef.current.unMute();
      } else {
          playerRef.current.mute();
      }
      setIsMuted(!isMuted);
  }

  return (
    <Card className="bg-white/50 backdrop-blur-sm border-amber-200">
      <div id="youtube-player" className="hidden"></div>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <img 
            src={`https://i.ytimg.com/vi/${currentVideo.video_id}/mqdefault.jpg`}
            alt="video thumbnail"
            className="w-12 h-12 rounded-md object-cover"
          />
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold truncate literary-text">{currentVideo.title}</p>
            <p className="text-xs text-amber-700 truncate">{currentVideo.channel}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleMuteToggle}>
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              onValueChange={(value) => {
                  setVolume(value[0]);
                  if(isMuted) setIsMuted(false);
                  if(value[0] > 0 && isMuted) playerRef.current.unMute();
                  if(value[0] === 0 && !isMuted) playerRef.current.mute();
              }}
              max={100}
              step={1}
              className="w-full"
            />
        </div>
      </CardContent>
    </Card>
  );
}