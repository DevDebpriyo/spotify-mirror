import { Play, MoreHorizontal } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { YouTubeVideo } from '@/services/youtubeApi';
import { cn } from '@/lib/utils';

interface TrackCardProps {
  video: YouTubeVideo;
  index?: number;
  showIndex?: boolean;
}

const TrackCard = ({ video, index, showIndex }: TrackCardProps) => {
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  const isCurrentTrack = currentTrack?.videoId === video.id;

  const handlePlay = () => {
    playTrack({
      id: video.id,
      title: video.title,
      artist: video.channelTitle,
      thumbnail: video.thumbnail,
      videoId: video.id,
    });
  };

  return (
    <div 
      className={cn(
        "group flex items-center gap-4 px-4 py-2 rounded-md hover:bg-accent transition-colors cursor-pointer",
        isCurrentTrack && "bg-accent"
      )}
      onClick={handlePlay}
    >
      {/* Index / Play Button */}
      <div className="w-4 flex items-center justify-center">
        {showIndex && (
          <>
            <span className={cn(
              "text-muted-foreground group-hover:hidden",
              isCurrentTrack && "text-primary"
            )}>
              {isCurrentTrack && isPlaying ? (
                <div className="flex items-end gap-0.5 h-4">
                  <div className="w-1 bg-primary animate-equalizer" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 bg-primary animate-equalizer" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 bg-primary animate-equalizer" style={{ animationDelay: '300ms' }} />
                </div>
              ) : (
                index
              )}
            </span>
            <Play className="h-4 w-4 hidden group-hover:block fill-current" />
          </>
        )}
        {!showIndex && (
          <Play className={cn(
            "h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity fill-current",
            isCurrentTrack && "opacity-100"
          )} />
        )}
      </div>

      {/* Thumbnail */}
      <img
        src={video.thumbnail}
        alt={video.title}
        className="w-10 h-10 rounded object-cover"
      />

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "font-medium truncate",
          isCurrentTrack ? "text-primary" : "text-foreground"
        )}>
          {video.title}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {video.channelTitle}
        </p>
      </div>

      {/* More Options */}
      <button 
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
    </div>
  );
};

export default TrackCard;
