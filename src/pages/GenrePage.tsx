import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Music } from 'lucide-react';
import { PageLoader } from '../components/ui/Loader';
import { EmptyState } from '../components/ui';
import MusicCard from '../components/MusicCard';
import { getMusicProvider } from '../services/music';
import type { Song } from '../types';

export default function GenrePage() {
  const { name } = useParams<{ name: string }>();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const decodedName = name ? decodeURIComponent(name) : '';

  useEffect(() => {
    async function loadGenreSongs() {
      if (!decodedName) return;
      setLoading(true);
      try {
        const provider = getMusicProvider();
        const result = await provider.getSongsByGenre(decodedName);
        setSongs(result);
      } catch {
        setSongs([]);
      }
      setLoading(false);
    }
    loadGenreSongs();
  }, [decodedName]);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-8">
      {/* Back button */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Link
          to={-1 as unknown as string}
          onClick={(e) => { e.preventDefault(); window.history.back(); }}
          className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back
        </Link>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-1">
          Genre
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold font-[var(--font-display)]">
          {decodedName}
        </h1>
        <p className="text-[var(--color-text-muted)] mt-2">
          {songs.length} {songs.length === 1 ? 'song' : 'songs'}
        </p>
      </motion.div>

      {/* Songs */}
      {songs.length > 0 ? (
        <motion.div
          className="space-y-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {songs.map((song, i) => (
            <MusicCard
              key={song.id}
              song={song}
              songs={songs}
              variant="list"
              index={i}
            />
          ))}
        </motion.div>
      ) : (
        <EmptyState
          icon={<Music size={48} />}
          title={`No ${decodedName} songs found`}
          description="Check back later for new additions."
        />
      )}
    </div>
  );
}
