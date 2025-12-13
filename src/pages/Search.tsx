import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Search as SearchIcon, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import CategoryCard from '@/components/cards/CategoryCard';
import TrackCard from '@/components/cards/TrackCard';
import { searchVideos, YouTubeVideo, musicCategories } from '@/services/youtubeApi';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const categoryColors = [
  '#E13300', '#1E3264', '#8C1932', '#E8115B', '#BC5900',
  '#608108', '#0D73EC', '#477D95', '#503750', '#AF2896',
  '#148A08', '#E91429', '#27856A', '#A56752', '#7358FF',
  '#1D3164', '#BA5D07', '#777777', '#509BF5', '#E1118C',
];

const SearchPage = () => {
  const { category } = useParams();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await searchVideos(searchQuery, 30);
      setSearchResults(results.items);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (category) {
      const cat = musicCategories.find(c => c.id === category);
      if (cat) {
        setQuery(cat.name);
        performSearch(cat.query);
      }
    }
  }, [category, performSearch]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query && !category) {
        performSearch(query);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [query, category, performSearch]);

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <div className="h-full overflow-y-auto">
      <Header />
      
      <div className="px-6 pb-32 space-y-6">
        {/* Search Bar */}
        <div className="sticky top-0 z-10 py-4 bg-background">
          <div className="relative max-w-md">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to listen to?"
              className="spotify-input w-full pl-12 pr-10"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        {hasSearched ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">
              {isSearching ? 'Searching...' : `Results for "${query}"`}
            </h2>
            
            {isSearching ? (
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded bg-muted/30" />
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((video, index) => (
                  <TrackCard key={video.id} video={video} index={index + 1} showIndex />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No results found for "{query}"</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Browse all</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {musicCategories.map((cat, index) => (
                <CategoryCard
                  key={cat.id}
                  id={cat.id}
                  name={cat.name}
                  color={categoryColors[index % categoryColors.length]}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
