// const API_KEY = 'A';
const API_KEY = 'AIzaSyCve2oBSnY4WqTsvuMqtmaUxSxTdRkYHF0';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

// ========== CACHING LAYER ==========
// Simple in-memory cache with TTL (Time To Live)
const cache = {
  data: new Map<string, { data: any; timestamp: number }>(),
  
  get(key: string, ttlMinutes: number = 30) {
    const item = this.data.get(key);
    if (!item) return null;
    
    // Check if cache is expired
    const age = Date.now() - item.timestamp;
    const ttlMs = ttlMinutes * 60 * 1000;
    
    if (age > ttlMs) {
      this.data.delete(key);
      return null;
    }
    
    console.log(`📦 Cache HIT: ${key}`);
    return item.data;
  },
  
  set(key: string, data: any) {
    this.data.set(key, { data, timestamp: Date.now() });
    console.log(`💾 Cache SET: ${key}`);
  },
  
  delete(key: string) {
    this.data.delete(key);
  },
  
  clear() {
    this.data.clear();
  }
};

// Cache keys
const CACHE_KEYS = {
  popular: (maxResults: number) => `popular_${maxResults}`,
  search: (query: string, maxResults: number, pageToken?: string) => 
    `search_${query}_${maxResults}_${pageToken || 'first'}`,
  category: (category: string, maxResults: number) => 
    `category_${category}_${maxResults}`,
  videoDetails: (videoId: string) => `video_${videoId}`,
  related: (videoId: string, maxResults: number) => 
    `related_${videoId}_${maxResults}`,
};

// Cache TTLs (in minutes)
const CACHE_TTL = {
  popular: 30,      // Popular videos change daily
  search: 10,       // Search results for 10 minutes
  category: 20,     // Category results for 20 minutes
  videoDetails: 60, // Video details for 1 hour
  related: 15,      // Related videos for 15 minutes
};

// ========== CACHED API FUNCTIONS ==========
export const searchVideos = async (
  query: string,
  maxResults: number = 20,
  pageToken?: string
): Promise<SearchResult> => {
  const cacheKey = CACHE_KEYS.search(query, maxResults, pageToken);
  const cached = cache.get(cacheKey, CACHE_TTL.search);
  
  if (cached) {
    return cached;
  }
  
  const params = new URLSearchParams({
    part: 'snippet',
    q: `${query} music`,
    type: 'video',
    videoCategoryId: '10',
    maxResults: maxResults.toString(),
    key: API_KEY,
  });

  if (pageToken) {
    params.append('pageToken', pageToken);
  }

  const response = await fetch(`${BASE_URL}/search?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to search videos');
  }

  const data = await response.json();

  const result = {
    items: data.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
      thumbnailHigh: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
    })),
    nextPageToken: data.nextPageToken,
    totalResults: data.pageInfo.totalResults,
  };
  
  cache.set(cacheKey, result);
  return result;
};

export const getPopularMusicVideos = async (maxResults: number = 20): Promise<YouTubeVideo[]> => {
  const cacheKey = CACHE_KEYS.popular(maxResults);
  const cached = cache.get(cacheKey, CACHE_TTL.popular);
  
  if (cached) {
    return cached;
  }
  
  const params = new URLSearchParams({
    part: 'snippet',
    chart: 'mostPopular',
    videoCategoryId: '10',
    regionCode: 'US',
    maxResults: maxResults.toString(),
    key: API_KEY,
  });

  const response = await fetch(`${BASE_URL}/videos?${params}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch popular videos');
  }

  const data = await response.json();

  const result = data.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
    thumbnailHigh: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
  }));
  
  cache.set(cacheKey, result);
  return result;
};

export const getVideosByCategory = async (
  category: string,
  maxResults: number = 20
): Promise<YouTubeVideo[]> => {
  const cacheKey = CACHE_KEYS.category(category, maxResults);
  const cached = cache.get(cacheKey, CACHE_TTL.category);
  
  if (cached) {
    return cached;
  }
  
  const result = await searchVideos(`${category} music playlist`, maxResults).then(res => res.items);
  cache.set(cacheKey, result);
  return result;
};

export const getVideoDetails = async (videoId: string): Promise<YouTubeVideo | null> => {
  const cacheKey = CACHE_KEYS.videoDetails(videoId);
  const cached = cache.get(cacheKey, CACHE_TTL.videoDetails);
  
  if (cached) {
    return cached;
  }
  
  const params = new URLSearchParams({
    part: 'snippet,contentDetails',
    id: videoId,
    key: API_KEY,
  });

  const response = await fetch(`${BASE_URL}/videos?${params}`);
  
  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  if (data.items.length === 0) {
    return null;
  }

  const item = data.items[0];
  const result = {
    id: item.id,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.medium?.url,
    thumbnailHigh: item.snippet.thumbnails.high?.url,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
    duration: item.contentDetails?.duration,
  };
  
  cache.set(cacheKey, result);
  return result;
};

export const getRelatedVideos = async (videoId: string, maxResults: number = 10): Promise<YouTubeVideo[]> => {
  const cacheKey = CACHE_KEYS.related(videoId, maxResults);
  const cached = cache.get(cacheKey, CACHE_TTL.related);
  
  if (cached) {
    return cached;
  }
  
  const params = new URLSearchParams({
    part: 'snippet',
    relatedToVideoId: videoId,
    type: 'video',
    videoCategoryId: '10',
    maxResults: maxResults.toString(),
    key: API_KEY,
  });

  try {
    const response = await fetch(`${BASE_URL}/search?${params}`);
    
    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    const result = data.items
      .filter((item: any) => item.id.videoId)
      .map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.medium?.url,
        thumbnailHigh: item.snippet.thumbnails.high?.url,
        description: item.snippet.description,
        publishedAt: item.snippet.publishedAt,
      }));
    
    cache.set(cacheKey, result);
    return result;
  } catch {
    return [];
  }
};

// Export cache for manual control (optional)
export const clearCache = (pattern?: string) => {
  if (pattern) {
    // Clear specific cache entries
    for (const key of cache.data.keys()) {
      if (key.includes(pattern)) {
        cache.data.delete(key);
      }
    }
    console.log(`🧹 Cleared cache entries containing: "${pattern}"`);
  } else {
    // Clear all cache
    cache.clear();
    console.log('🧹 Cleared all cache');
  }
};

export const getCacheStats = () => {
  return {
    size: cache.data.size,
    keys: Array.from(cache.data.keys())
  };
};

// Predefined music categories for the home page (unchanged)
export const musicCategories = [
  { id: 'pop', name: 'Pop', query: 'pop hits 2024' },
  { id: 'hiphop', name: 'Hip-Hop', query: 'hip hop music 2024' },
  { id: 'rock', name: 'Rock', query: 'rock music hits' },
  { id: 'electronic', name: 'Electronic', query: 'electronic dance music' },
  { id: 'rnb', name: 'R&B', query: 'r&b music hits' },
  { id: 'indie', name: 'Indie', query: 'indie music 2024' },
  { id: 'jazz', name: 'Jazz', query: 'jazz music' },
  { id: 'classical', name: 'Classical', query: 'classical music' },
  { id: 'latin', name: 'Latin', query: 'latin music hits' },
  { id: 'kpop', name: 'K-Pop', query: 'k-pop music 2024' },
  { id: 'country', name: 'Country', query: 'country music hits' },
  { id: 'workout', name: 'Workout', query: 'workout music' },
  { id: 'chill', name: 'Chill', query: 'chill lofi music' },
  { id: 'party', name: 'Party', query: 'party music hits' },
  { id: 'focus', name: 'Focus', query: 'focus study music' },
  { id: 'sleep', name: 'Sleep', query: 'sleep music relaxing' },
];

// Export interfaces (unchanged)
export interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  thumbnailHigh: string;
  description: string;
  publishedAt: string;
  duration?: string;
}

export interface SearchResult {
  items: YouTubeVideo[];
  nextPageToken?: string;
  totalResults: number;
}