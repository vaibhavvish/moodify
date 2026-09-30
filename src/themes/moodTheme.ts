import type { MoodType } from '../types';
import { moodConfigs } from '../data/moods';

/**
 * MoodTheme System
 * Provides mood-specific visual configurations that can be applied
 * throughout the application for ambient atmosphere changes.
 */

export interface MoodTheme {
  mood: MoodType;
  gradient: string;
  glowColor: string;
  bgClass: string;
  orbColors: string[];
  animationSpeed: 'slow' | 'normal' | 'fast';
  intensity: 'low' | 'medium' | 'high';
}

const moodThemes: Record<MoodType, MoodTheme> = {
  happy: {
    mood: 'happy',
    gradient: 'from-amber-400 via-orange-400 to-yellow-300',
    glowColor: 'rgba(251, 191, 36, 0.25)',
    bgClass: 'bg-gradient-to-br from-amber-500/8 via-orange-500/4 to-transparent',
    orbColors: ['rgba(251, 191, 36, 0.4)', 'rgba(249, 115, 22, 0.3)', 'rgba(234, 179, 8, 0.2)'],
    animationSpeed: 'fast',
    intensity: 'high',
  },
  chill: {
    mood: 'chill',
    gradient: 'from-cyan-400 via-teal-400 to-emerald-400',
    glowColor: 'rgba(34, 211, 238, 0.25)',
    bgClass: 'bg-gradient-to-br from-cyan-500/8 via-teal-500/4 to-transparent',
    orbColors: ['rgba(34, 211, 238, 0.3)', 'rgba(20, 184, 166, 0.25)', 'rgba(52, 211, 153, 0.2)'],
    animationSpeed: 'slow',
    intensity: 'low',
  },
  sad: {
    mood: 'sad',
    gradient: 'from-blue-500 via-indigo-500 to-purple-600',
    glowColor: 'rgba(99, 102, 241, 0.25)',
    bgClass: 'bg-gradient-to-br from-blue-500/8 via-indigo-500/4 to-transparent',
    orbColors: ['rgba(99, 102, 241, 0.3)', 'rgba(79, 70, 229, 0.25)', 'rgba(147, 51, 234, 0.15)'],
    animationSpeed: 'slow',
    intensity: 'medium',
  },
  romantic: {
    mood: 'romantic',
    gradient: 'from-pink-400 via-rose-400 to-red-400',
    glowColor: 'rgba(244, 114, 182, 0.25)',
    bgClass: 'bg-gradient-to-br from-pink-500/8 via-rose-500/4 to-transparent',
    orbColors: ['rgba(244, 114, 182, 0.3)', 'rgba(251, 113, 133, 0.25)', 'rgba(239, 68, 68, 0.15)'],
    animationSpeed: 'slow',
    intensity: 'medium',
  },
  energetic: {
    mood: 'energetic',
    gradient: 'from-red-500 via-orange-500 to-yellow-500',
    glowColor: 'rgba(239, 68, 68, 0.25)',
    bgClass: 'bg-gradient-to-br from-red-500/8 via-orange-500/4 to-transparent',
    orbColors: ['rgba(239, 68, 68, 0.35)', 'rgba(249, 115, 22, 0.3)', 'rgba(234, 179, 8, 0.2)'],
    animationSpeed: 'fast',
    intensity: 'high',
  },
  confident: {
    mood: 'confident',
    gradient: 'from-yellow-400 via-amber-500 to-orange-600',
    glowColor: 'rgba(245, 158, 11, 0.25)',
    bgClass: 'bg-gradient-to-br from-yellow-500/8 via-amber-500/4 to-transparent',
    orbColors: ['rgba(245, 158, 11, 0.3)', 'rgba(217, 119, 6, 0.25)', 'rgba(234, 88, 12, 0.15)'],
    animationSpeed: 'normal',
    intensity: 'high',
  },
  focus: {
    mood: 'focus',
    gradient: 'from-slate-400 via-gray-400 to-zinc-500',
    glowColor: 'rgba(148, 163, 184, 0.15)',
    bgClass: 'bg-gradient-to-br from-slate-500/5 via-gray-500/3 to-transparent',
    orbColors: ['rgba(148, 163, 184, 0.15)', 'rgba(107, 114, 128, 0.1)', 'rgba(82, 82, 91, 0.08)'],
    animationSpeed: 'slow',
    intensity: 'low',
  },
  'late-night': {
    mood: 'late-night',
    gradient: 'from-indigo-500 via-purple-600 to-violet-700',
    glowColor: 'rgba(139, 92, 246, 0.25)',
    bgClass: 'bg-gradient-to-br from-indigo-500/8 via-purple-500/4 to-transparent',
    orbColors: ['rgba(139, 92, 246, 0.3)', 'rgba(124, 58, 237, 0.25)', 'rgba(109, 40, 217, 0.15)'],
    animationSpeed: 'slow',
    intensity: 'medium',
  },
  workout: {
    mood: 'workout',
    gradient: 'from-green-400 via-emerald-500 to-teal-500',
    glowColor: 'rgba(16, 185, 129, 0.25)',
    bgClass: 'bg-gradient-to-br from-green-500/8 via-emerald-500/4 to-transparent',
    orbColors: ['rgba(16, 185, 129, 0.35)', 'rgba(5, 150, 105, 0.3)', 'rgba(20, 184, 166, 0.2)'],
    animationSpeed: 'fast',
    intensity: 'high',
  },
  'road-trip': {
    mood: 'road-trip',
    gradient: 'from-sky-400 via-blue-500 to-indigo-500',
    glowColor: 'rgba(56, 189, 248, 0.25)',
    bgClass: 'bg-gradient-to-br from-sky-500/8 via-blue-500/4 to-transparent',
    orbColors: ['rgba(56, 189, 248, 0.3)', 'rgba(59, 130, 246, 0.25)', 'rgba(99, 102, 241, 0.15)'],
    animationSpeed: 'normal',
    intensity: 'medium',
  },
  nostalgic: {
    mood: 'nostalgic',
    gradient: 'from-amber-400 via-yellow-500 to-orange-400',
    glowColor: 'rgba(217, 119, 6, 0.25)',
    bgClass: 'bg-gradient-to-br from-amber-500/8 via-yellow-500/4 to-transparent',
    orbColors: ['rgba(217, 119, 6, 0.3)', 'rgba(202, 138, 4, 0.25)', 'rgba(234, 88, 12, 0.15)'],
    animationSpeed: 'slow',
    intensity: 'medium',
  },
  peaceful: {
    mood: 'peaceful',
    gradient: 'from-emerald-400 via-green-400 to-teal-400',
    glowColor: 'rgba(52, 211, 153, 0.2)',
    bgClass: 'bg-gradient-to-br from-emerald-500/6 via-green-500/3 to-transparent',
    orbColors: ['rgba(52, 211, 153, 0.25)', 'rgba(74, 222, 128, 0.2)', 'rgba(20, 184, 166, 0.12)'],
    animationSpeed: 'slow',
    intensity: 'low',
  },
};

export function getMoodTheme(mood: MoodType): MoodTheme {
  return moodThemes[mood];
}

export function getDefaultTheme(): MoodTheme {
  return moodThemes['chill'];
}

export { moodThemes };
