import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';
import type { Song, RepeatMode, ShuffleMode } from '../types';

// ============================================
// Player State
// ============================================
interface PlayerState {
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

const initialPlayerState: PlayerState = {
  currentSong: null,
  queue: [],
  queueIndex: -1,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.75,
  isMuted: false,
  repeatMode: 'off',
  shuffleMode: 'off',
  isFullScreen: false,
};

// ============================================
// Actions
// ============================================
type PlayerAction =
  | { type: 'PLAY_SONG'; payload: { song: Song; queue?: Song[] } }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'NEXT' }
  | { type: 'PREVIOUS' }
  | { type: 'SET_TIME'; payload: number }
  | { type: 'SET_DURATION'; payload: number }
  | { type: 'SET_VOLUME'; payload: number }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'TOGGLE_REPEAT' }
  | { type: 'TOGGLE_SHUFFLE' }
  | { type: 'TOGGLE_FULLSCREEN' }
  | { type: 'SET_QUEUE'; payload: Song[] }
  | { type: 'ADD_TO_QUEUE'; payload: Song }
  | { type: 'CLEAR_QUEUE' };

function playerReducer(state: PlayerState, action: PlayerAction): PlayerState {
  switch (action.type) {
    case 'PLAY_SONG': {
      const { song, queue } = action.payload;
      const newQueue = queue || [song];
      const idx = newQueue.findIndex((s) => s.id === song.id);
      return {
        ...state,
        currentSong: song,
        queue: newQueue,
        queueIndex: idx >= 0 ? idx : 0,
        isPlaying: true,
        currentTime: 0,
        duration: song.duration,
      };
    }
    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying };
    case 'PAUSE':
      return { ...state, isPlaying: false };
    case 'RESUME':
      return { ...state, isPlaying: true };
    case 'NEXT': {
      if (state.queue.length === 0) return state;
      let nextIdx = state.queueIndex + 1;
      if (nextIdx >= state.queue.length) {
        if (state.repeatMode === 'all') nextIdx = 0;
        else return { ...state, isPlaying: false };
      }
      const nextSong = state.queue[nextIdx];
      return {
        ...state,
        currentSong: nextSong,
        queueIndex: nextIdx,
        currentTime: 0,
        duration: nextSong.duration,
        isPlaying: true,
      };
    }
    case 'PREVIOUS': {
      if (state.currentTime > 3) {
        return { ...state, currentTime: 0 };
      }
      if (state.queue.length === 0) return state;
      let prevIdx = state.queueIndex - 1;
      if (prevIdx < 0) {
        if (state.repeatMode === 'all') prevIdx = state.queue.length - 1;
        else return { ...state, currentTime: 0 };
      }
      const prevSong = state.queue[prevIdx];
      return {
        ...state,
        currentSong: prevSong,
        queueIndex: prevIdx,
        currentTime: 0,
        duration: prevSong.duration,
        isPlaying: true,
      };
    }
    case 'SET_TIME':
      return { ...state, currentTime: action.payload };
    case 'SET_DURATION':
      return { ...state, duration: action.payload };
    case 'SET_VOLUME':
      return { ...state, volume: action.payload, isMuted: action.payload === 0 };
    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };
    case 'TOGGLE_REPEAT': {
      const modes: RepeatMode[] = ['off', 'all', 'one'];
      const idx = modes.indexOf(state.repeatMode);
      return { ...state, repeatMode: modes[(idx + 1) % modes.length] };
    }
    case 'TOGGLE_SHUFFLE':
      return { ...state, shuffleMode: state.shuffleMode === 'off' ? 'on' : 'off' };
    case 'TOGGLE_FULLSCREEN':
      return { ...state, isFullScreen: !state.isFullScreen };
    case 'SET_QUEUE':
      return { ...state, queue: action.payload };
    case 'ADD_TO_QUEUE':
      return { ...state, queue: [...state.queue, action.payload] };
    case 'CLEAR_QUEUE':
      return { ...state, queue: [], queueIndex: -1 };
    default:
      return state;
  }
}

// ============================================
// Context
// ============================================
interface PlayerContextType {
  state: PlayerState;
  playSong: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  setTime: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  toggleFullScreen: () => void;
  addToQueue: (song: Song) => void;
  setQueue: (queue: Song[]) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(playerReducer, initialPlayerState);

  const playSong = useCallback((song: Song, queue?: Song[]) => {
    dispatch({ type: 'PLAY_SONG', payload: { song, queue } });
  }, []);

  const togglePlay = useCallback(() => dispatch({ type: 'TOGGLE_PLAY' }), []);
  const pause = useCallback(() => dispatch({ type: 'PAUSE' }), []);
  const resume = useCallback(() => dispatch({ type: 'RESUME' }), []);
  const next = useCallback(() => dispatch({ type: 'NEXT' }), []);
  const previous = useCallback(() => dispatch({ type: 'PREVIOUS' }), []);
  const setTime = useCallback((t: number) => dispatch({ type: 'SET_TIME', payload: t }), []);
  const setVolume = useCallback((v: number) => dispatch({ type: 'SET_VOLUME', payload: v }), []);
  const toggleMute = useCallback(() => dispatch({ type: 'TOGGLE_MUTE' }), []);
  const toggleRepeat = useCallback(() => dispatch({ type: 'TOGGLE_REPEAT' }), []);
  const toggleShuffle = useCallback(() => dispatch({ type: 'TOGGLE_SHUFFLE' }), []);
  const toggleFullScreen = useCallback(() => dispatch({ type: 'TOGGLE_FULLSCREEN' }), []);
  const addToQueue = useCallback((song: Song) => dispatch({ type: 'ADD_TO_QUEUE', payload: song }), []);
  const setQueue = useCallback((queue: Song[]) => dispatch({ type: 'SET_QUEUE', payload: queue }), []);

  return (
    <PlayerContext.Provider
      value={{
        state,
        playSong,
        togglePlay,
        pause,
        resume,
        next,
        previous,
        setTime,
        setVolume,
        toggleMute,
        toggleRepeat,
        toggleShuffle,
        toggleFullScreen,
        addToQueue,
        setQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextType {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
