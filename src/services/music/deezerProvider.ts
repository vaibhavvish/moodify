import type { MusicProvider, SearchResult, Song, Album, Artist, Genre, Language, MoodType } from '../../types';
import * as deezer from './deezerClient';

// Helper to map DeezerTrack to Song
function mapTrackToSong(track: deezer.DeezerTrack): Song {
  return {
    id: track.id.toString(),
    title: track.title,
    artist: track.artist.name,
    artistId: track.artist.id.toString(),
    album: track.album.title,
    albumId: track.album.id.toString(),
    duration: track.duration,
    coverUrl: track.album.cover_xl || track.album.cover_medium || track.album.cover || '',
    genre: 'Various', // Deezer track doesn't include genre directly
    language: 'Unknown',
    releaseDate: '', // Not always available on track object
    isLiked: false,
    playCount: track.rank || 0,
    previewUrl: track.preview,
  };
}

// Helper to map DeezerArtist to Artist
function mapArtistToArtist(artist: deezer.DeezerArtist): Artist {
  return {
    id: artist.id.toString(),
    name: artist.name,
    imageUrl: artist.picture_xl || artist.picture_medium || artist.picture || '',
    genres: [], // Requires separate fetch if needed
    followers: artist.nb_fan || 0,
    bio: '', // Deezer doesn't provide bio in standard API without special params
    verified: artist.nb_fan > 100000, // Guessing verified status based on fans
  };
}

// Helper to map DeezerAlbum to Album
function mapAlbumToAlbum(album: deezer.DeezerAlbum): Album {
  return {
    id: album.id.toString(),
    title: album.title,
    artist: album.artist?.name || 'Unknown Artist',
    artistId: album.artist?.id?.toString() || '',
    coverUrl: album.cover_xl || album.cover_medium || album.cover || '',
    releaseDate: album.release_date || '',
    genre: 'Various', // Genre ID provided but need name
    songs: album.tracks?.data.map((t) => t.id.toString()) || [],
    totalDuration: album.duration || 0,
    trackCount: album.nb_tracks || 0,
  };
}

export const deezerProvider: MusicProvider = {
  name: 'deezer',

  async search(query: string): Promise<SearchResult> {
    try {
      const [tracks, artists, albums] = await Promise.all([
        deezer.searchTracks(query, 10),
        deezer.searchArtists(query, 6),
        deezer.searchAlbums(query, 6),
      ]);

      return {
        songs: tracks.data.map(mapTrackToSong),
        artists: artists.data.map(mapArtistToArtist),
        albums: albums.data.map(mapAlbumToAlbum),
        playlists: [], // Deezer playlists search not fully mapped yet
      };
    } catch (error) {
      console.error('Deezer search error:', error);
      return { songs: [], artists: [], albums: [], playlists: [] };
    }
  },

  async getTrending(): Promise<Song[]> {
    try {
      const chart = await deezer.getChartTracks(15);
      return chart.data.map(mapTrackToSong);
    } catch (error) {
      console.error('Deezer getTrending error:', error);
      return [];
    }
  },

  async getNewReleases(): Promise<Album[]> {
    try {
      const chart = await deezer.getChartAlbums(10);
      return chart.data.map(mapAlbumToAlbum);
    } catch (error) {
      console.error('Deezer getNewReleases error:', error);
      return [];
    }
  },

  async getArtist(id: string): Promise<Artist | null> {
    try {
      const numId = parseInt(id, 10);
      const artist = await deezer.getArtist(numId);
      return mapArtistToArtist(artist);
    } catch (error) {
      console.error('Deezer getArtist error:', error);
      return null;
    }
  },

  async getArtistTopSongs(id: string): Promise<Song[]> {
    try {
      const numId = parseInt(id, 10);
      const results = await deezer.getArtistTopTracks(numId, 10);
      return results.data.map(mapTrackToSong);
    } catch (error) {
      console.error('Deezer getArtistTopSongs error:', error);
      return [];
    }
  },

  async getArtistAlbums(id: string): Promise<Album[]> {
    try {
      const numId = parseInt(id, 10);
      const results = await deezer.getArtistAlbums(numId, 10);
      return results.data.map(mapAlbumToAlbum);
    } catch (error) {
      console.error('Deezer getArtistAlbums error:', error);
      return [];
    }
  },

  async getAlbum(id: string): Promise<Album | null> {
    try {
      const numId = parseInt(id, 10);
      const album = await deezer.getAlbum(numId);
      return mapAlbumToAlbum(album);
    } catch (error) {
      console.error('Deezer getAlbum error:', error);
      return null;
    }
  },

  async getAlbumSongs(id: string): Promise<Song[]> {
    try {
      const numId = parseInt(id, 10);
      const album = await deezer.getAlbum(numId);
      if (!album.tracks || !album.tracks.data) return [];
      return album.tracks.data.map(mapTrackToSong);
    } catch (error) {
      console.error('Deezer getAlbumSongs error:', error);
      return [];
    }
  },

  async getRecommendations(seedSongIds?: string[], mood?: MoodType): Promise<Song[]> {
    try {
      // Deezer doesn't have a direct recommendations endpoint for unauthenticated users
      // So we fallback to a chart or a search based on mood
      if (mood) {
        const results = await deezer.searchTracks(`${mood} vibes`, 15);
        return results.data.map(mapTrackToSong);
      }
      
      const chart = await deezer.getChartTracks(10);
      return chart.data.map(mapTrackToSong).sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error('Deezer getRecommendations error:', error);
      return [];
    }
  },

  async getGenres(): Promise<Genre[]> {
    try {
      const genres = await deezer.getGenres();
      return genres.data.filter((g) => g.name !== 'All').map((g) => ({
        id: g.id.toString(),
        name: g.name,
        imageUrl: g.picture_xl || g.picture_medium || g.picture || '',
        color: '#2a2a2a', // Fallback, could generate hash color based on name
      }));
    } catch (error) {
      console.error('Deezer getGenres error:', error);
      return [];
    }
  },

  async getLanguages(): Promise<Language[]> {
    // Deezer doesn't have a specific language endpoint
    return [
      { id: 'en', name: 'English', code: 'en', imageUrl: 'https://images.unsplash.com/photo-1527866959252-deab85ef7d1b?w=400&q=80' },
      { id: 'es', name: 'Spanish', code: 'es', imageUrl: 'https://images.unsplash.com/photo-1539037116277-4db20202d03e?w=400&q=80' },
      { id: 'fr', name: 'French', code: 'fr', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80' },
      { id: 'ko', name: 'Korean', code: 'ko', imageUrl: 'https://images.unsplash.com/photo-1538481199005-27179657b0c8?w=400&q=80' },
    ];
  },

  async getSongsByGenre(genre: string): Promise<Song[]> {
    try {
      const results = await deezer.searchTracks(genre, 20);
      return results.data.map(mapTrackToSong);
    } catch (error) {
      console.error('Deezer getSongsByGenre error:', error);
      return [];
    }
  },

  async getSongsByLanguage(language: string): Promise<Song[]> {
    try {
      const results = await deezer.searchTracks(language, 20);
      return results.data.map(mapTrackToSong);
    } catch (error) {
      console.error('Deezer getSongsByLanguage error:', error);
      return [];
    }
  }
};
