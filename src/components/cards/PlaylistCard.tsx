import { Play } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { YouTubeVideo } from '@/services/youtubeApi';
import { useMemo } from 'react';
import { getRandomColor } from '@/lib/cardColors';

interface PlaylistCardProps {
  title: string;
  description?: string;
  image: string;
  tracks?: YouTubeVideo[];
  onClick?: () => void;
}

const PlaylistCard = ({ title, description, image, tracks, onClick }: PlaylistCardProps) => {
  const { playTrack } = usePlayer();
  const backgroundColor = useMemo(() => getRandomColor(), []);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (tracks && tracks.length > 0) {
      const track = tracks[0];
      playTrack({
        id: track.id,
        title: track.title,
        artist: track.channelTitle,
        thumbnail: track.thumbnail,
        videoId: track.id,
      });
    }
  };

  return (
    <div 
      className="group animate-fade-in rounded-lg p-4 transition-all duration-300 hover:brightness-110 cursor-pointer"
      style={{ backgroundColor }}
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative mb-4">
        <img
          src={image}
          alt={title}
          className="w-full aspect-square object-cover rounded-md shadow-lg"
        />
        {/* Play Button */}
        <button
          onClick={handlePlay}
          className="spotify-play-button absolute bottom-2 right-2"
        >
          <Play className="h-6 w-6 fill-spotify-black text-spotify-black" />
        </button>
      </div>

      {/* Info */}
      <h3 className="font-bold truncate text-white">{title}</h3>
      {description && (
        <p className="text-sm text-white/80 mt-1 line-clamp-2">
          {description}
        </p>
      )}
    </div>
  );
};

export default PlaylistCard;
