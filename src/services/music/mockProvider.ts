/**
 * Mock Music Provider
 * Implements the MusicProvider interface using local mock data.
 * This will be replaced with a real provider (Spotify, YouTube Music, etc.) in Phase 2.
 */
import type { MusicProvider, SearchResult, Song, Album, Artist, Genre, Language, MoodType } from '../../types';
import { mockSongs, mockArtists, mockAlbums, mockGenres, mockLanguages } from '../../data/mockData';

function delay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const mockMusicProvider: MusicProvider = {
  name: 'mock',

  async search(query: string): Promise<SearchResult> {
    await delay(400);
    const q = query.toLowerCase();
    return {
      songs: mockSongs.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.album.toLowerCase().includes(q) ||
          s.genre.toLowerCase().includes(q)
      ),
      artists: mockArtists.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.genres.some((g) => g.toLowerCase().includes(q))
      ),
      albums: mockAlbums.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.artist.toLowerCase().includes(q) ||
          a.genre.toLowerCase().includes(q)
      ),
      playlists: [],
    };
  },

  async getTrending(): Promise<Song[]> {
    await delay(300);
    return [...mockSongs].sort((a, b) => b.playCount - a.playCount).slice(0, 10);
  },

  async getNewReleases(): Promise<Album[]> {
    await delay(300);
    return [...mockAlbums]
      .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
      .slice(0, 8);
  },

  async getArtist(id: string): Promise<Artist | null> {
    await delay(200);
    return mockArtists.find((a) => a.id === id) || null;
  },

  async getArtistTopSongs(id: string): Promise<Song[]> {
    await delay(200);
    return mockSongs.filter((s) => s.artistId === id);
  },

  async getArtistAlbums(id: string): Promise<Album[]> {
    await delay(200);
    return mockAlbums.filter((a) => a.artistId === id);
  },

  async getAlbum(id: string): Promise<Album | null> {
    await delay(200);
    return mockAlbums.find((a) => a.id === id) || null;
  },

  async getAlbumSongs(id: string): Promise<Song[]> {
    await delay(200);
    const album = mockAlbums.find((a) => a.id === id);
    if (!album) return [];
    return album.songs
      .map((songId) => mockSongs.find((s) => s.id === songId))
      .filter(Boolean) as Song[];
  },

  async getRecommendations(_seedSongIds?: string[], mood?: MoodType): Promise<Song[]> {
    await delay(400);
    if (mood) {
      return mockSongs.filter((s) => s.mood?.includes(mood)).slice(0, 8);
    }
    // Shuffle-based recommendations
    return [...mockSongs].sort(() => Math.random() - 0.5).slice(0, 8);
  },

  async getGenres(): Promise<Genre[]> {
    await delay(200);
    return mockGenres;
  },

  async getLanguages(): Promise<Language[]> {
    await delay(200);
    return mockLanguages;
  },

  async getSongsByGenre(genre: string): Promise<Song[]> {
    await delay(300);
    return mockSongs.filter((s) => s.genre.toLowerCase() === genre.toLowerCase());
  },

  async getSongsByLanguage(language: string): Promise<Song[]> {
    await delay(300);
    return mockSongs.filter((s) => s.language.toLowerCase() === language.toLowerCase());
  },
};
