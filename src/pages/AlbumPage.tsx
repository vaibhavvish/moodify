import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Shuffle, ArrowLeft, Clock, Music, Disc3 } from 'lucide-react';
import { Button } from '../components/ui';
import { PageLoader } from '../components/ui/Loader';
import { EmptyState } from '../components/ui';
import MusicCard from '../components/MusicCard';
import { getMusicProvider } from '../services/music';
import { mockSongs } from '../data/mockData';
import { usePlayer } from '../store/playerStore';
import { useLibrary } from '../store/libraryStore';
import { useAuth } from '../store/authStore';
import { formatTime, cn } from '../utils';
import type { Album, Song } from '../types';

export default function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [albumSongs, setAlbumSongs] = useState<Song[]>([]);
  const [moreByArtist, setMoreByArtist] = useState<Song[]>([]);
  const { playSong } = usePlayer();
  const { state: libState, toggleSaveAlbum } = useLibrary();
  const { requireAuth } = useAuth();
  
  const isSaved = album ? libState.savedAlbums.includes(album.id) : false;

  useEffect(() => {
    async function loadAlbum() {
      if (!id) return;
      setLoading(true);
      try {
        const provider = getMusicProvider();
        const result = await provider.getAlbum(id);
        setAlbum(result);

        if (result) {
          const [songs, topSongs] = await Promise.all([
            provider.getAlbumSongs(id),
            provider.getArtistTopSongs(result.artistId),
          ]);
          setAlbumSongs(songs);
          setMoreByArtist(topSongs.filter(s => s.albumId !== id).slice(0, 6));
        }
      } catch {
        setAlbum(null);
      }
      setLoading(false);
    }
    loadAlbum();
  }, [id]);

  const handlePlayAll = () => {
    if (albumSongs.length > 0) {
      playSong(albumSongs[0], albumSongs);
    }
  };

  const handleShuffle = () => {
    if (albumSongs.length > 0) {
      const shuffled = [...albumSongs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  const totalDuration = albumSongs.reduce((sum, s) => sum + s.duration, 0);

  if (loading) return <PageLoader />;

  if (!album) {
    return (
      <EmptyState
        icon={<Disc3 size={48} />}
        title="Album not found"
        description="We couldn't find the album you're looking for."
      />
    );
  }

  return (
    <div className="space-y-10">
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

      {/* Hero Section */}
      <motion.section
        className="relative overflow-hidden rounded-3xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background blur */}
        <div className="absolute inset-0">
          <img
            src={album.coverUrl}
            alt=""
            className="w-full h-full object-cover blur-[60px] opacity-40 scale-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/70 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 p-6 md:p-10 pt-10 md:pt-16">
          {/* Album Cover */}
          <motion.div
            className="w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 shrink-0"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img
              src={album.coverUrl}
              alt={album.title}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Album Info */}
          <div className="text-center md:text-left flex-1 min-w-0">
            <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium mb-2">
              Album
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-[var(--font-display)] leading-tight mb-2">
              {album.title}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-[var(--color-text-muted)] mb-4 flex-wrap">
              <Link
                to={`/artist/${album.artistId}`}
                className="text-[var(--color-text-primary)] hover:text-[var(--color-accent)] font-medium transition-colors"
              >
                {album.artist}
              </Link>
              <span>•</span>
              <span>{new Date(album.releaseDate).getFullYear()}</span>
              <span>•</span>
              <span>{album.trackCount} tracks</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatTime(totalDuration)}
              </span>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
              <span className="px-3 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-medium">
                {album.genre}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Button onClick={handlePlayAll} className="rounded-full px-6">
                <Play size={16} fill="currentColor" className="mr-2" />
                Play
              </Button>
              <Button variant="outline" onClick={handleShuffle} className="rounded-full px-6">
                <Shuffle size={16} className="mr-2" />
                Shuffle
              </Button>
              <Button 
                variant={isSaved ? "primary" : "outline"}
                onClick={() => requireAuth(() => album && toggleSaveAlbum(album.id))} 
                className="rounded-full px-6"
              >
                {isSaved ? 'Saved' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Track List */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-xl md:text-2xl font-bold font-[var(--font-display)] mb-4 flex items-center gap-2">
          <Music size={20} className="text-[var(--color-accent)]" />
          Tracks
        </h2>
        {albumSongs.length > 0 ? (
          <div className="space-y-1">
            {albumSongs.map((song, i) => (
              <MusicCard
                key={song.id}
                song={song}
                songs={albumSongs}
                variant="list"
                index={i}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Music size={40} />}
            title="No tracks"
            description="This album has no tracks yet."
          />
        )}
      </motion.section>

      {/* More by Artist */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold font-[var(--font-display)]">
            More by {album.artist}
          </h2>
          <Link
            to={`/artist/${album.artistId}`}
            className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-accent)] transition-colors"
          >
            View Artist
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
          {moreByArtist
            .map((song, i) => (
              <motion.div
                key={song.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <MusicCard song={song} songs={moreByArtist} />
              </motion.div>
            ))}
        </div>
      </motion.section>
    </div>
  );
}
