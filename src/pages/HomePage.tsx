import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui';
import MoodCard from '../components/MoodCard';
import MusicCard from '../components/MusicCard';
import { moodList, moodConfigs } from '../data/moods';
import { mockSongs } from '../data/mockData';
import { useMood } from '../store/moodStore';
import type { MoodConfig, MoodType } from '../types';

const placeholders = [
  'I want something peaceful for studying',
  'Feeling nostalgic tonight',
  'Give me something energetic',
  "It's raining and I want something emotional",
  'I need music for a late-night drive',
];

export default function HomePage() {
  const navigate = useNavigate();
  const { state: moodState, setMood, setMoodInput } = useMood();
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [displayPlaceholder, setDisplayPlaceholder] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const charIdxRef = useRef(0);

  // Rotating placeholder with typewriter
  useEffect(() => {
    const target = placeholders[placeholderIdx];
    let timeout: ReturnType<typeof setTimeout>;

    if (isTyping) {
      if (charIdxRef.current <= target.length) {
        timeout = setTimeout(() => {
          setDisplayPlaceholder(target.slice(0, charIdxRef.current));
          charIdxRef.current++;
        }, 40);
      } else {
        timeout = setTimeout(() => setIsTyping(false), 2000);
      }
    } else {
      if (charIdxRef.current > 0) {
        timeout = setTimeout(() => {
          charIdxRef.current--;
          setDisplayPlaceholder(target.slice(0, charIdxRef.current));
        }, 20);
      } else {
        setPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [placeholderIdx, isTyping, displayPlaceholder]);

  const handleMoodSelect = (mood: MoodConfig) => {
    setMood(mood.type);
    navigate(`/mood/${mood.type}`);
  };

  const trendingSongs = [...mockSongs].sort((a, b) => b.playCount - a.playCount).slice(0, 6);
  const recentSongs = mockSongs.slice(0, 6);

  return (
    <div className="space-y-16 md:space-y-24">
      {/* ========== Hero ========== */}
      <section className="relative pt-8 md:pt-16 pb-4">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold font-[var(--font-display)] leading-tight">
              Music for{' '}
              <span className="bg-gradient-to-r from-[var(--color-accent)] via-purple-400 to-pink-400 bg-clip-text text-transparent">
                every mood.
              </span>
            </h1>
          </motion.div>

          <motion.p
            className="text-base md:text-lg text-[var(--color-text-muted)] max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            Tell us how you feel, choose a vibe, or simply search for what you want to hear.
          </motion.p>

          {/* MoodSense Input */}
          <motion.div
            className="max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-accent)]/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center gap-3 bg-[var(--color-bg-elevated)] rounded-2xl border border-[var(--color-border)] p-2 focus-within:border-[var(--color-accent)]/50 transition-colors">
                <div className="pl-3 text-[var(--color-accent)]">
                  <Sparkles size={20} />
                </div>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputValue.trim()) {
                      setMoodInput(inputValue);
                      navigate(`/vibe-match?q=${encodeURIComponent(inputValue.trim())}`);
                    }
                  }}
                  placeholder={displayPlaceholder + '|'}
                  className="flex-1 bg-transparent text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]/50 outline-none text-sm md:text-base py-3"
                  aria-label="Describe how you're feeling"
                />
                <Button
                  size="md"
                  className="shrink-0 rounded-xl"
                  onClick={() => {
                    if (inputValue.trim()) {
                      setMoodInput(inputValue);
                      navigate(`/vibe-match?q=${encodeURIComponent(inputValue.trim())}`);
                    }
                  }}
                >
                  VibeMatch
                </Button>
                <Button
                  size="md"
                  variant="secondary"
                  className="shrink-0 rounded-xl bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/20"
                  onClick={() => {
                    if (inputValue.trim()) {
                      navigate(`/vibe-flow?q=${encodeURIComponent(inputValue.trim())}`);
                    } else {
                      navigate(`/vibe-flow`);
                    }
                  }}
                >
                  <Sparkles size={16} className="mr-2" />
                  VibeFlow
                </Button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-[var(--color-text-muted)]">
              <span>or</span>
              <Link
                to="/discover"
                className="text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium inline-flex items-center gap-1 transition-colors"
              >
                explore music normally
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== Mood Cards ========== */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-[var(--font-display)]">Choose Your Vibe</h2>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">Select a mood to discover matching music</p>
          </div>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
          {moodList.map((mood, i) => (
            <motion.div
              key={mood.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
            >
              <MoodCard
                mood={mood}
                isSelected={moodState.currentMood === mood.type}
                onSelect={handleMoodSelect}
              />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== Trending ========== */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold font-[var(--font-display)]">Trending Now</h2>
          <Link
            to="/discover"
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] flex items-center gap-1 transition-colors"
          >
            See All <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
          {trendingSongs.map((song, i) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <MusicCard song={song} songs={trendingSongs} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== MoodSense / VibeMatch Preview ========== */}
      <section>
        <div className="grid md:grid-cols-2 gap-6">
          {/* MoodSense Preview */}
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] p-8 md:p-10"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/10 via-transparent to-purple-500/5" />
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-medium">
                <Sparkles size={12} />
                MoodSense
              </div>
              <h3 className="text-2xl font-bold font-[var(--font-display)]">
                Understands how you feel
              </h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                Describe your mood in your own words. MoodSense interprets your feelings, context, and energy to find the perfect soundtrack.
              </p>
              <div className="mt-4 p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] space-y-3">
                <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">Example</p>
                <p className="text-sm italic text-[var(--color-text-secondary)]">
                  "I feel lonely tonight and it's raining."
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Melancholic', 'Rainy', 'Late Night', 'Low Energy'].map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* VibeMatch Preview */}
          <motion.div
            className="relative overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] p-8 md:p-10"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-transparent to-orange-500/5" />
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 text-pink-400 text-xs font-medium">
                <Sparkles size={12} />
                VibeMatch
              </div>
              <h3 className="text-2xl font-bold font-[var(--font-display)]">
                Music that matches your vibe
              </h3>
              <p className="text-[var(--color-text-muted)] leading-relaxed">
                Once MoodSense understands your current state, VibeMatch selects music that perfectly complements your vibe.
              </p>
              <div className="mt-4 p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] space-y-3">
                <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">VibeMix generated</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg">
                    🌧️
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Rainy Midnight</p>
                    <p className="text-xs text-[var(--color-text-muted)]">12 tracks • Curated for your vibe</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== VibeFlow Preview ========== */}
      <section>
        <motion.div
          className="relative overflow-hidden rounded-2xl border border-[var(--color-border-subtle)] p-8 md:p-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-[var(--color-accent)]/5 to-cyan-500/5" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium mb-4">
              <Sparkles size={12} />
              VibeFlow • Coming Soon
            </div>
            <h3 className="text-2xl md:text-3xl font-bold font-[var(--font-display)] mb-3">
              Let your music flow continuously
            </h3>
            <p className="text-[var(--color-text-muted)] leading-relaxed mb-6">
              VibeFlow adapts your listening experience in real-time — learning from your likes, skips, and listening patterns to keep the perfect soundtrack playing.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Likes & Skips', 'Listening History', 'Energy Preference', 'Current Vibe', 'Repeated Patterns'].map((feature) => (
                <span
                  key={feature}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-[var(--color-text-secondary)]"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========== Recent / Recommended ========== */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-bold font-[var(--font-display)]">Recommended For You</h2>
          <Link
            to="/discover"
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] flex items-center gap-1 transition-colors"
          >
            See All <ChevronRight size={16} />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
          {recentSongs.map((song, i) => (
            <motion.div
              key={song.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <MusicCard song={song} songs={recentSongs} />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
