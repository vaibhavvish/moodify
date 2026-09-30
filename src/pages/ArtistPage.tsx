import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Shuffle, Heart, Users, BadgeCheck, ArrowLeft, Music, Disc3 } from 'lucide-react';
import { Button } from '../components/ui';
import { PageLoader } from '../components/ui/Loader';
import { EmptyState } from '../components/ui';
import MusicCard from '../components/MusicCard';
import { getMusicProvider } from '../services/music';
import { mockSongs, mockAlbums } from '../data/mockData';
import { usePlayer } from '../store/playerStore';
import { useLibrary } from '../store/libraryStore';
import { useAuth } from '../store/authStore';
import { formatCount, cn } from '../utils';
import type { Artist, Song, Album } from '../types';

export default function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [artistSongs, setArtistSongs] = useState<Song[]>([]);
  const [artistAlbums, setArtistAlbums] = useState<Album[]>([]);
  const { playSong } = usePlayer();
  const { state: libState, toggleFollowArtist } = useLibrary();
  const { requireAuth } = useAuth();
  const isFollowed = id ? libState.followedArtists.includes(id) : false;

  useEffect(() => {
    async function loadArtist() {
      if (!id) return;
      setLoading(true);
      try {
        const provider = getMusicProvider();
        const [result, songs, albums] = await Promise.all([
          provider.getArtist(id),
          provider.getArtistTopSongs(id),
          provider.getArtistAlbums(id),
        ]);
        
        setArtist(result);
        setArtistSongs(songs);
        setArtistAlbums(albums);
      } catch {
        setArtist(null);
      }
      setLoading(false);
    }
    loadArtist();
  }, [id]);

  const handlePlayAll = () => {
    if (artistSongs.length > 0) {
      playSong(artistSongs[0], artistSongs);
    }
  };

  const handleShuffle = () => {
    if (artistSongs.length > 0) {
      const shuffled = [...artistSongs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  };

  if (loading) return <PageLoader />;

  if (!artist) {
    return (
      <EmptyState
        icon={<Users size={48} />}
        title="Artist not found"
        description="We couldn't find the artist you're looking for."
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
            src={artist.imageUrl}
            alt=""
            className="w-full h-full object-cover blur-[60px] opacity-40 scale-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-primary)] via-[var(--color-bg-primary)]/70 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8 p-6 md:p-10 pt-10 md:pt-16">
          {/* Artist Image */}
          <motion.div
            className="w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden shadow-2xl shadow-black/50 border-4 border-white/10 shrink-0"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <img
              src={artist.imageUrl}
              alt={artist.name}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Artist Info */}
          <div className="text-center md:text-left flex-1 min-w-0">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              {artist.verified && (
                <span className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] font-medium">
                  <BadgeCheck size={14} />
                  Verified Artist
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-[var(--font-display)] leading-tight mb-2">
              {artist.name}
            </h1>
            <p className="text-[var(--color-text-muted)] text-sm md:text-base mb-4 max-w-xl">
              {artist.bio}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-[var(--color-text-muted)] mb-6">
              <span className="flex items-center gap-1.5">
                <Users size={14} />
                {formatCount(artist.followers)} followers
              </span>
              <span>•</span>
              <span>{artist.genres.join(', ')}</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center md:justify-start gap-3">
              <Button onClick={handlePlayAll} className="rounded-full px-6">
                <Play size={16} fill="currentColor" className="mr-2" />
                Play All
              </Button>
              <Button variant="outline" onClick={handleShuffle} className="rounded-full px-6">
                <Shuffle size={16} className="mr-2" />
                Shuffle
              </Button>
              <Button 
                variant={isFollowed ? "primary" : "outline"}
                onClick={() => requireAuth(() => artist && toggleFollowArtist(artist.id))} 
                className="rounded-full px-6"
              >
                {isFollowed ? 'Following' : 'Follow'}
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Top Songs */}
      {artistSongs.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl md:text-2xl font-bold font-[var(--font-display)] mb-4 flex items-center gap-2">
            <Music size={20} className="text-[var(--color-accent)]" />
            Top Songs
          </h2>
          <div className="space-y-1">
            {artistSongs.map((song, i) => (
              <MusicCard
                key={song.id}
                song={song}
                songs={artistSongs}
                variant="list"
                index={i}
              />
            ))}
          </div>
        </motion.section>
      )}

      {/* Albums */}
      {artistAlbums.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-xl md:text-2xl font-bold font-[var(--font-display)] mb-4 flex items-center gap-2">
            <Disc3 size={20} className="text-[var(--color-accent)]" />
            Albums
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {artistAlbums.map((album, i) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link to={`/album/${album.id}`} className="group block">
                  <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-[var(--color-bg-card)] shadow-lg">
                    <img
                      src={album.coverUrl}
                      alt={album.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <h4 className="text-sm font-medium truncate group-hover:text-[var(--color-accent)] transition-colors">
                    {album.title}
                  </h4>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {album.trackCount} tracks • {album.genre}
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Regional Restriction Fallback */}
      {artistSongs.length === 0 && artistAlbums.length === 0 && (
        <EmptyState
          icon={<Music size={48} />}
          title="No music available"
          description="Due to Deezer API regional licensing restrictions, this artist's catalog is currently unavailable in your country."
        />
      )}
    </div>
  );
}
