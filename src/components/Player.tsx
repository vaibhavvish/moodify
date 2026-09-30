import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Repeat,
  Repeat1,
  Shuffle,
  ListMusic,
  ChevronDown,
  Maximize2,
} from 'lucide-react';
import { usePlayer } from '../store/playerStore';
import { useLibrary } from '../store/libraryStore';
import { formatTime, cn } from '../utils';

// Global singleton audio instance to persist playback across route changes
const globalAudio = new Audio();

export default function Player() {
  const { state, togglePlay, next, previous, setTime, setVolume, toggleMute, toggleRepeat, toggleShuffle, toggleFullScreen } = usePlayer();
  const { toggleLike, isLiked, addRecentlyPlayed } = useLibrary();
  const progressRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(globalAudio);

  const { currentSong, isPlaying, currentTime, duration, volume, isMuted, repeatMode, shuffleMode, isFullScreen } = state;

  // Initialize audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    
    const onTimeUpdate = () => {
      setTime(audio.currentTime);
    };
    
    const onEnded = () => {
      next();
    };

    const onError = () => {
      next(); // Skip if audio fails to load
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [next, setTime]);

  // Track recently played
  useEffect(() => {
    if (currentSong) {
      addRecentlyPlayed(currentSong);
    }
  }, [currentSong?.id, addRecentlyPlayed]);

  // Sync song playback
  useEffect(() => {
    if (audioRef.current && currentSong) {
      const src = currentSong.previewUrl || '';
      if (src && audioRef.current.src !== src) {
        audioRef.current.src = src;
        audioRef.current.load();
      }
      
      if (isPlaying && src) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [currentSong, isPlaying]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleProgressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = parseFloat(e.target.value);
      setTime(newTime);
      if (audioRef.current) {
        audioRef.current.currentTime = newTime;
      }
    },
    [setTime]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setVolume(parseFloat(e.target.value));
    },
    [setVolume]
  );

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const liked = currentSong ? isLiked(currentSong.id) : false;

  if (!currentSong) return null;

  // Full-Screen Player
  if (isFullScreen) {
    return (
      <AnimatePresence>
        <motion.div
          className="fixed inset-0 z-50 bg-[var(--color-bg-primary)] flex flex-col"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {/* Background blur art */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={currentSong.coverUrl}
              alt=""
              className="w-full h-full object-cover blur-[80px] opacity-30 scale-110"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>

          {/* Close button */}
          <div className="relative z-10 flex items-center justify-between px-6 pt-6">
            <button
              onClick={toggleFullScreen}
              className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-white transition-colors"
              aria-label="Close full-screen player"
            >
              <ChevronDown size={24} />
            </button>
            <span className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium">
              Now Playing
            </span>
            <button className="p-2 rounded-xl text-[var(--color-text-muted)] hover:text-white transition-colors" aria-label="Queue">
              <ListMusic size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 pb-8 gap-8 max-w-lg mx-auto w-full">
            {/* Artwork */}
            <motion.div
              className="relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden shadow-2xl shadow-black/80"
              animate={{ scale: isPlaying ? 1.02 : 1 }}
              transition={{ type: 'spring', damping: 20 }}
            >
              {/* Subtle accent glow behind artwork */}
              {isPlaying && (
                <div className="absolute inset-0 bg-[var(--color-accent)] opacity-20 blur-2xl -z-10 mix-blend-screen animate-pulse" />
              )}
              <img
                src={currentSong.coverUrl}
                alt={currentSong.title}
                className="w-full h-full object-cover relative z-10"
              />
            </motion.div>

            {/* Song Info */}
            <div className="text-center w-full">
              <h2 className="text-2xl font-bold font-[var(--font-display)] truncate mb-1">
                {currentSong.title}
              </h2>
              <p className="text-[var(--color-text-muted)]">{currentSong.artist}</p>
            </div>

            {/* Progress */}
            <div className="w-full space-y-2">
              <input
                type="range"
                className="player-range w-full"
                min={0}
                max={duration}
                value={currentTime}
                onChange={handleProgressChange}
                style={{
                  background: `linear-gradient(to right, var(--color-accent) ${progressPercent}%, var(--color-border) ${progressPercent}%)`,
                }}
                aria-label="Seek"
              />
              <div className="flex justify-between text-xs text-[var(--color-text-muted)] tabular-nums">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
              <button
                onClick={toggleShuffle}
                className={cn('p-2 transition-colors', shuffleMode === 'on' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)] hover:text-white')}
                aria-label="Toggle shuffle"
              >
                <Shuffle size={20} />
              </button>
              <button onClick={previous} className="p-2 text-white hover:scale-110 transition-transform" aria-label="Previous">
                <SkipBack size={24} fill="currentColor" />
              </button>
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause size={28} className="text-black" fill="black" />
                ) : (
                  <Play size={28} className="text-black ml-1" fill="black" />
                )}
              </button>
              <button onClick={next} className="p-2 text-white hover:scale-110 transition-transform" aria-label="Next">
                <SkipForward size={24} fill="currentColor" />
              </button>
              <button
                onClick={toggleRepeat}
                className={cn('p-2 transition-colors', repeatMode !== 'off' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)] hover:text-white')}
                aria-label="Toggle repeat"
              >
                {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
              </button>
            </div>

            {/* Like */}
            <button
              onClick={() => toggleLike(currentSong)}
              className={cn('p-3 rounded-full transition-colors', liked ? 'text-pink-500' : 'text-[var(--color-text-muted)] hover:text-white')}
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              <Heart size={24} fill={liked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Mini Player (Desktop Bar + Mobile)
  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-30 glass border-t border-white/[0.06]',
        'bottom-0 md:bottom-0',
        'md:h-[var(--player-height)]',
        // Mobile: above bottom nav
        'bottom-16 md:bottom-0'
      )}
    >
      {/* Progress bar (thin line at top) */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-[var(--color-border)]">
        <div
          className="h-full bg-[var(--color-accent)] transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="h-full flex items-center px-4 md:px-6 py-2 md:py-0 gap-3 md:gap-4">
        {/* Song Info */}
        <div
          className="flex items-center gap-3 min-w-0 flex-1 md:flex-none md:w-[280px] cursor-pointer active:scale-[0.98] transition-transform"
          onClick={toggleFullScreen}
          role="button"
          tabIndex={0}
          aria-label="Open full-screen player"
          onKeyDown={(e) => { if (e.key === 'Enter') toggleFullScreen(); }}
        >
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl overflow-hidden shrink-0 shadow-lg">
            <img src={currentSong.coverUrl} alt={currentSong.title} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{currentSong.title}</p>
            <p className="text-xs text-[var(--color-text-muted)] truncate">{currentSong.artist}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); toggleLike(currentSong); }}
            className={cn('shrink-0 p-1.5 transition-colors md:ml-2', liked ? 'text-pink-500' : 'text-[var(--color-text-muted)] hover:text-white')}
            aria-label={liked ? 'Unlike' : 'Like'}
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex flex-col items-center flex-1 gap-1.5">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={cn('p-1.5 transition-colors', shuffleMode === 'on' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)] hover:text-white')}
              aria-label="Toggle shuffle"
            >
              <Shuffle size={16} />
            </button>
            <button onClick={previous} className="p-1.5 text-[var(--color-text-secondary)] hover:text-white transition-colors" aria-label="Previous">
              <SkipBack size={18} fill="currentColor" />
            </button>
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-105 transition-transform"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause size={16} className="text-black" fill="black" />
              ) : (
                <Play size={16} className="text-black ml-0.5" fill="black" />
              )}
            </button>
            <button onClick={next} className="p-1.5 text-[var(--color-text-secondary)] hover:text-white transition-colors" aria-label="Next">
              <SkipForward size={18} fill="currentColor" />
            </button>
            <button
              onClick={toggleRepeat}
              className={cn('p-1.5 transition-colors', repeatMode !== 'off' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)] hover:text-white')}
              aria-label="Toggle repeat"
            >
              {repeatMode === 'one' ? <Repeat1 size={16} /> : <Repeat size={16} />}
            </button>
          </div>
          <div className="flex items-center gap-2 w-full max-w-[600px]">
            <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              className="player-range flex-1"
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleProgressChange}
              style={{
                background: `linear-gradient(to right, var(--color-accent) ${progressPercent}%, var(--color-border) ${progressPercent}%)`,
              }}
              aria-label="Seek"
            />
            <span className="text-[10px] text-[var(--color-text-muted)] tabular-nums w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Mobile Play/Pause */}
        <button
          onClick={togglePlay}
          className="md:hidden p-2 text-white"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
        </button>

        {/* Desktop Right Controls */}
        <div className="hidden md:flex items-center gap-2 w-[180px] justify-end">
          <button className="p-1.5 text-[var(--color-text-muted)] hover:text-white transition-colors" aria-label="Queue">
            <ListMusic size={16} />
          </button>
          <button onClick={toggleMute} className="p-1.5 text-[var(--color-text-muted)] hover:text-white transition-colors" aria-label="Mute">
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            className="player-range w-20"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            style={{
              background: `linear-gradient(to right, var(--color-text-muted) ${(isMuted ? 0 : volume) * 100}%, var(--color-border) ${(isMuted ? 0 : volume) * 100}%)`,
            }}
            aria-label="Volume"
          />
          <button
            onClick={toggleFullScreen}
            className="p-1.5 text-[var(--color-text-muted)] hover:text-white transition-colors"
            aria-label="Full screen"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
