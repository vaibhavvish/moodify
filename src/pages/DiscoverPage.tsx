import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronRight, TrendingUp, Disc3, Users, Clock, Globe2 } from 'lucide-react';
import MusicCard from '../components/MusicCard';
import { MusicCardSkeleton, ArtistCardSkeleton } from '../components/ui/Skeleton';
import { getMusicProvider } from '../services/music';
import { mockSongs, mockArtists, mockAlbums, mockGenres, mockLanguages, mockPlaylists } from '../data/mockData';
import type { Song, Album, Artist, Genre, Language } from '../types';
import { formatCount, cn } from '../utils';
import { usePlayer } from '../store/playerStore';

export default function DiscoverPage() {
  const [trending, setTrending] = useState<Song[]>([]);
  const [newReleases, setNewReleases] = useState<Album[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(true);
  const { playSong } = usePlayer();

  useEffect(() => {
    const provider = getMusicProvider();
    Promise.all([
      provider.getTrending(),
      provider.getNewReleases(),
      provider.getGenres(),
      provider.getLanguages(),
    ]).then(([t, nr, g, l]) => {
      setTrending(t);
      setNewReleases(nr);
      setGenres(g);
      setLanguages(l);
      setLoading(false);
    });
  }, []);

  const popularArtists = [...mockArtists].sort((a, b) => b.followers - a.followers).slice(0, 8);
  const recommended = [...mockSongs].sort(() => Math.random() - 0.5).slice(0, 8);
  const recentlyPlayed = mockSongs.slice(0, 6);

  const sectionAnim = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.5 },
  };

  return (
    <div className="space-y-14 md:space-y-20">
      {/* Header */}
      <motion.div {...sectionAnim}>
        <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-display)]">Discover</h1>
        <p className="text-[var(--color-text-muted)] mt-2">Explore new music, genres, and artists</p>
      </motion.div>

      {/* Trending */}
      <motion.section {...sectionAnim}>
        <SectionHeader icon={<TrendingUp size={20} />} title="Trending Now" />
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {[...Array(5)].map((_, i) => <MusicCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {trending.map((song, i) => (
              <motion.div key={song.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <MusicCard song={song} songs={trending} />
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* New Releases */}
      <motion.section {...sectionAnim}>
        <SectionHeader icon={<Disc3 size={20} />} title="New Releases" />
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
            {[...Array(4)].map((_, i) => <MusicCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
            {newReleases.map((album, i) => (
              <motion.div
                key={album.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4 }}
              >
                <Link to={`/album/${album.id}`} className="group block cursor-pointer">
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-[var(--color-bg-card)]">
                    <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h3 className="text-sm font-medium truncate">{album.title}</h3>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{album.artist} • {album.trackCount} tracks</p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Popular Artists */}
      <motion.section {...sectionAnim}>
        <SectionHeader icon={<Users size={20} />} title="Popular Artists" />
        {loading ? (
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {[...Array(6)].map((_, i) => <ArtistCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="flex gap-5 md:gap-6 overflow-x-auto pb-4 -mx-2 px-2" style={{ scrollbarWidth: 'none' }}>
            {popularArtists.map((artist, i) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Link to={`/artist/${artist.id}`} className="flex flex-col items-center gap-3 shrink-0 cursor-pointer group">
                  <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[var(--color-accent)]/50 transition-colors shadow-lg">
                    <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium truncate max-w-[120px]">{artist.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{formatCount(artist.followers)} followers</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Recommended */}
      <motion.section {...sectionAnim}>
        <SectionHeader title="Recommended For You" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-5">
          {recommended.slice(0, 8).map((song, i) => (
            <motion.div key={song.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <MusicCard song={song} songs={recommended} />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Recently Played */}
      <motion.section {...sectionAnim}>
        <SectionHeader icon={<Clock size={20} />} title="Recently Played" />
        <div className="space-y-1">
          {recentlyPlayed.map((song, i) => (
            <MusicCard key={song.id} song={song} songs={recentlyPlayed} variant="list" index={i} />
          ))}
        </div>
      </motion.section>

      {/* Popular Albums */}
      <motion.section {...sectionAnim}>
        <SectionHeader icon={<Disc3 size={20} />} title="Popular Albums" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-5">
          {mockAlbums.slice(0, 6).map((album, i) => (
            <motion.div
              key={album.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -4 }}
            >
              <Link to={`/album/${album.id}`} className="group block cursor-pointer">
                <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-[var(--color-bg-card)]">
                  <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                </div>
                <h3 className="text-sm font-medium truncate">{album.title}</h3>
                <p className="text-xs text-[var(--color-text-muted)] truncate">{album.artist}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Genres */}
      <motion.section {...sectionAnim}>
        <SectionHeader title="Genres" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {genres.map((genre, i) => (
            <Link key={genre.id} to={`/genre/${encodeURIComponent(genre.name)}`}>
              <motion.div
                className="relative overflow-hidden rounded-xl h-28 md:h-32 cursor-pointer group"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.03 }}
              >
                <img src={genre.imageUrl} alt={genre.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${genre.color}cc, ${genre.color}44)` }} />
                <div className="absolute inset-0 flex items-end p-4">
                  <span className="text-sm font-bold text-white drop-shadow-lg">{genre.name}</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Languages */}
      <motion.section {...sectionAnim}>
        <SectionHeader icon={<Globe2 size={20} />} title="Browse by Language" />
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3 md:gap-4">
          {languages.map((lang, i) => (
            <motion.div
              key={lang.id}
              className="flex items-center gap-3 p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border)] cursor-pointer transition-colors group"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ x: 4 }}
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                <img src={lang.imageUrl} alt={lang.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <span className="text-sm font-medium">{lang.name}</span>
              <ChevronRight size={16} className="ml-auto text-[var(--color-text-muted)] group-hover:text-[var(--color-accent)] transition-colors" />
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

// Section Header helper
function SectionHeader({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      {icon && <span className="text-[var(--color-accent)]">{icon}</span>}
      <h2 className="text-xl md:text-2xl font-bold font-[var(--font-display)]">{title}</h2>
    </div>
  );
}
