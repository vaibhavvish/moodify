import type { MusicProvider, SearchResult, Song, Album, Artist, Genre, Language, MoodType } from '../../types';

// The base URL for the public JioSaavn API
// If this ever goes down, you can host your own by deploying https://github.com/sumitkolhe/jiosaavn-api to Vercel
const API_BASE = 'https://saavn.dev/api';

// Helper to extract the highest quality image
const getHighQualityImage = (imageArray: any[]): string => {
  if (!imageArray || !Array.isArray(imageArray) || imageArray.length === 0) return '';
  // Usually the last one is the highest quality (500x500)
  return imageArray[imageArray.length - 1].url;
};

// Helper to extract the highest quality download URL (the actual full song)
const getHighQualityAudio = (downloadUrlArray: any[]): string => {
  if (!downloadUrlArray || !Array.isArray(downloadUrlArray) || downloadUrlArray.length === 0) return '';
  // Usually the last one is the highest quality (320kbps)
  return downloadUrlArray[downloadUrlArray.length - 1].url;
};

// Helper to map Saavn track to Song
function mapSaavnToSong(t: any): Song {
  const primaryArtist = t.artists?.primary?.[0] || { name: 'Unknown Artist', id: '' };
  
  return {
    id: t.id || Math.random().toString(),
    title: t.name || 'Unknown Title',
    artist: primaryArtist.name,
    artistId: primaryArtist.id,
    album: t.album?.name || 'Single',
    albumId: t.album?.id || '',
    duration: t.duration || 0,
    coverUrl: getHighQualityImage(t.image),
    genre: 'Various',
    language: t.language || 'Unknown',
    releaseDate: t.year || '',
    isLiked: false,
    playCount: t.playCount || 0,
    previewUrl: getHighQualityAudio(t.downloadUrl), // Full audio url!
  };
}

// Helper to map Saavn album to Album
function mapSaavnToAlbum(a: any): Album {
  const primaryArtist = a.artists?.primary?.[0] || { name: 'Unknown Artist', id: '' };
  
  return {
    id: a.id || Math.random().toString(),
    title: a.name || 'Unknown Album',
    artist: primaryArtist.name,
    artistId: primaryArtist.id,
    coverUrl: getHighQualityImage(a.image),
    releaseDate: a.year || '',
    genre: 'Various',
    songs: [],
    totalDuration: 0,
    trackCount: a.songCount || 0,
  };
}

// Helper to map Saavn artist to Artist
function mapSaavnToArtist(a: any): Artist {
  return {
    id: a.id || Math.random().toString(),
    name: a.name || 'Unknown Artist',
    imageUrl: getHighQualityImage(a.image),
    genres: [],
    followers: a.followerCount || 0,
    bio: '',
    verified: a.isVerified || false,
  };
}

async function fetchSaavn(path: string) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error('Saavn API Error');
  const json = await res.json();
  if (!json.success) throw new Error('Saavn API returned unsuccessful data');
  return json.data;
}

export const saavnProvider: MusicProvider = {
  name: 'saavn',

  async search(query: string): Promise<SearchResult> {
    try {
      const q = encodeURIComponent(query);
      const [songRes, artistRes, albumRes] = await Promise.all([
        fetchSaavn(`/search/songs?query=${q}&limit=15`).catch(() => ({ results: [] })),
        fetchSaavn(`/search/artists?query=${q}&limit=6`).catch(() => ({ results: [] })),
        fetchSaavn(`/search/albums?query=${q}&limit=6`).catch(() => ({ results: [] })),
      ]);

      return {
        songs: (songRes.results || []).map(mapSaavnToSong),
        artists: (artistRes.results || []).map(mapSaavnToArtist),
        albums: (albumRes.results || []).map(mapSaavnToAlbum),
        playlists: [],
      };
    } catch (error) {
      console.error('Saavn search error:', error);
      return { songs: [], artists: [], albums: [], playlists: [] };
    }
  },

  async getTrending(): Promise<Song[]> {
    try {
      // Fetch some top charts
      const res = await fetchSaavn(`/search/songs?query=top+hits+hindi&limit=15`);
      return (res.results || []).map(mapSaavnToSong);
    } catch {
      return [];
    }
  },

  async getNewReleases(): Promise<Album[]> {
    try {
      const res = await fetchSaavn(`/search/albums?query=new+release&limit=10`);
      return (res.results || []).map(mapSaavnToAlbum);
    } catch {
      return [];
    }
  },

  async getArtist(id: string): Promise<Artist | null> {
    try {
      const res = await fetchSaavn(`/artists?id=${id}`);
      return mapSaavnToArtist(res);
    } catch {
      return null;
    }
  },

  async getArtistTopSongs(id: string): Promise<Song[]> {
    try {
      const res = await fetchSaavn(`/artists/${id}/songs`);
      return (res.songs || []).map(mapSaavnToSong);
    } catch {
      return [];
    }
  },

  async getArtistAlbums(id: string): Promise<Album[]> {
    try {
      const res = await fetchSaavn(`/artists/${id}/albums`);
      return (res.albums || []).map(mapSaavnToAlbum);
    } catch {
      return [];
    }
  },

  async getAlbum(id: string): Promise<Album | null> {
    try {
      const res = await fetchSaavn(`/albums?id=${id}`);
      return mapSaavnToAlbum(res);
    } catch {
      return null;
    }
  },

  async getAlbumSongs(id: string): Promise<Song[]> {
    try {
      const res = await fetchSaavn(`/albums?id=${id}`);
      return (res.songs || []).map(mapSaavnToSong);
    } catch {
      return [];
    }
  },

  async getRecommendations(seedSongIds?: string[], mood?: MoodType): Promise<Song[]> {
    try {
      const term = mood ? `${mood} mood hindi` : 'bollywood hits';
      const res = await fetchSaavn(`/search/songs?query=${encodeURIComponent(term)}&limit=15`);
      return (res.results || []).map(mapSaavnToSong).sort(() => Math.random() - 0.5);
    } catch {
      return [];
    }
  },

  async getGenres(): Promise<Genre[]> {
    return [
      { id: '1', name: 'Bollywood', imageUrl: 'https://images.unsplash.com/photo-1558231336-d7cfc5678da4?w=400', color: '#ff4b4b' },
      { id: '2', name: 'Pop', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', color: '#ff8f00' },
      { id: '3', name: 'Punjabi', imageUrl: 'https://images.unsplash.com/photo-1546707833-28c9b2ccab0a?w=400', color: '#00c853' },
      { id: '4', name: 'Hip-Hop', imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400', color: '#2962ff' },
      { id: '5', name: 'Lofi', imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', color: '#aa00ff' },
    ];
  },

  async getLanguages(): Promise<Language[]> {
    return [
      { id: 'hi', name: 'Hindi', code: 'hi', imageUrl: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400' },
      { id: 'en', name: 'English', code: 'en', imageUrl: 'https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?w=400' },
    ];
  },

  async getSongsByGenre(genre: string): Promise<Song[]> {
    try {
      const res = await fetchSaavn(`/search/songs?query=${encodeURIComponent(genre)}&limit=20`);
      return (res.results || []).map(mapSaavnToSong);
    } catch {
      return [];
    }
  },

  async getSongsByLanguage(language: string): Promise<Song[]> {
    try {
      const res = await fetchSaavn(`/search/songs?query=${encodeURIComponent(language)}&limit=20`);
      return (res.results || []).map(mapSaavnToSong);
    } catch {
      return [];
    }
  }
};
