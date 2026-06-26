import React, { createContext, useState, useContext, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

const MusicContext = createContext(null);

export const useMusic = () => useContext(MusicContext);

const defaultVideo = { video_id: '5qap5aO4i9A', title: 'lofi hip hop radio 📚 - beats to relax/study to', channel: 'Lofi Girl' };

export const MusicProvider = ({ children }) => {
  const [currentVideo, setCurrentVideo] = useState(defaultVideo);
  const [isPlaying, setIsPlaying] = useState(false);

  const playVideo = (video) => {
    setCurrentVideo(video);
    setIsPlaying(true);
    logSong(video);
  };

  const logSong = useCallback(async (video) => {
    if (!video || !video.video_id) return;
    try {
      const existingLogs = await base44.entities.MusicLog.filter({ video_id: video.video_id });
      if (existingLogs.length > 0) {
        const log = existingLogs[0];
        await base44.entities.MusicLog.update(log.id, { play_count: (log.play_count || 1) + 1 });
      } else {
        await base44.entities.MusicLog.create({
          video_id: video.video_id,
          title: video.title,
          channel: video.channel || 'Unknown',
          play_count: 1,
        });
      }
    } catch (error) {
      console.error("Error logging song:", error);
    }
  }, []);

  const value = {
    currentVideo,
    isPlaying,
    playVideo,
    setIsPlaying,
  };

  return (
    <MusicContext.Provider value={value}>
      {children}
    </MusicContext.Provider>
  );
};