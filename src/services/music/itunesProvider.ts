import type { MusicProvider, SearchResult, Song, Album, Artist, Genre, Language, MoodType } from '../../types';

// Helper to map iTunes track to Song
function mapITunesToSong(t: any): Song {
  return {
    id: t.trackId ? t.trackId.toString() : Math.random().toString(),
    title: t.trackName || 'Unknown Title',
    artist: t.artistName || 'Unknown Artist',
    artistId: t.artistId ? t.artistId.toString() : '',
    album: t.collectionName || 'Single',
    albumId: t.collectionId ? t.collectionId.toString() : '',
    duration: Math.floor((t.trackTimeMillis || 0) / 1000),
    // iTunes returns 100x100 images, we can replace the URL string to get 600x600 for better quality
    coverUrl: t.artworkUrl100 ? t.artworkUrl100.replace('100x100bb', '600x600bb') : '',
    genre: t.primaryGenreName || 'Various',
    language: 'Unknown',
    releaseDate: t.releaseDate || '',
    isLiked: false,
    playCount: 0,
    previewUrl: t.previewUrl || '',
  };
}

// Helper to map iTunes collection to Album
function mapITunesToAlbum(a: any): Album {
  return {
    id: a.collectionId ? a.collectionId.toString() : Math.random().toString(),
    title: a.collectionName || 'Unknown Album',
    artist: a.artistName || 'Unknown Artist',
    artistId: a.artistId ? a.artistId.toString() : '',
    coverUrl: a.artworkUrl100 ? a.artworkUrl100.replace('100x100bb', '600x600bb') : '',
    releaseDate: a.releaseDate || '',
    genre: a.primaryGenreName || 'Various',
    songs: [],
    totalDuration: 0,
    trackCount: a.trackCount || 0,
  };
}

// Helper to map iTunes artist to Artist
function mapITunesToArtist(a: any): Artist {
  return {
    id: a.artistId ? a.artistId.toString() : Math.random().toString(),
    name: a.artistName || 'Unknown Artist',
    // iTunes artist search doesn't return an image, so we use a fallback avatar
    imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(a.artistName || 'Artist')}&background=random&size=600`,
    genres: a.primaryGenreName ? [a.primaryGenreName] : [],
    followers: 0,
    bio: '',
    verified: true,
  };
}

async function fetchITunes(path: string) {
  const res = await fetch(`https://itunes.apple.com${path}`);
  if (!res.ok) throw new Error('iTunes API Error');
  return res.json();
}

export const itunesProvider: MusicProvider = {
  name: 'itunes',

  async search(query: string): Promise<SearchResult> {
    try {
      const q = encodeURIComponent(query);
      // Fetch songs, artists, and albums concurrently
      const [songRes, artistRes, albumRes] = await Promise.all([
        fetchITunes(`/search?term=${q}&entity=song&limit=15`),
        fetchITunes(`/search?term=${q}&entity=musicArtist&limit=6`),
        fetchITunes(`/search?term=${q}&entity=album&limit=6`),
      ]);

      return {
        songs: (songRes.results || []).map(mapITunesToSong),
        artists: (artistRes.results || []).map(mapITunesToArtist),
        albums: (albumRes.results || []).map(mapITunesToAlbum),
        playlists: [],
      };
    } catch (error) {
      console.error('iTunes search error:', error);
      return { songs: [], artists: [], albums: [], playlists: [] };
    }
  },

  async getTrending(): Promise<Song[]> {
    try {
      // iTunes doesn't have a simple public trending endpoint for raw tracks easily, 
      // so we search for a popular term as a fallback
      const res = await fetchITunes(`/search?term=pop+hits&entity=song&limit=15`);
      return (res.results || []).map(mapITunesToSong);
    } catch {
      return [];
    }
  },

  async getNewReleases(): Promise<Album[]> {
    try {
      const res = await fetchITunes(`/search?term=new+music&entity=album&limit=10`);
      return (res.results || []).map(mapITunesToAlbum);
    } catch {
      return [];
    }
  },

  async getArtist(id: string): Promise<Artist | null> {
    try {
      const res = await fetchITunes(`/lookup?id=${id}&entity=musicArtist`);
      if (res.results && res.results.length > 0) {
        return mapITunesToArtist(res.results[0]);
      }
      return null;
    } catch {
      return null;
    }
  },

  async getArtistTopSongs(id: string): Promise<Song[]> {
    try {
      const res = await fetchITunes(`/lookup?id=${id}&entity=song&limit=15`);
      // The first result is the artist, the rest are songs
      const songs = (res.results || []).filter((r: any) => r.wrapperType === 'track');
      return songs.map(mapITunesToSong);
    } catch {
      return [];
    }
  },

  async getArtistAlbums(id: string): Promise<Album[]> {
    try {
      const res = await fetchITunes(`/lookup?id=${id}&entity=album&limit=10`);
      const albums = (res.results || []).filter((r: any) => r.wrapperType === 'collection');
      return albums.map(mapITunesToAlbum);
    } catch {
      return [];
    }
  },

  async getAlbum(id: string): Promise<Album | null> {
    try {
      const res = await fetchITunes(`/lookup?id=${id}&entity=album`);
      if (res.results && res.results.length > 0) {
        return mapITunesToAlbum(res.results[0]);
      }
      return null;
    } catch {
      return null;
    }
  },

  async getAlbumSongs(id: string): Promise<Song[]> {
    try {
      const res = await fetchITunes(`/lookup?id=${id}&entity=song`);
      const songs = (res.results || []).filter((r: any) => r.wrapperType === 'track');
      return songs.map(mapITunesToSong);
    } catch {
      return [];
    }
  },

  async getRecommendations(seedSongIds?: string[], mood?: MoodType): Promise<Song[]> {
    try {
      const term = mood ? `${mood} vibes` : 'top hits';
      const res = await fetchITunes(`/search?term=${encodeURIComponent(term)}&entity=song&limit=15`);
      return (res.results || []).map(mapITunesToSong).sort(() => Math.random() - 0.5);
    } catch {
      return [];
    }
  },

  async getGenres(): Promise<Genre[]> {
    return [
      { id: '1', name: 'Pop', imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', color: '#ff4b4b' },
      { id: '2', name: 'Rock', imageUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400', color: '#ff8f00' },
      { id: '3', name: 'Bollywood', imageUrl: 'https://images.unsplash.com/photo-1558231336-d7cfc5678da4?w=400', color: '#00c853' },
      { id: '4', name: 'Hip-Hop', imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400', color: '#2962ff' },
      { id: '5', name: 'Electronic', imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400', color: '#aa00ff' },
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
      const res = await fetchITunes(`/search?term=${encodeURIComponent(genre)}&entity=song&limit=20`);
      return (res.results || []).map(mapITunesToSong);
    } catch {
      return [];
    }
  },

  async getSongsByLanguage(language: string): Promise<Song[]> {
    try {
      const res = await fetchITunes(`/search?term=${encodeURIComponent(language)}&entity=song&limit=20`);
      return (res.results || []).map(mapITunesToSong);
    } catch {
      return [];
    }
  }
};
