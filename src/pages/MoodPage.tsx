import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Shuffle, Music, Sparkles } from 'lucide-react';
import { Button, EmptyState } from '../components/ui';
import MusicCard from '../components/MusicCard';
import { moodConfigs } from '../data/moods';
import { getMusicProvider } from '../services/music';
import { usePlayer } from '../store/playerStore';
import { useMood } from '../store/moodStore';
import { cn, formatTime } from '../utils';
import type { MoodType, Song } from '../types';

export default function MoodPage() {
  const { mood: moodParam } = useParams<{ mood: string }>();
  const navigate = useNavigate();
  const { playSong } = usePlayer();
  const { setMood } = useMood();

  const moodType = moodParam as MoodType;
  const moodConfig = moodConfigs[moodType];

  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch real songs for this mood
  useEffect(() => {
    async function loadMoodSongs() {
      if (!moodType) return;
      setLoading(true);
      try {
        const provider = getMusicProvider();
        const results = await provider.getRecommendations(undefined, moodType);
        setSongs(results);
      } catch (error) {
        console.error('Failed to load mood songs', error);
      }
      setLoading(false);
    }
    loadMoodSongs();
  }, [moodType]);

  // Related moods for discovery
  const relatedMoods: Partial<Record<MoodType, MoodType[]>> = {
    happy: ['energetic', 'confident', 'road-trip'],
    chill: ['peaceful', 'focus', 'late-night'],
    sad: ['nostalgic', 'late-night', 'peaceful'],
    romantic: ['chill', 'peaceful', 'nostalgic'],
    energetic: ['workout', 'confident', 'happy'],
    confident: ['energetic', 'happy', 'workout'],
    focus: ['chill', 'peaceful'],
    'late-night': ['chill', 'sad', 'nostalgic'],
    workout: ['energetic', 'confident'],
    'road-trip': ['energetic', 'happy', 'confident'],
    nostalgic: ['sad', 'romantic', 'chill'],
    peaceful: ['chill', 'focus'],
  };

  const related = relatedMoods[moodType] || [];

  if (!moodConfig) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          icon={<Music size={56} />}
          title="Mood not found"
          description="This mood doesn't exist."
          action={
            <Button onClick={() => navigate('/')}>Go Home</Button>
          }
        />
      </div>
    );
  }

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs);
      setMood(moodType);
    }
  };

  const handleShuffle = () => {
    if (songs.length > 0) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
      setMood(moodType);
    }
  };

  const totalDuration = songs.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="space-y-10">
      {/* Back */}
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </motion.div>

      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative overflow-hidden rounded-3xl border border-[var(--color-border-subtle)] p-8 md:p-12">
          {/* Gradient bg */}
          <div
            className={cn(
              'absolute inset-0 opacity-25 bg-gradient-to-br',
              moodConfig.gradient
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-transparent to-transparent" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end gap-6">
            {/* Icon */}
            <motion.div
              className={cn(
                'w-24 h-24 md:w-32 md:h-32 rounded-3xl flex items-center justify-center text-5xl md:text-6xl bg-gradient-to-br shrink-0',
                moodConfig.gradient
              )}
              style={{
                boxShadow: `0 12px 40px ${moodConfig.glowColor}`,
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              {moodConfig.icon}
            </motion.div>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-2">
                Mood Collection
              </p>
              <h1 className="text-4xl md:text-5xl font-extrabold font-[var(--font-display)] mb-2">
                {moodConfig.label}
              </h1>
              <p className="text-[var(--color-text-muted)] mb-4">
                {moodConfig.description}
              </p>
              <p className="text-sm text-[var(--color-text-muted)]">
                {songs.length} tracks • {formatTime(totalDuration)} total
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button size="lg" className="gap-2" onClick={handlePlayAll}>
                <Play size={18} fill="currentColor" />
                Play All
              </Button>
              <Button size="lg" variant="ghost" className="gap-2" onClick={handleShuffle}>
                <Shuffle size={18} />
                Shuffle
              </Button>
              <Button 
                size="lg" 
                variant="secondary" 
                className="gap-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20"
                onClick={() => navigate(`/vibe-flow?q=${encodeURIComponent(moodConfig.label)}`)}
              >
                <Sparkles size={18} />
                Start VibeFlow
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Songs Grid */}
      {songs.length > 0 ? (
        <section>
          <h2 className="text-xl font-bold font-[var(--font-display)] mb-6">
            {moodConfig.label} Tracks
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
            {songs.map((song, i) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <MusicCard song={song} songs={songs} />
              </motion.div>
            ))}
          </div>
        </section>
      ) : (
        <EmptyState
          icon={<Music size={48} />}
          title="No tracks yet"
          description={`No songs tagged with the ${moodConfig.label} mood.`}
        />
      )}

      {/* Related Moods */}
      {related.length > 0 && (
        <section>
          <h2 className="text-xl font-bold font-[var(--font-display)] mb-6">
            Related Moods
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {related.map((relMood, i) => {
              const relConfig = moodConfigs[relMood];
              if (!relConfig) return null;
              return (
                <motion.div
                  key={relMood}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                >
                  <Link
                    to={`/mood/${relMood}`}
                    className="group block relative overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] p-6 hover:border-white/10 transition-colors"
                  >
                    <div
                      className={cn(
                        'absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity bg-gradient-to-br',
                        relConfig.gradient
                      )}
                    />
                    <div className="relative z-10 flex items-center gap-3">
                      <span className="text-2xl">{relConfig.icon}</span>
                      <div>
                        <p className="font-semibold">{relConfig.label}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
