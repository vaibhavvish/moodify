import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { MoodType, MoodSenseResult, VibeMatchResult } from '../types';

interface MoodState {
  currentMood: MoodType | null;
  moodInput: string;
  moodSenseResult: MoodSenseResult | null;
  vibeMatchResult: VibeMatchResult | null;
  isProcessing: boolean;
}

interface MoodContextType {
  state: MoodState;
  setMood: (mood: MoodType | null) => void;
  setMoodInput: (input: string) => void;
  setMoodSenseResult: (result: MoodSenseResult | null) => void;
  setVibeMatchResult: (result: VibeMatchResult | null) => void;
  setProcessing: (processing: boolean) => void;
  clearMood: () => void;
}

const MoodContext = createContext<MoodContextType | null>(null);

export function MoodProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MoodState>({
    currentMood: null,
    moodInput: '',
    moodSenseResult: null,
    vibeMatchResult: null,
    isProcessing: false,
  });

  const setMood = useCallback((mood: MoodType | null) => {
    setState((prev) => ({ ...prev, currentMood: mood }));
  }, []);

  const setMoodInput = useCallback((input: string) => {
    setState((prev) => ({ ...prev, moodInput: input }));
  }, []);

  const setMoodSenseResult = useCallback((result: MoodSenseResult | null) => {
    setState((prev) => ({ ...prev, moodSenseResult: result }));
  }, []);

  const setVibeMatchResult = useCallback((result: VibeMatchResult | null) => {
    setState((prev) => ({ ...prev, vibeMatchResult: result }));
  }, []);

  const setProcessing = useCallback((processing: boolean) => {
    setState((prev) => ({ ...prev, isProcessing: processing }));
  }, []);

  const clearMood = useCallback(() => {
    setState({
      currentMood: null,
      moodInput: '',
      moodSenseResult: null,
      vibeMatchResult: null,
      isProcessing: false,
    });
  }, []);

  return (
    <MoodContext.Provider
      value={{
        state,
        setMood,
        setMoodInput,
        setMoodSenseResult,
        setVibeMatchResult,
        setProcessing,
        clearMood,
      }}
    >
      {children}
    </MoodContext.Provider>
  );
}

export function useMood(): MoodContextType {
  const ctx = useContext(MoodContext);
  if (!ctx) throw new Error('useMood must be used within MoodProvider');
  return ctx;
}
