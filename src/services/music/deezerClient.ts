/**
 * Deezer API Client
 * Low-level HTTP client for Deezer's public API.
 * All requests go through the Vite proxy (/api/deezer) to avoid CORS.
 * No API key required — Deezer's public catalog is openly accessible.
 */

const BASE = '/api/deezer';

// Simple in-memory cache to avoid redundant API calls
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, timestamp: Date.now() });
}

async function fetchJson<T>(path: string, useCache = true): Promise<T> {
  const url = `${BASE}${path}`;
  if (useCache) {
    const cached = getCached<T>(url);
    if (cached) return cached;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Deezer API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();

  if (data.error) {
    throw new Error(`Deezer API error: ${data.error.message || 'Unknown error'}`);
  }

  if (useCache) setCache(url, data);
  return data as T;
}

// ============================================
// Deezer API Response Types
// ============================================

export interface DeezerTrack {
  id: number;
  readable: boolean;
  title: string;
  title_short: string;
  duration: number;
  rank: number;
  explicit_lyrics: boolean;
  preview: string;
  md5_image: string;
  artist: {
    id: number;
    name: string;
    picture: string;
    picture_small: string;
    picture_medium: string;
    picture_big: string;
    picture_xl: string;
  };
  album: {
    id: number;
    title: string;
    cover: string;
    cover_small: string;
    cover_medium: string;
    cover_big: string;
    cover_xl: string;
  };
  type: 'track';
}

export interface DeezerArtist {
  id: number;
  name: string;
  link: string;
  picture: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
  nb_album: number;
  nb_fan: number;
  type: 'artist';
}

export interface DeezerAlbum {
  id: number;
  title: string;
  cover: string;
  cover_small: string;
  cover_medium: string;
  cover_big: string;
  cover_xl: string;
  genre_id: number;
  nb_tracks: number;
  duration: number;
  fans: number;
  release_date: string;
  record_type: string;
  available: boolean;
  artist: {
    id: number;
    name: string;
    picture: string;
    picture_small: string;
    picture_medium: string;
    picture_big: string;
  };
  type: 'album';
  tracks?: { data: DeezerTrack[] };
}

export interface DeezerGenre {
  id: number;
  name: string;
  picture: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
  type: 'genre';
}

export interface DeezerSearchResult<T> {
  data: T[];
  total: number;
  next?: string;
}

export interface DeezerChartTracks {
  data: DeezerTrack[];
  total: number;
}

export interface DeezerChartAlbums {
  data: DeezerAlbum[];
  total: number;
}

export interface DeezerChartArtists {
  data: DeezerArtist[];
  total: number;
}

// ============================================
// API Methods
// ============================================

export async function searchTracks(query: string, limit = 25): Promise<DeezerSearchResult<DeezerTrack>> {
  return fetchJson(`/search?q=${encodeURIComponent(query)}&limit=${limit}`);
}

export async function searchArtists(query: string, limit = 10): Promise<DeezerSearchResult<DeezerArtist>> {
  return fetchJson(`/search/artist?q=${encodeURIComponent(query)}&limit=${limit}`);
}

export async function searchAlbums(query: string, limit = 10): Promise<DeezerSearchResult<DeezerAlbum>> {
  return fetchJson(`/search/album?q=${encodeURIComponent(query)}&limit=${limit}`);
}

export async function getTrack(id: number): Promise<DeezerTrack> {
  return fetchJson(`/track/${id}`);
}

export async function getArtist(id: number): Promise<DeezerArtist> {
  return fetchJson(`/artist/${id}`);
}

export async function getArtistTopTracks(id: number, limit = 20): Promise<DeezerSearchResult<DeezerTrack>> {
  return fetchJson(`/artist/${id}/top?limit=${limit}`);
}

export async function getArtistAlbums(id: number, limit = 20): Promise<DeezerSearchResult<DeezerAlbum>> {
  return fetchJson(`/artist/${id}/albums?limit=${limit}`);
}

export async function getAlbum(id: number): Promise<DeezerAlbum> {
  return fetchJson(`/album/${id}`);
}

export async function getGenres(): Promise<{ data: DeezerGenre[] }> {
  return fetchJson('/genre');
}

export async function getChartTracks(limit = 20): Promise<DeezerChartTracks> {
  return fetchJson(`/chart/0/tracks?limit=${limit}`);
}

export async function getChartAlbums(limit = 10): Promise<DeezerChartAlbums> {
  return fetchJson(`/chart/0/albums?limit=${limit}`);
}

export async function getChartArtists(limit = 10): Promise<DeezerChartArtists> {
  return fetchJson(`/chart/0/artists?limit=${limit}`);
}

export async function getGenreArtists(genreId: number, limit = 20): Promise<DeezerSearchResult<DeezerArtist>> {
  return fetchJson(`/genre/${genreId}/artists?limit=${limit}`);
}

export async function getEditorialReleases(limit = 10): Promise<DeezerChartAlbums> {
  return fetchJson(`/chart/0/albums?limit=${limit}`);
}
