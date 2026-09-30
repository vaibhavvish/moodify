import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Music,
  Play,
  Shuffle,
  Heart,
  ArrowLeft,
  ListPlus,
  Zap,
  Brain,
  Wand2,
  Plus,
} from 'lucide-react';
import { Button } from '../components/ui';
import MusicCard from '../components/MusicCard';
import { useMood } from '../store/moodStore';
import { usePlayer } from '../store/playerStore';
import { useLibrary } from '../store/libraryStore';
import { useAuth } from '../store/authStore';
import { analyzeMood, matchSongs, generateVibeMatch } from '../services/moodSense';
import { moodConfigs } from '../data/moods';
import { cn, formatTime } from '../utils';
import type { Song, MoodSenseResult, VibeMatchResult } from '../types';

type Phase = 'analyzing' | 'moodsense' | 'vibematch';

export default function VibeMatchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const inputText = searchParams.get('q') || '';
  const { setMood, setMoodSenseResult, setVibeMatchResult } = useMood();
  const { playSong } = usePlayer();
  const { toggleLike, isLiked, createPlaylist, addToPlaylist } = useLibrary();
  const { requireAuth } = useAuth();

  const [phase, setPhase] = useState<Phase>('analyzing');
  const [moodResult, setMoodResult] = useState<MoodSenseResult | null>(null);
  const [vibeResult, setVibeResult] = useState<VibeMatchResult | null>(null);
  const [savedAsPlaylist, setSavedAsPlaylist] = useState(false);

  // Simulate the analysis process
  useEffect(() => {
    if (!inputText) {
      navigate('/');
      return;
    }

    // Phase 1: Analyzing animation
    const timer1 = setTimeout(() => {
      const result = analyzeMood(inputText);
      setMoodResult(result);
      setMoodSenseResult(result);
      setMood(result.mood);
      setPhase('moodsense');
    }, 2000);

    // Phase 2: Show VibeMatch after a moment
    const timer2 = setTimeout(async () => {
      const vibe = await generateVibeMatch(inputText);
      setVibeResult(vibe);
      setVibeMatchResult(vibe);
      setPhase('vibematch');
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [inputText]);

  const moodConfig = moodResult ? moodConfigs[moodResult.mood] : null;

  const handlePlayAll = () => {
    if (vibeResult && vibeResult.songs.length > 0) {
      playSong(vibeResult.songs[0], vibeResult.songs);
    }
  };

  const handleShuffle = () => {
    if (vibeResult && vibeResult.songs.length > 0) {
      const shuffled = [...vibeResult.songs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  const handleSaveAsPlaylist = () => {
    requireAuth(() => {
      if (vibeResult && !savedAsPlaylist) {
        const playlist = createPlaylist(
          vibeResult.vibeMixName,
          vibeResult.vibeMixDescription
        );
        for (const song of vibeResult.songs) {
          addToPlaylist(playlist.id, song.id);
        }
        setSavedAsPlaylist(true);
      }
    });
  };

  const totalDuration = useMemo(() => {
    if (!vibeResult) return 0;
    return vibeResult.songs.reduce((acc, s) => acc + s.duration, 0);
  }, [vibeResult]);

  // Analyzing phase
  if (phase === 'analyzing') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <motion.div
          className="text-center space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Animated orbs */}
          <div className="relative w-32 h-32 mx-auto">
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-purple-600 opacity-30"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.15, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div
              className="absolute inset-4 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-pink-500 opacity-50"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.25, 0.5],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            />
            <motion.div
              className="absolute inset-8 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-purple-400 flex items-center justify-center"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
            >
              <Brain className="text-white" size={32} />
            </motion.div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-bold font-[var(--font-display)]">
              MoodSense is analyzing...
            </h2>
            <p className="text-[var(--color-text-muted)] max-w-md mx-auto">
              "{inputText}"
            </p>
          </div>

          {/* Animated dots */}
          <div className="flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-[var(--color-accent)]"
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>
      </motion.div>

      {/* MoodSense Result Card */}
      {moodResult && moodConfig && (
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div
            className="relative overflow-hidden rounded-3xl border border-[var(--color-border-subtle)] p-8 md:p-10"
          >
            {/* Gradient background based on mood */}
            <div
              className={cn(
                'absolute inset-0 opacity-20 bg-gradient-to-br',
                moodConfig.gradient
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-transparent to-transparent" />

            <div className="relative z-10">
              {/* MoodSense badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-medium">
                  <Brain size={12} />
                  MoodSense Result
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  {Math.round(moodResult.confidence * 100)}% confidence
                </div>
              </div>

              {/* Main mood display */}
              <div className="flex flex-col md:flex-row md:items-start gap-8">
                {/* Mood icon + label */}
                <motion.div
                  className="flex flex-col items-center md:items-start gap-3"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                >
                  <div
                    className={cn(
                      'w-20 h-20 rounded-2xl flex items-center justify-center text-4xl bg-gradient-to-br',
                      moodConfig.gradient
                    )}
                    style={{
                      boxShadow: `0 8px 32px ${moodConfig.glowColor}`,
                    }}
                  >
                    {moodConfig.icon}
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold font-[var(--font-display)]">
                      {moodConfig.label}
                    </h2>
                    <p className="text-sm text-[var(--color-text-muted)] mt-1">
                      {moodConfig.description}
                    </p>
                  </div>
                </motion.div>

                {/* Details grid */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Input */}
                  <motion.div
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-medium">
                      Your Input
                    </p>
                    <p className="text-sm italic text-[var(--color-text-secondary)] line-clamp-3">
                      "{moodResult.inputText}"
                    </p>
                  </motion.div>

                  {/* Energy */}
                  <motion.div
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-medium">
                      Energy Level
                    </p>
                    <div className="flex items-center gap-2">
                      <Zap
                        size={16}
                        className={cn(
                          moodResult.energy === 'high'
                            ? 'text-amber-400'
                            : moodResult.energy === 'medium'
                              ? 'text-blue-400'
                              : 'text-emerald-400'
                        )}
                      />
                      <span className="text-sm font-medium capitalize">
                        {moodResult.energy}
                      </span>
                    </div>
                    {/* Energy bar */}
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        className={cn(
                          'h-full rounded-full',
                          moodResult.energy === 'high'
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                            : moodResult.energy === 'medium'
                              ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
                              : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                        )}
                        initial={{ width: '0%' }}
                        animate={{
                          width:
                            moodResult.energy === 'high'
                              ? '90%'
                              : moodResult.energy === 'medium'
                                ? '55%'
                                : '25%',
                        }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                      />
                    </div>
                  </motion.div>

                  {/* Context */}
                  <motion.div
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-medium">
                      Context Detected
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {moodResult.context.map((ctx) => (
                        <span
                          key={ctx}
                          className="px-2 py-0.5 rounded-md bg-white/[0.06] text-xs text-[var(--color-text-secondary)]"
                        >
                          {ctx}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Vibe Tags */}
              <motion.div
                className="mt-6 flex flex-wrap gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {moodResult.vibe.map((vibe) => (
                  <span
                    key={vibe}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-medium',
                      'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                    )}
                  >
                    {vibe}
                  </span>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>
      )}

      {/* VibeMatch Results */}
      <AnimatePresence>
        {phase === 'vibematch' && vibeResult && moodConfig && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            {/* VibeMix Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-center gap-4 flex-1">
                <motion.div
                  className={cn(
                    'w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br',
                    moodConfig.gradient
                  )}
                  initial={{ rotate: -10, scale: 0.8 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  style={{
                    boxShadow: `0 8px 24px ${moodConfig.glowColor}`,
                  }}
                >
                  <Wand2 size={28} className="text-white" />
                </motion.div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-400 text-[10px] font-medium uppercase tracking-wider">
                      <Sparkles size={10} />
                      VibeMix
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-display)]">
                    {vibeResult.vibeMixName}
                  </h2>
                  <p className="text-sm text-[var(--color-text-muted)] mt-1">
                    {vibeResult.songs.length} tracks • {formatTime(totalDuration)} •{' '}
                    {vibeResult.vibeMixDescription}
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <Button
                  size="md"
                  className="gap-2"
                  onClick={handlePlayAll}
                >
                  <Play size={16} fill="currentColor" />
                  Play All
                </Button>
                <Button
                  size="md"
                  variant="ghost"
                  className="gap-2"
                  onClick={handleShuffle}
                >
                  <Shuffle size={16} />
                  Shuffle
                </Button>
                <Button
                  size="md"
                  variant="secondary"
                  className="gap-2 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20"
                  onClick={() => navigate(`/vibe-flow?q=${encodeURIComponent(inputText)}`)}
                >
                  <Sparkles size={16} />
                  Start VibeFlow
                </Button>
                <Button
                  size="md"
                  variant="ghost"
                  className="gap-2"
                  onClick={handleSaveAsPlaylist}
                  disabled={savedAsPlaylist}
                >
                  {savedAsPlaylist ? (
                    <>
                      <ListPlus size={16} />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      Save as Playlist
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Song list */}
            <div className="space-y-1">
              {vibeResult.songs.map((song, i) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div
                    className="group flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-colors cursor-pointer"
                    onClick={() => playSong(song, vibeResult.songs)}
                  >
                    {/* Track number */}
                    <div className="w-8 text-center">
                      <span className="text-sm text-[var(--color-text-muted)] group-hover:hidden">
                        {i + 1}
                      </span>
                      <Play
                        size={14}
                        className="hidden group-hover:block mx-auto text-white"
                        fill="currentColor"
                      />
                    </div>

                    {/* Cover */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{song.title}</p>
                      <Link
                        to={`/artist/${song.artistId}`}
                        className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors truncate block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {song.artist}
                      </Link>
                    </div>

                    {/* Album */}
                    <Link
                      to={`/album/${song.albumId}`}
                      className="hidden md:block text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors truncate max-w-[200px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {song.album}
                    </Link>

                    {/* Like */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(song);
                      }}
                      className={cn(
                        'p-1.5 transition-colors',
                        isLiked(song.id)
                          ? 'text-pink-500'
                          : 'text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 hover:text-white'
                      )}
                      aria-label={isLiked(song.id) ? 'Unlike' : 'Like'}
                    >
                      <Heart
                        size={14}
                        fill={isLiked(song.id) ? 'currentColor' : 'none'}
                      />
                    </button>

                    {/* Duration */}
                    <span className="text-xs text-[var(--color-text-muted)] tabular-nums w-10 text-right">
                      {formatTime(song.duration)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Also matches section - grid of cards */}
            {vibeResult.songs.length > 4 && (
              <div>
                <h3 className="text-lg font-bold font-[var(--font-display)] mb-4">
                  More for This Vibe
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
                  {vibeResult.songs.slice(0, 6).map((song, i) => (
                    <motion.div
                      key={song.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                    >
                      <MusicCard song={song} songs={vibeResult.songs} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Try another mood */}
            <motion.div
              className="text-center pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <p className="text-sm text-[var(--color-text-muted)] mb-3">
                Want something different?
              </p>
              <Button
                variant="ghost"
                className="gap-2"
                onClick={() => navigate('/')}
              >
                <Sparkles size={16} />
                Try Another Vibe
              </Button>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
