import { Play, Pause } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { YouTubeVideo } from '@/services/youtubeApi';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { getRandomColor } from '@/lib/cardColors';

interface RecentPlayCardProps {
  video: YouTubeVideo;
}

const RecentPlayCard = ({ video }: RecentPlayCardProps) => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const backgroundColor = useMemo(() => getRandomColor(), []);

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
        "group flex items-center gap-4 rounded overflow-hidden transition-all cursor-pointer animate-fade-in hover:brightness-110",
        isCurrentTrack && "brightness-110"
      )}
      style={{ backgroundColor: `${backgroundColor}30` }}
      onClick={handleClick}
    >
      <img
        src={video.thumbnail}
        alt={video.title}
        className="w-12 h-12 sm:w-20 sm:h-20 object-cover"
      />
      <span className="font-semibold text-ellipsis h-10 flex-1 text-sm sm:text-base text-white">
        {video.title}
      </span>
      <button 
        className={cn(
          "mr-4 bg-white/90 rounded-full p-2 shadow-lg transition-all duration-200",
          "opacity-0 sm:opacity-100 hover:scale-105",
          isCurrentTrack && isPlaying && "opacity-100"
        )}
      >
        {isCurrentTrack && isPlaying ? (
          <Pause className="h-4 w-4 fill-black text-black" />
        ) : (
          <Play className="h-4 w-4 fill-black text-black ml-0.5" />
        )}
      </button>
    </div>
  );
};

export default RecentPlayCard;
