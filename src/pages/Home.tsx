import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import PlaylistCard from '@/components/cards/PlaylistCard';
import RecentPlayCard from '@/components/cards/RecentPlayCard';
import { getPopularMusicVideos, getVideosByCategory, YouTubeVideo, musicCategories } from '@/services/youtubeApi';
import { Skeleton } from '@/components/ui/skeleton';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning🌞';
  if (hour < 18) return 'Good afternoon🌤️';
  return 'Good evening🌙';
};

const Home = () => {
  const navigate = useNavigate();
  const [popularVideos, setPopularVideos] = useState<YouTubeVideo[]>([]);
  const [categoryVideos, setCategoryVideos] = useState<Record<string, YouTubeVideo[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [recentlyPlayed, setRecentlyPlayed] = useState<YouTubeVideo[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const popular = await getPopularMusicVideos(12);
        setPopularVideos(popular);
        setRecentlyPlayed(popular.slice(0, 6));

        // Fetch a few categories
        const categoriesToFetch = musicCategories.slice(0, 4);
        const categoryData: Record<string, YouTubeVideo[]> = {};
        
        await Promise.all(
          categoriesToFetch.map(async (cat) => {
            const videos = await getVideosByCategory(cat.query, 8);
            categoryData[cat.id] = videos;
          })
        );
        
        setCategoryVideos(categoryData);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-spotify-dark-highlight to-background">
      <Header transparent />
      
      <div className="px-6 pb-32 space-y-8">
        {/* Greeting */}
        <h1 className="text-3xl font-bold text-yellow-500 pt-4 animate-fade-in">{getGreeting()}</h1>

        {/* Recently Played Grid */}
        <section>
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-12 sm:h-20 rounded bg-muted/30" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {recentlyPlayed.map((video, i) => (
                <div key={video.id} style={{ animationDelay: `${i * 50}ms` }}>
                  <RecentPlayCard video={video} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Popular Right Now */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold hover:underline cursor-pointer">Popular right now</h2>
            <button className="text-sm font-semibold text-muted-foreground hover:text-foreground">
              Show all
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex overflow-x-auto gap-4 pb-4 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:overflow-visible sm:pb-0 scrollbar-hide">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-[140px] sm:w-auto space-y-4">
                  <Skeleton className="aspect-square rounded-md bg-muted/30" />
                  <Skeleton className="h-4 w-3/4 bg-muted/30" />
                  <Skeleton className="h-3 w-1/2 bg-muted/30" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-1 sm:gap-4 pb-4 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:overflow-visible sm:pb-0 scrollbar-hide">
              {popularVideos.slice(0, 6).map((video) => (
                <div key={video.id} className="flex-shrink-0 w-[140px] sm:w-auto">
                  <PlaylistCard
                    title={video.title}
                    description={video.channelTitle}
                    image={video.thumbnailHigh}
                    tracks={[video]}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Category Sections */}
        {musicCategories.slice(0, 4).map((category) => (
          <section key={category.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 
                className="text-2xl font-bold hover:underline cursor-pointer"
                onClick={() => navigate(`/search/${category.id}`)}
              >
                {category.name}
              </h2>
              <button 
                className="text-sm font-semibold text-muted-foreground hover:text-foreground"
                onClick={() => navigate(`/search/${category.id}`)}
              >
                Show all
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex overflow-x-auto gap-4 pb-4 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:overflow-visible sm:pb-0 scrollbar-hide">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-[140px] sm:w-auto space-y-4">
                    <Skeleton className="aspect-square rounded-md bg-muted/30" />
                    <Skeleton className="h-4 w-3/4 bg-muted/30" />
                    <Skeleton className="h-3 w-1/2 bg-muted/30" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex overflow-x-auto gap-4 pb-4 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:overflow-visible sm:pb-0 scrollbar-hide">
                {(categoryVideos[category.id] || []).slice(0, 6).map((video) => (
                  <div key={video.id} className="flex-shrink-0 w-[140px] sm:w-auto">
                    <PlaylistCard
                      title={video.title}
                      description={video.channelTitle}
                      image={video.thumbnailHigh}
                      tracks={[video]}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default Home;
