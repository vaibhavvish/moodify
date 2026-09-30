import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react';
import type { Song, Playlist } from '../types';
import { mockSongs } from '../data/mockData';
import { useAuth } from './authStore';
import { toastUtils } from './toastStore';
import * as libraryService from '../services/libraryService';

// ============================================
// Library State
// ============================================
interface LibraryState {
  likedSongs: string[]; // song IDs
  recentlyPlayed: string[]; // song IDs (most recent first)
  playlists: Playlist[];
  savedAlbums: string[];
  followedArtists: string[];
  songCache: Record<string, Song>;
}

const STORAGE_KEY = 'moodify_library';

function loadFromStorage(): LibraryState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    likedSongs: ['song-2', 'song-5', 'song-8', 'song-14'],
    recentlyPlayed: ['song-1', 'song-3', 'song-10', 'song-6', 'song-8'],
    playlists: [],
    savedAlbums: [],
    followedArtists: [],
    songCache: mockSongs.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}),
  };
}

function saveToStorage(state: LibraryState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

// ============================================
// Actions
// ============================================
type LibraryAction =
  | { type: 'SET_STATE'; payload: LibraryState }
  | { type: 'TOGGLE_LIKE'; payload: Song }
  | { type: 'ADD_RECENTLY_PLAYED'; payload: Song }
  | { type: 'CREATE_PLAYLIST'; payload: Playlist }
  | { type: 'DELETE_PLAYLIST'; payload: string }
  | { type: 'RENAME_PLAYLIST'; payload: { id: string; name: string } }
  | { type: 'ADD_TO_PLAYLIST'; payload: { playlistId: string; songId: string } }
  | { type: 'REMOVE_FROM_PLAYLIST'; payload: { playlistId: string; songId: string } }
  | { type: 'SAVE_ALBUM'; payload: string }
  | { type: 'UNSAVE_ALBUM'; payload: string }
  | { type: 'FOLLOW_ARTIST'; payload: string }
  | { type: 'UNFOLLOW_ARTIST'; payload: string };

function libraryReducer(state: LibraryState, action: LibraryAction): LibraryState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'TOGGLE_LIKE': {
      const song = action.payload;
      const id = song.id;
      const liked = state.likedSongs.includes(id)
        ? state.likedSongs.filter((s) => s !== id)
        : [...state.likedSongs, id];
      return { 
        ...state, 
        likedSongs: liked,
        songCache: { ...state.songCache, [id]: song }
      };
    }
    case 'ADD_RECENTLY_PLAYED': {
      const song = action.payload;
      const id = song.id;
      const filtered = state.recentlyPlayed.filter((s) => s !== id);
      return { 
        ...state, 
        recentlyPlayed: [id, ...filtered].slice(0, 20),
        songCache: { ...state.songCache, [id]: song }
      };
    }
    case 'CREATE_PLAYLIST':
      return { ...state, playlists: [...state.playlists, action.payload] };
    case 'DELETE_PLAYLIST':
      return { ...state, playlists: state.playlists.filter((p) => p.id !== action.payload) };
    case 'RENAME_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.map((p) =>
          p.id === action.payload.id ? { ...p, name: action.payload.name, updatedAt: new Date().toISOString() } : p
        ),
      };
    case 'ADD_TO_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.map((p) =>
          p.id === action.payload.playlistId && !p.songs.includes(action.payload.songId)
            ? { ...p, songs: [...p.songs, action.payload.songId], updatedAt: new Date().toISOString() }
            : p
        ),
      };
    case 'REMOVE_FROM_PLAYLIST':
      return {
        ...state,
        playlists: state.playlists.map((p) =>
          p.id === action.payload.playlistId
            ? { ...p, songs: p.songs.filter((s) => s !== action.payload.songId), updatedAt: new Date().toISOString() }
            : p
        ),
      };
    case 'SAVE_ALBUM':
      return { ...state, savedAlbums: [...state.savedAlbums, action.payload] };
    case 'UNSAVE_ALBUM':
      return { ...state, savedAlbums: state.savedAlbums.filter((a) => a !== action.payload) };
    case 'FOLLOW_ARTIST':
      return { ...state, followedArtists: [...state.followedArtists, action.payload] };
    case 'UNFOLLOW_ARTIST':
      return { ...state, followedArtists: state.followedArtists.filter((a) => a !== action.payload) };
    default:
      return state;
  }
}

// ============================================
// Context
// ============================================
interface LibraryContextType {
  state: LibraryState;
  toggleLike: (song: Song) => void;
  isLiked: (songId: string) => boolean;
  addRecentlyPlayed: (song: Song) => void;
  createPlaylist: (name: string, description?: string) => Playlist;
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  addToPlaylist: (playlistId: string, songId: string) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  getLikedSongs: () => Song[];
  getRecentlyPlayedSongs: () => Song[];
  toggleSaveAlbum: (albumId: string) => void;
  toggleFollowArtist: (artistId: string) => void;
}

const LibraryContext = createContext<LibraryContextType | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(libraryReducer, undefined, loadFromStorage);
  const { user, isInitialized } = useAuth();

  // Cloud Sync on Auth Change
  useEffect(() => {
    if (isInitialized && user) {
      const syncCloud = async () => {
        // Fetch cloud data
        const [cloudLiked, cloudRecent, cloudPlaylists, cloudAlbums, cloudArtists] = await Promise.all([
          libraryService.getCloudLikedSongs(),
          libraryService.getCloudRecentlyPlayed(),
          libraryService.getCloudPlaylists(),
          libraryService.getCloudSavedAlbums(),
          libraryService.getCloudFollowedArtists()
        ]);

        const newState = { ...state };

        // Cache cloud songs
        cloudLiked.forEach(s => newState.songCache[s.id] = s);
        cloudRecent.forEach(s => newState.songCache[s.id] = s);

        // Merge Liked
        const cloudLikedIds = cloudLiked.map(s => s.id);
        const uniqueLiked = Array.from(new Set([...state.likedSongs, ...cloudLikedIds]));
        newState.likedSongs = uniqueLiked;

        // Sync local-only liked to cloud
        for (const id of state.likedSongs) {
          if (!cloudLikedIds.includes(id) && state.songCache[id]) {
            libraryService.syncLikedSong(state.songCache[id], true);
          }
        }

        // Merge Recent
        const cloudRecentIds = cloudRecent.map(s => s.id);
        const uniqueRecent = Array.from(new Set([...cloudRecentIds, ...state.recentlyPlayed])).slice(0, 20);
        newState.recentlyPlayed = uniqueRecent;

        for (const id of state.recentlyPlayed) {
          if (!cloudRecentIds.includes(id) && state.songCache[id]) {
            libraryService.syncRecentlyPlayed(state.songCache[id]);
          }
        }

        // Replace playlists with cloud (to avoid complex merges, we prioritize cloud playlists)
        // If they have local playlists, we upload them if they don't exist in cloud
        const cloudPlaylistIds = cloudPlaylists.map(p => p.id);
        for (const localPlaylist of state.playlists) {
          if (!cloudPlaylistIds.includes(localPlaylist.id)) {
            await libraryService.syncCreatePlaylist(localPlaylist);
            // Sync songs in that playlist
            for (const sid of localPlaylist.songs) {
              const song = state.songCache[sid];
              if (song) libraryService.syncAddToPlaylist(localPlaylist.id, song);
            }
          }
        }
        
        // Refetch playlists to get the merged result
        const finalPlaylists = await libraryService.getCloudPlaylists();
        newState.playlists = finalPlaylists.length > 0 ? finalPlaylists : state.playlists;

        newState.savedAlbums = Array.from(new Set([...state.savedAlbums, ...cloudAlbums]));
        newState.followedArtists = Array.from(new Set([...state.followedArtists, ...cloudArtists]));

        dispatch({ type: 'SET_STATE', payload: newState });
      };

      syncCloud();
    }
  }, [user, isInitialized]);

  // Persist to localStorage on every change
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  const toggleLike = useCallback((song: Song) => {
    const isLiked = !state.likedSongs.includes(song.id);
    dispatch({ type: 'TOGGLE_LIKE', payload: song });
    libraryService.syncLikedSong(song, isLiked);
    toastUtils.addToast(isLiked ? 'Added to Liked Songs' : 'Removed from Liked Songs', isLiked ? 'success' : 'info');
  }, [state.likedSongs]);

  const isLiked = useCallback(
    (songId: string) => state.likedSongs.includes(songId),
    [state.likedSongs]
  );

  const addRecentlyPlayed = useCallback((song: Song) => {
    dispatch({ type: 'ADD_RECENTLY_PLAYED', payload: song });
    libraryService.syncRecentlyPlayed(song);
  }, []);

  const createPlaylist = useCallback((name: string, description?: string): Playlist => {
    const playlist: Playlist = {
      id: crypto.randomUUID ? crypto.randomUUID() : `playlist-user-${Date.now()}`,
      name,
      description,
      songs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPublic: false,
      createdBy: 'user',
    };
    dispatch({ type: 'CREATE_PLAYLIST', payload: playlist });
    libraryService.syncCreatePlaylist(playlist);
    toastUtils.addToast(`Playlist "${name}" created`);
    return playlist;
  }, []);

  const deletePlaylist = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PLAYLIST', payload: id });
    libraryService.syncDeletePlaylist(id);
    toastUtils.addToast(`Playlist deleted`);
  }, []);

  const renamePlaylist = useCallback((id: string, name: string) => {
    dispatch({ type: 'RENAME_PLAYLIST', payload: { id, name } });
    libraryService.syncRenamePlaylist(id, name);
  }, []);

  const addToPlaylist = useCallback((playlistId: string, songId: string) => {
    dispatch({ type: 'ADD_TO_PLAYLIST', payload: { playlistId, songId } });
    const song = state.songCache[songId];
    if (song) libraryService.syncAddToPlaylist(playlistId, song);
  }, [state.songCache]);

  const removeFromPlaylist = useCallback((playlistId: string, songId: string) => {
    dispatch({ type: 'REMOVE_FROM_PLAYLIST', payload: { playlistId, songId } });
    libraryService.syncRemoveFromPlaylist(playlistId, songId);
  }, []);

  const getLikedSongs = useCallback((): Song[] => {
    return state.likedSongs
      .map((id) => state.songCache[id] || mockSongs.find((s) => s.id === id))
      .filter(Boolean) as Song[];
  }, [state.likedSongs, state.songCache]);

  const getRecentlyPlayedSongs = useCallback((): Song[] => {
    return state.recentlyPlayed
      .map((id) => state.songCache[id] || mockSongs.find((s) => s.id === id))
      .filter(Boolean) as Song[];
  }, [state.recentlyPlayed, state.songCache]);

  const toggleSaveAlbum = useCallback((albumId: string) => {
    const isSaved = !state.savedAlbums.includes(albumId);
    dispatch({ type: isSaved ? 'SAVE_ALBUM' : 'UNSAVE_ALBUM', payload: albumId });
    libraryService.syncSavedAlbum(albumId, isSaved);
    toastUtils.addToast(isSaved ? 'Album saved to Library' : 'Album removed from Library');
  }, [state.savedAlbums]);

  const toggleFollowArtist = useCallback((artistId: string) => {
    const isFollowed = !state.followedArtists.includes(artistId);
    dispatch({ type: isFollowed ? 'FOLLOW_ARTIST' : 'UNFOLLOW_ARTIST', payload: artistId });
    libraryService.syncFollowedArtist(artistId, isFollowed);
    toastUtils.addToast(isFollowed ? 'Artist followed' : 'Artist unfollowed');
  }, [state.followedArtists]);

  return (
    <LibraryContext.Provider
      value={{
        state,
        toggleLike,
        isLiked,
        addRecentlyPlayed,
        createPlaylist,
        deletePlaylist,
        renamePlaylist,
        addToPlaylist,
        removeFromPlaylist,
        getLikedSongs,
        getRecentlyPlayedSongs,
        toggleSaveAlbum,
        toggleFollowArtist,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryContextType {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used within LibraryProvider');
  return ctx;
}
