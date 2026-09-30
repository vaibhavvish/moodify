import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import type { MoodSenseResult, Song } from '../types';
import { analyzeMood } from '../services/moodSense';
import { getMusicProvider } from '../services/music';

interface VibeFlowState {
  isActive: boolean;
  currentMoodResult: MoodSenseResult | null;
  history: Song[];
  skippedIds: string[];
  isGenerating: boolean;
}

interface VibeFlowContextType {
  state: VibeFlowState;
  startVibeFlow: (input: string, initialSongs?: Song[]) => Promise<Song[]>;
  stopVibeFlow: () => void;
  updateVibe: (input: string) => void;
  generateMoreTracks: (excludeIds: string[], count?: number) => Promise<Song[]>;
  recordSkip: (songId: string) => void;
  recordPlay: (song: Song) => void;
}

const VibeFlowContext = createContext<VibeFlowContextType | null>(null);

export function VibeFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VibeFlowState>({
    isActive: false,
    currentMoodResult: null,
    history: [],
    skippedIds: [],
    isGenerating: false,
  });

  const isGeneratingRef = useRef(false);

  const generateMoreTracks = useCallback(async (excludeIds: string[], count = 10): Promise<Song[]> => {
    if (!state.currentMoodResult || isGeneratingRef.current) return [];
    
    isGeneratingRef.current = true;
    setState(s => ({ ...s, isGenerating: true }));
    try {
      const provider = getMusicProvider();
      // Use the search method with mood vibe for more robust results
      const query = `${state.currentMoodResult.mood} ${state.currentMoodResult.energy} ${state.currentMoodResult.context[0] || ''}`.trim();
      
      const searchRes = await provider.search(query);
      let candidates = searchRes.songs || [];
      
      if (candidates.length < count) {
        // Fallback to general mood
        const fallbackRes = await provider.getRecommendations([], state.currentMoodResult.mood);
        candidates = [...candidates, ...fallbackRes];
      }

      // Filter out excluded (already in queue/history/skipped)
      let freshSongs = candidates.filter(s => !excludeIds.includes(s.id) && !state.skippedIds.includes(s.id));
      
      // Remove duplicates
      freshSongs = freshSongs.filter((song, index, self) => index === self.findIndex(t => t.id === song.id));
      
      // Apply some basic scoring
      if (state.currentMoodResult.energy === 'high') {
         freshSongs.sort(() => Math.random() - 0.3); // Slight bias to keep current sorting but add randomness
      } else {
         freshSongs.sort(() => Math.random() - 0.5);
      }

      const selected = freshSongs.slice(0, count);
      isGeneratingRef.current = false;
      setState(s => ({ ...s, isGenerating: false }));
      return selected;
    } catch (error) {
      console.error('Failed to generate VibeFlow tracks', error);
      isGeneratingRef.current = false;
      setState(s => ({ ...s, isGenerating: false }));
      return [];
    }
  }, [state.currentMoodResult, state.skippedIds]);

  const startVibeFlow = useCallback(async (input: string, initialSongs?: Song[]) => {
    const moodSense = analyzeMood(input);
    setState(s => ({ ...s, isActive: true, currentMoodResult: moodSense, history: [], skippedIds: [] }));
    return []; // We will handle fetching initial songs in the UI if initialSongs is not provided
  }, []);

  const stopVibeFlow = useCallback(() => {
    setState(s => ({ ...s, isActive: false }));
  }, []);

  const updateVibe = useCallback((input: string) => {
    const moodSense = analyzeMood(input);
    setState(s => ({ ...s, currentMoodResult: moodSense }));
  }, []);

  const recordSkip = useCallback((songId: string) => {
    setState(s => ({ ...s, skippedIds: [...s.skippedIds, songId] }));
  }, []);

  const recordPlay = useCallback((song: Song) => {
    setState(s => ({ ...s, history: [...s.history, song] }));
  }, []);

  return (
    <VibeFlowContext.Provider value={{ state, startVibeFlow, stopVibeFlow, updateVibe, generateMoreTracks, recordSkip, recordPlay }}>
      {children}
    </VibeFlowContext.Provider>
  );
}

export function useVibeFlow() {
  const ctx = useContext(VibeFlowContext);
  if (!ctx) throw new Error('useVibeFlow must be used within VibeFlowProvider');
  return ctx;
}
