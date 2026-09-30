import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Heart, MoreHorizontal } from 'lucide-react';
import type { Song } from '../types';
import { formatTime } from '../utils';
import { usePlayer } from '../store/playerStore';
import { useLibrary } from '../store/libraryStore';
import { useAuth } from '../store/authStore';
import { cn } from '../utils';

interface MusicCardProps {
  song: Song;
  songs?: Song[]; // queue context
  variant?: 'grid' | 'list';
  showArtist?: boolean;
  showDuration?: boolean;
  index?: number;
}

export default function MusicCard({
  song,
  songs,
  variant = 'grid',
  showArtist = true,
  showDuration = true,
  index,
}: MusicCardProps) {
  const { playSong, state } = usePlayer();
  const { toggleLike, isLiked } = useLibrary();
  const { requireAuth } = useAuth();
  const liked = isLiked(song.id);
  const isCurrentSong = state.currentSong?.id === song.id;

  const handlePlay = () => {
    playSong(song, songs || [song]);
  };

  if (variant === 'list') {
    return (
      <motion.div
        className={cn(
          'group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors cursor-pointer',
          isCurrentSong ? 'bg-[var(--color-accent)]/10' : 'hover:bg-white/[0.03]'
        )}
        onClick={handlePlay}
        whileTap={{ scale: 0.99 }}
      >
        {index !== undefined && (
          <span className="w-6 text-center text-xs text-[var(--color-text-muted)] font-mono">{index + 1}</span>
        )}
        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 group">
          <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" loading="lazy" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Play size={14} fill="white" className="text-white" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium truncate', isCurrentSong && 'text-[var(--color-accent)]')}>
            {song.title}
          </p>
          {showArtist && (
            <Link
              to={`/artist/${song.artistId}`}
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-[var(--color-text-muted)] truncate block hover:text-[var(--color-accent)] transition-colors"
            >
              {song.artist}
            </Link>
          )}
        </div>
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            requireAuth(() => toggleLike(song)); 
          }}
          className={cn(
            'p-1.5 rounded-lg transition-all',
            liked ? 'opacity-100 text-pink-500' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100 text-[var(--color-text-muted)] hover:text-white'
          )}
          aria-label={liked ? 'Unlike song' : 'Like song'}
        >
          <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
        </button>
        {showDuration && (
          <span className="text-xs text-[var(--color-text-muted)] tabular-nums w-10 text-right">
            {formatTime(song.duration)}
          </span>
        )}
      </motion.div>
    );
  }

  // Grid variant
  return (
    <motion.div
      className="group cursor-pointer"
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={handlePlay}
    >
      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-[var(--color-bg-card)]">
        <img
          src={song.coverUrl}
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div className="flex gap-2">
              <button
                className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center shadow-lg shadow-purple-500/30 hover:scale-105 transition-transform"
                aria-label="Play"
                onClick={(e) => { e.stopPropagation(); handlePlay(); }}
              >
                <Play size={16} fill="white" className="text-white ml-0.5" />
              </button>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={(e) => { 
                  e.stopPropagation(); 
                  requireAuth(() => toggleLike(song)); 
                }}
                className={cn(
                  'p-2 rounded-full bg-black/40 backdrop-blur-sm transition-colors',
                  liked ? 'text-pink-500' : 'text-white/70 hover:text-white'
                )}
                aria-label={liked ? 'Unlike' : 'Like'}
              >
                <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white/70 hover:text-white transition-colors"
                aria-label="More options"
              >
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Now Playing Indicator */}
        {isCurrentSong && state.isPlaying && (
          <div className="absolute top-3 left-3 flex items-end gap-0.5">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="waveform-bar" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        )}
      </div>

      <h3 className={cn(
        'text-sm font-medium truncate mb-0.5',
        isCurrentSong && 'text-[var(--color-accent)]'
      )}>
        {song.title}
      </h3>
      {showArtist && (
        <Link
          to={`/artist/${song.artistId}`}
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-[var(--color-text-muted)] truncate block hover:text-[var(--color-accent)] transition-colors"
        >
          {song.artist}
        </Link>
      )}
    </motion.div>
  );
}
