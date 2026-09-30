// ============================================
// Core Data Models for Moodify
// ============================================

// --- Song ---
export interface Song {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  album: string;
  albumId: string;
  duration: number; // seconds
  coverUrl: string;
  genre: string;
  language: string;
  releaseDate: string;
  isLiked: boolean;
  playCount: number;
  mood?: MoodType[];
  previewUrl?: string; // for future provider integration
}

// --- Artist ---
export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  genres: string[];
  followers: number;
  bio?: string;
  verified: boolean;
  topSongs?: string[]; // song ids
  albums?: string[]; // album ids
}

// --- Album ---
export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  coverUrl: string;
  releaseDate: string;
  genre: string;
  songs: string[]; // song ids
  totalDuration: number; // seconds
  trackCount: number;
}

// --- Playlist ---
export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  songs: string[]; // song ids
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  createdBy: string;
  mood?: MoodType;
  isVibeMix?: boolean;
}

// --- Mood ---
export type MoodType =
  | 'happy'
  | 'chill'
  | 'sad'
  | 'romantic'
  | 'energetic'
  | 'confident'
  | 'focus'
  | 'late-night'
  | 'workout'
  | 'road-trip'
  | 'nostalgic'
  | 'peaceful';

export interface MoodConfig {
  type: MoodType;
  label: string;
  icon: string;
  gradient: string;
  glowColor: string;
  bgClass: string;
  description: string;
}

export interface MoodSenseResult {
  mood: MoodType;
  context: string[];
  energy: 'low' | 'medium' | 'high';
  vibe: string[];
  confidence: number;
  inputText: string;
}

export interface VibeMatchResult {
  moodSense: MoodSenseResult;
  songs: Song[];
  vibeMixName: string;
  vibeMixDescription: string;
}

// --- User ---
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  likedSongs: string[];
  recentlyPlayed: string[];
  playlists: string[];
  followedArtists: string[];
  savedAlbums: string[];
  preferences: UserPreferences;
}

export interface UserPreferences {
  preferredMoods: MoodType[];
  preferredGenres: string[];
  preferredLanguages: string[];
  reducedMotion: boolean;
}

// --- Player ---
export type RepeatMode = 'off' | 'all' | 'one';
export type ShuffleMode = 'off' | 'on';

export interface PlayerState {
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  shuffleMode: ShuffleMode;
  isFullScreen: boolean;
}

// --- Search ---
export interface SearchResult {
  songs: Song[];
  artists: Artist[];
  albums: Album[];
  playlists: Playlist[];
}

export interface SearchState {
  query: string;
  results: SearchResult | null;
  isLoading: boolean;
  error: string | null;
  recentSearches: string[];
  activeCategory: SearchCategory;
}

export type SearchCategory = 'all' | 'songs' | 'artists' | 'albums' | 'playlists' | 'genres';

// --- Music Provider ---
export interface MusicProvider {
  name: string;
  search(query: string): Promise<SearchResult>;
  getTrending(): Promise<Song[]>;
  getNewReleases(): Promise<Album[]>;
  getArtist(id: string): Promise<Artist | null>;
  getArtistTopSongs(id: string): Promise<Song[]>;
  getArtistAlbums(id: string): Promise<Album[]>;
  getAlbum(id: string): Promise<Album | null>;
  getAlbumSongs(id: string): Promise<Song[]>;
  getRecommendations(seedSongIds?: string[], mood?: MoodType): Promise<Song[]>;
  getGenres(): Promise<Genre[]>;
  getLanguages(): Promise<Language[]>;
  getSongsByGenre(genre: string): Promise<Song[]>;
  getSongsByLanguage(language: string): Promise<Song[]>;
}

// --- Genre ---
export interface Genre {
  id: string;
  name: string;
  imageUrl: string;
  color: string;
}

// --- Language ---
export interface Language {
  id: string;
  name: string;
  code: string;
  imageUrl: string;
}

// --- UI State ---
export interface AppState {
  currentMood: MoodType | null;
  moodThemeActive: boolean;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
}
