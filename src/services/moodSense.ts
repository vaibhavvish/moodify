/**
 * MoodSense Engine
 * Interprets natural language mood descriptions into structured mood analysis.
 * Uses keyword matching, context detection, and energy scoring to simulate
 * a natural-language mood interpreter.
 */
import type { MoodType, MoodSenseResult, VibeMatchResult, Song } from '../types';
import { getMusicProvider } from './music';

// Mood keyword mappings with weights
const moodKeywords: Record<MoodType, { keywords: string[]; weight: number }[]> = {
  happy: [
    { keywords: ['happy', 'joy', 'joyful', 'excited', 'amazing', 'great', 'wonderful', 'fantastic', 'awesome'], weight: 3 },
    { keywords: ['good', 'nice', 'positive', 'cheerful', 'upbeat', 'bright', 'sunny', 'celebration', 'party'], weight: 2 },
    { keywords: ['smile', 'laugh', 'fun', 'dance', 'celebrate', 'love it', 'blessed'], weight: 1 },
  ],
  chill: [
    { keywords: ['chill', 'relax', 'relaxed', 'relaxing', 'calm', 'mellow', 'laid-back', 'laid back', 'easy'], weight: 3 },
    { keywords: ['cozy', 'lazy', 'slow', 'gentle', 'soft', 'soothing', 'quiet', 'wind down'], weight: 2 },
    { keywords: ['lounge', 'afternoon', 'tea', 'coffee', 'sunday', 'weekend', 'floating'], weight: 1 },
  ],
  sad: [
    { keywords: ['sad', 'depressed', 'crying', 'tears', 'heartbroken', 'devastated', 'miserable'], weight: 3 },
    { keywords: ['lonely', 'alone', 'empty', 'lost', 'broken', 'hurt', 'pain', 'grief', 'sorrow'], weight: 2 },
    { keywords: ['miss', 'missing', 'gone', 'left', 'apart', 'goodbye', 'farewell', 'melancholy', 'blue'], weight: 1 },
  ],
  romantic: [
    { keywords: ['romantic', 'love', 'loving', 'in love', 'crush', 'date', 'dating', 'valentine'], weight: 3 },
    { keywords: ['passionate', 'intimate', 'tender', 'affection', 'desire', 'couple', 'sweetheart'], weight: 2 },
    { keywords: ['candlelight', 'moonlight', 'roses', 'heart', 'kiss', 'cuddle', 'together', 'warm'], weight: 1 },
  ],
  energetic: [
    { keywords: ['energetic', 'hyped', 'pumped', 'fired up', 'adrenaline', 'intense', 'wild'], weight: 3 },
    { keywords: ['energy', 'power', 'fast', 'loud', 'bass', 'drop', 'rave', 'festival'], weight: 2 },
    { keywords: ['run', 'running', 'sprint', 'jump', 'move', 'active', 'rush', 'electric'], weight: 1 },
  ],
  confident: [
    { keywords: ['confident', 'powerful', 'strong', 'boss', 'king', 'queen', 'unstoppable', 'winner'], weight: 3 },
    { keywords: ['swagger', 'bold', 'fearless', 'proud', 'dominant', 'flex', 'success', 'victory'], weight: 2 },
    { keywords: ['own', 'slaying', 'killing it', 'on top', 'unbeatable', 'champion', 'alpha'], weight: 1 },
  ],
  focus: [
    { keywords: ['focus', 'focused', 'study', 'studying', 'concentrate', 'concentration', 'work', 'working'], weight: 3 },
    { keywords: ['productive', 'deep work', 'code', 'coding', 'read', 'reading', 'write', 'writing'], weight: 2 },
    { keywords: ['exam', 'deadline', 'project', 'assignment', 'homework', 'office', 'think', 'thinking'], weight: 1 },
  ],
  'late-night': [
    { keywords: ['late night', 'midnight', 'after hours', '3am', '2am', '1am', 'insomnia', 'awake'], weight: 3 },
    { keywords: ['night', 'dark', 'moonlit', 'sleepless', 'night owl', 'nocturnal', 'twilight'], weight: 2 },
    { keywords: ['quiet night', 'stars', 'nighttime', 'moon', 'lamp', 'shadow', 'dim'], weight: 1 },
  ],
  workout: [
    { keywords: ['workout', 'gym', 'exercise', 'training', 'lifting', 'weights', 'fitness'], weight: 3 },
    { keywords: ['run', 'cardio', 'hiit', 'sweat', 'pump', 'gains', 'beast mode', 'push'], weight: 2 },
    { keywords: ['sport', 'athlete', 'muscle', 'reps', 'sets', 'grind', 'hustle'], weight: 1 },
  ],
  'road-trip': [
    { keywords: ['road trip', 'driving', 'drive', 'highway', 'road', 'travel', 'journey'], weight: 3 },
    { keywords: ['car', 'windows down', 'cruising', 'sunset drive', 'open road', 'adventure'], weight: 2 },
    { keywords: ['escape', 'freedom', 'horizon', 'scenic', 'explore', 'wander', 'miles'], weight: 1 },
  ],
  nostalgic: [
    { keywords: ['nostalgic', 'nostalgia', 'throwback', 'memories', 'remember', 'past', 'childhood'], weight: 3 },
    { keywords: ['old times', 'vintage', 'retro', 'classic', 'reminisce', 'reminiscing', 'back then'], weight: 2 },
    { keywords: ['school', 'old songs', 'memory', 'flashback', 'grew up', 'younger', 'used to'], weight: 1 },
  ],
  peaceful: [
    { keywords: ['peaceful', 'peace', 'serene', 'tranquil', 'zen', 'meditation', 'meditate'], weight: 3 },
    { keywords: ['nature', 'forest', 'ocean', 'waves', 'breeze', 'morning', 'dawn', 'sunrise'], weight: 2 },
    { keywords: ['harmony', 'balance', 'stillness', 'garden', 'birds', 'rain', 'ambient', 'spa'], weight: 1 },
  ],
};

// Context detection keywords
const contextKeywords: Record<string, string[]> = {
  'Rainy': ['rain', 'raining', 'rainy', 'storm', 'thunder', 'drizzle', 'pour', 'downpour'],
  'Late Night': ['night', 'midnight', 'late', 'dark', 'moon', '2am', '3am', 'insomnia', 'sleepless'],
  'Morning': ['morning', 'dawn', 'sunrise', 'wake', 'coffee', 'breakfast', 'start of day'],
  'Alone': ['alone', 'solo', 'by myself', 'lonely', 'solitude', 'single', 'on my own'],
  'Social': ['party', 'friends', 'gathering', 'hangout', 'crowd', 'people', 'social', 'together'],
  'Work': ['work', 'office', 'desk', 'meeting', 'deadline', 'project', 'task', 'busy'],
  'Study': ['study', 'studying', 'exam', 'library', 'homework', 'class', 'school', 'college'],
  'Nature': ['nature', 'forest', 'mountain', 'beach', 'ocean', 'lake', 'park', 'outdoor'],
  'City': ['city', 'urban', 'street', 'downtown', 'skyline', 'subway', 'traffic'],
  'Cozy': ['cozy', 'warm', 'blanket', 'fireplace', 'candle', 'home', 'indoors', 'comfy'],
  'Heartbreak': ['breakup', 'heartbreak', 'ex', 'over', 'ended', 'broken heart', 'lost love'],
  'Celebration': ['celebrate', 'celebration', 'birthday', 'graduation', 'promotion', 'achievement', 'won'],
};

// Energy keyword detection
const energyKeywords = {
  low: ['calm', 'quiet', 'soft', 'gentle', 'slow', 'easy', 'peace', 'still', 'rest', 'sleep', 'tired', 'exhausted', 'drained', 'mellow', 'subdued'],
  medium: ['steady', 'moderate', 'balanced', 'cruising', 'flowing', 'comfortable', 'walking', 'stroll'],
  high: ['hyped', 'pumped', 'fired', 'wild', 'intense', 'fast', 'loud', 'power', 'energy', 'explosive', 'turbo', 'max', 'extreme', 'hard'],
};

/**
 * Analyze text input and return a MoodSenseResult
 */
export function analyzeMood(input: string): MoodSenseResult {
  const text = input.toLowerCase().trim();

  // Score each mood
  const scores: Record<string, number> = {};
  for (const [mood, groups] of Object.entries(moodKeywords)) {
    scores[mood] = 0;
    for (const group of groups) {
      for (const keyword of group.keywords) {
        if (text.includes(keyword)) {
          scores[mood] += group.weight;
        }
      }
    }
  }

  // Find top mood
  const sortedMoods = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const topMood = sortedMoods[0];
  const detectedMood: MoodType = topMood[1] > 0 ? (topMood[0] as MoodType) : 'chill'; // default to chill

  // Calculate confidence (0 to 1)
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = totalScore > 0
    ? Math.min(topMood[1] / Math.max(totalScore, 1) + 0.2, 0.98)
    : 0.5; // default confidence for no matches

  // Detect context
  const detectedContext: string[] = [];
  for (const [contextLabel, keywords] of Object.entries(contextKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        if (!detectedContext.includes(contextLabel)) {
          detectedContext.push(contextLabel);
        }
        break;
      }
    }
  }

  // Detect energy level
  let energy: 'low' | 'medium' | 'high' = 'medium';
  let energyScores = { low: 0, medium: 0, high: 0 };
  for (const [level, keywords] of Object.entries(energyKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        energyScores[level as keyof typeof energyScores]++;
      }
    }
  }
  if (energyScores.high > energyScores.low && energyScores.high > energyScores.medium) {
    energy = 'high';
  } else if (energyScores.low > energyScores.high && energyScores.low > energyScores.medium) {
    energy = 'low';
  }
  // Adjust energy based on mood
  if (['energetic', 'workout', 'confident'].includes(detectedMood) && energy === 'medium') {
    energy = 'high';
  } else if (['peaceful', 'chill', 'focus'].includes(detectedMood) && energy === 'medium') {
    energy = 'low';
  }

  // Generate vibe tags
  const vibeTagMap: Record<MoodType, string[]> = {
    happy: ['Uplifting', 'Bright', 'Feel-Good'],
    chill: ['Relaxed', 'Mellow', 'Easy-Going'],
    sad: ['Melancholic', 'Reflective', 'Emotional'],
    romantic: ['Warm', 'Tender', 'Dreamy'],
    energetic: ['High-Energy', 'Explosive', 'Thrilling'],
    confident: ['Bold', 'Powerful', 'Anthemic'],
    focus: ['Minimal', 'Ambient', 'Concentration'],
    'late-night': ['After-Hours', 'Moody', 'Deep'],
    workout: ['Pumping', 'Beast Mode', 'Intense'],
    'road-trip': ['Freedom', 'Open Road', 'Adventure'],
    nostalgic: ['Throwback', 'Classic', 'Bittersweet'],
    peaceful: ['Serene', 'Nature', 'Calm'],
  };
  const vibes = [...(vibeTagMap[detectedMood] || ['Vibes'])];
  // Add energy vibe
  if (energy === 'low') vibes.push('Low Energy');
  else if (energy === 'high') vibes.push('High Energy');

  return {
    mood: detectedMood,
    context: detectedContext.length > 0 ? detectedContext : ['General'],
    energy,
    vibe: vibes,
    confidence,
    inputText: input,
  };
}

/**
 * Match songs to a MoodSenseResult using the real music provider
 */
export async function matchSongs(moodResult: MoodSenseResult): Promise<Song[]> {
  const { mood, energy } = moodResult;
  const provider = getMusicProvider();
  
  // Fetch real recommendations based on the detected mood
  const songs = await provider.getRecommendations(undefined, mood);
  
  // Optionally sort by energy preference if provider returns enough songs
  if (energy === 'high') {
    songs.sort((a, b) => (b.duration < 240 ? 1 : 0) - (a.duration < 240 ? 1 : 0));
  } else if (energy === 'low') {
    songs.sort((a, b) => (b.duration > 240 ? 1 : 0) - (a.duration > 240 ? 1 : 0));
  }

  return songs.slice(0, 12);
}

/**
 * Generate a VibeMatch result from input text
 */
export async function generateVibeMatch(input: string): Promise<VibeMatchResult> {
  const moodSense = analyzeMood(input);
  const songs = await matchSongs(moodSense);

  // Generate a creative mix name
  const mixNames: Partial<Record<MoodType, string[]>> = {
    happy: ['Sunshine Playlist', 'Good Vibes Mix', 'Happy Hours'],
    chill: ['Chill Sessions', 'Easy Listening', 'Mellow Waves'],
    sad: ['Rainy Day Feels', 'Midnight Blues', 'Quiet Storm'],
    romantic: ['Love Letters', 'Moonlit Serenade', 'Heart Strings'],
    energetic: ['Power Surge', 'Electric Rush', 'Full Throttle'],
    confident: ['Crown Mix', 'Boss Mode', 'Victory Lap'],
    focus: ['Deep Focus', 'Study Flow', 'Zen Zone'],
    'late-night': ['After Midnight', 'Night Owl Mix', 'Twilight Sessions'],
    workout: ['Beast Mode', 'Iron Mix', 'Pump It Up'],
    'road-trip': ['Highway Mix', 'Open Road', 'Sunset Drive'],
    nostalgic: ['Memory Lane', 'Throwback Mix', 'Golden Days'],
    peaceful: ['Zen Garden', 'Morning Dew', 'Nature Sounds'],
  };

  const names = mixNames[moodSense.mood] || ['Vibe Mix'];
  const vibeMixName = names[Math.floor(Math.random() * names.length)];

  const descriptions: Partial<Record<MoodType, string>> = {
    happy: 'Curated to match your uplifting energy and keep the good vibes flowing.',
    chill: 'A laid-back collection perfect for unwinding and easy listening.',
    sad: 'Songs that understand what you\'re feeling and sit with you in it.',
    romantic: 'A tender soundtrack for love, warmth, and connection.',
    energetic: 'High-octane tracks to fuel your fire and keep you moving.',
    confident: 'Bold anthems for when you\'re feeling unstoppable.',
    focus: 'Distraction-free sounds designed for deep concentration.',
    'late-night': 'After-hours atmosphere for those quiet, reflective moments.',
    workout: 'Power tracks to push you through your toughest sets.',
    'road-trip': 'The perfect open-road soundtrack for your journey.',
    nostalgic: 'A trip down memory lane with timeless favorites.',
    peaceful: 'Serene and calming sounds for inner peace.',
  };

  return {
    moodSense,
    songs,
    vibeMixName,
    vibeMixDescription: descriptions[moodSense.mood] || 'Music matched to your current vibe.',
  };
}
