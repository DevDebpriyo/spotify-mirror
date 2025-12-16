// const API_KEY = 'A';
const API_KEY = 'AIzaSyCve2oBSnY4WqTsvuMqtmaUxSxTdRkYHF0';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

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

export const searchVideos = async (
  query: string,
  maxResults: number = 20,
  pageToken?: string
): Promise<SearchResult> => {
  const params = new URLSearchParams({
    part: 'snippet',
    q: `${query} music`,
    type: 'video',
    videoCategoryId: '10', // Music category
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

  return {
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
};

export const getPopularMusicVideos = async (maxResults: number = 20): Promise<YouTubeVideo[]> => {
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

  return data.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
    thumbnailHigh: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.medium?.url,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
  }));
};

export const getVideosByCategory = async (
  category: string,
  maxResults: number = 20
): Promise<YouTubeVideo[]> => {
  return searchVideos(`${category} music playlist`, maxResults).then(res => res.items);
};

export const getVideoDetails = async (videoId: string): Promise<YouTubeVideo | null> => {
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
  return {
    id: item.id,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    thumbnail: item.snippet.thumbnails.medium?.url,
    thumbnailHigh: item.snippet.thumbnails.high?.url,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
    duration: item.contentDetails?.duration,
  };
};

export const getRelatedVideos = async (videoId: string, maxResults: number = 10): Promise<YouTubeVideo[]> => {
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

    return data.items
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
  } catch {
    return [];
  }
};

// Predefined music categories for the home page
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
