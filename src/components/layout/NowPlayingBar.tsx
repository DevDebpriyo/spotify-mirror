import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Maximize2,
  ListMusic,
  Laptop2,
  Heart,
} from "lucide-react";
import { usePlayer } from "@/contexts/PlayerContext";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const NowPlayingBar = () => {
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    shuffle,
    repeat,
    togglePlay,
    setVolume,
    seekTo,
    nextTrack,
    previousTrack,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();

  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;
  const RepeatIcon = repeat === "one" ? Repeat1 : Repeat;

  if (!currentTrack) {
    return null;
  }

  return (
    <div className=" bg-blue-800 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 spotify-now-playing-bar flex items-center justify-between animate-slide-up">
      {/* Track Info */}
      <div className="flex items-center gap-4 w-[30%] min-w-[180px]">
        <img
          src={currentTrack.thumbnail}
          alt={currentTrack.title}
          className="h-14 w-14 rounded object-cover"
        />
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate text-foreground">
            {currentTrack.title}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {currentTrack.artist}
          </p>
        </div>
      </div>

      {/* Player Controls */}
      <div className="sm:mt-10  flex flex-col items-center gap-2 w-[40%] max-w-[722px]">
        <div className="flex items-center gap-4">
          {/* <button
            onClick={toggleShuffle}
            className={cn(
              "text-muted-foreground hover:text-foreground transition-colors",
              shuffle && "text-primary"
            )}
          >
            <Shuffle className="h-4 w-4" />
          </button> */}

          <button
            onClick={previousTrack}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <SkipBack className="h-5 w-5 fill-current" />
          </button>

          <button
            onClick={togglePlay}
            className="bg-foreground text-background rounded-full p-2 hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 fill-current" />
            ) : (
              <Play className="h-5 w-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={nextTrack}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <SkipForward className="h-5 w-5 fill-current" />
          </button>

          <button
            onClick={toggleRepeat}
            className={cn(
              "hidden sm:block text-muted-foreground hover:text-foreground transition-colors relative",
              repeat !== "off" && "text-primary"
            )}
          >
            <RepeatIcon className="h-4 w-4" />
            {repeat === "one" && (
              <span className="absolute -top-1 -right-1 text-[10px] font-bold text-primary">
                1
              </span>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="hidden sm:block sm:-mt-4 flex items-center gap-2 w-full">
          <span className="text-xs text-muted-foreground w-10 text-right">
            {formatTime(progress)}
          </span>
          <div className="flex-1 group">
            <Slider
              value={[progress]}
              max={duration || 100}
              step={1}
              onValueChange={([value]) => seekTo(value)}
              className="cursor-pointer"
            />
          </div>
          <span className="text-xs text-muted-foreground w-10">
            {formatTime(duration)}
          </span>
        </div>
      </div>
      <button className="text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
        <Heart className="h-4 w-4" />
      </button>

      {/* Volume & Other Controls */}
      <div className="flex items-center justify-end gap-3 w-[30%] min-w-[180px]">
        <button className="text-muted-foreground hover:text-foreground transition-colors hidden md:block">
          <ListMusic className="h-4 w-4" />
        </button>

        <button className="text-muted-foreground hover:text-foreground transition-colors hidden md:block">
          <Laptop2 className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2 hidden sm:flex">
          <button
            onClick={() => setVolume(volume === 0 ? 50 : 0)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <VolumeIcon className="h-4 w-4" />
          </button>
          <Slider
            value={[volume]}
            max={100}
            step={1}
            onValueChange={([value]) => setVolume(value)}
            className="w-24 cursor-pointer"
          />
        </div>

        <button className="text-muted-foreground hover:text-foreground transition-colors hidden lg:block">
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default NowPlayingBar;
