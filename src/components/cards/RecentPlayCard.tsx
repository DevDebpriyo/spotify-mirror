import { Play, Pause } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { YouTubeVideo } from '@/services/youtubeApi';
import { cn } from '@/lib/utils';

interface RecentPlayCardProps {
  video: YouTubeVideo;
}

const RecentPlayCard = ({ video }: RecentPlayCardProps) => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();

  const isCurrentTrack = currentTrack?.videoId === video.id;

  const handleClick = () => {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack({
        id: video.id,
        title: video.title,
        artist: video.channelTitle,
        thumbnail: video.thumbnail,
        videoId: video.id,
      });
    }
  };

  return (
    <div 
      className={cn(
        "group flex items-center gap-4 bg-muted/30 hover:bg-muted/50 rounded overflow-hidden transition-colors cursor-pointer animate-fade-in",
        isCurrentTrack && "bg-muted/50"
      )}
      onClick={handleClick}
    >
      <img
        src={video.thumbnail}
        alt={video.title}
        className="w-12 h-12 sm:w-20 sm:h-20 object-cover"
      />
      <span className="font-semibold truncate flex-1 text-sm sm:text-base">
        {video.title}
      </span>
      <button 
        className={cn(
          "mr-4 bg-primary rounded-full p-2 shadow-lg transition-all duration-200",
          "opacity-0 group-hover:opacity-100 hover:scale-105",
          isCurrentTrack && isPlaying && "opacity-100"
        )}
      >
        {isCurrentTrack && isPlaying ? (
          <Pause className="h-4 w-4 fill-spotify-black text-spotify-black" />
        ) : (
          <Play className="h-4 w-4 fill-spotify-black text-spotify-black ml-0.5" />
        )}
      </button>
    </div>
  );
};

export default RecentPlayCard;
