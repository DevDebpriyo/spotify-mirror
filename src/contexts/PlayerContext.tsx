import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  videoId: string;
  duration?: number;
}

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  queue: Track[];
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  shuffle: boolean;
  repeat: 'off' | 'all' | 'one';
  toggleShuffle: () => void;
  toggleRepeat: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(50);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [queue, setQueue] = useState<Track[]>([]);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off');
  const [playerReady, setPlayerReady] = useState(false);
  
  const playerRef = useRef<any>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        setPlayerReady(true);
      };
    } else {
      setPlayerReady(true);
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const initPlayer = useCallback((videoId: string) => {
    if (!playerReady) return;

    if (playerRef.current) {
      playerRef.current.destroy();
    }

    // Create hidden player container if it doesn't exist
    let playerContainer = document.getElementById('youtube-player');
    if (!playerContainer) {
      playerContainer = document.createElement('div');
      playerContainer.id = 'youtube-player';
      playerContainer.style.position = 'absolute';
      playerContainer.style.top = '-9999px';
      playerContainer.style.left = '-9999px';
      document.body.appendChild(playerContainer);
    }

    playerRef.current = new window.YT.Player('youtube-player', {
      height: '0',
      width: '0',
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
      },
      events: {
        onReady: (event: any) => {
          event.target.setVolume(volume);
          event.target.playVideo();
          setDuration(event.target.getDuration());
          startProgressTracking();
        },
        onStateChange: (event: any) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
            setDuration(event.target.getDuration());
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            setIsPlaying(false);
          } else if (event.data === window.YT.PlayerState.ENDED) {
            handleTrackEnd();
          }
        },
      },
    });
  }, [playerReady, volume]);

  const startProgressTracking = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    progressInterval.current = setInterval(() => {
      if (playerRef.current && playerRef.current.getCurrentTime) {
        setProgress(playerRef.current.getCurrentTime());
      }
    }, 1000);
  };

  const handleTrackEnd = useCallback(() => {
    if (repeat === 'one') {
      playerRef.current?.seekTo(0);
      playerRef.current?.playVideo();
    } else if (queue.length > 0) {
      nextTrack();
    } else if (repeat === 'all' && currentTrack) {
      playTrack(currentTrack);
    } else {
      setIsPlaying(false);
    }
  }, [repeat, queue, currentTrack]);

  const playTrack = useCallback((track: Track) => {
    setCurrentTrack(track);
    if (playerReady && window.YT) {
      initPlayer(track.videoId);
    }
  }, [playerReady, initPlayer]);

  const pauseTrack = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
      setIsPlaying(false);
    }
  }, []);

  const resumeTrack = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.playVideo();
      setIsPlaying(true);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  }, [isPlaying, pauseTrack, resumeTrack]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
      setProgress(time);
    }
  }, []);

  const nextTrack = useCallback(() => {
    if (queue.length > 0) {
      const nextIndex = shuffle ? Math.floor(Math.random() * queue.length) : 0;
      const next = queue[nextIndex];
      setQueue(prev => prev.filter((_, i) => i !== nextIndex));
      playTrack(next);
    }
  }, [queue, shuffle, playTrack]);

  const previousTrack = useCallback(() => {
    if (progress > 3) {
      seekTo(0);
    } else if (currentTrack) {
      playTrack(currentTrack);
    }
  }, [progress, currentTrack, seekTo, playTrack]);

  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => [...prev, track]);
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const toggleShuffle = useCallback(() => {
    setShuffle(prev => !prev);
  }, []);

  const toggleRepeat = useCallback(() => {
    setRepeat(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        volume,
        progress,
        duration,
        queue,
        playTrack,
        pauseTrack,
        resumeTrack,
        togglePlay,
        setVolume,
        seekTo,
        nextTrack,
        previousTrack,
        addToQueue,
        clearQueue,
        shuffle,
        repeat,
        toggleShuffle,
        toggleRepeat,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
