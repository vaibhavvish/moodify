import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Music, Mic, Users, Disc3, ListMusic, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input, EmptyState } from '../components/ui';
import { PageLoader } from '../components/ui/Loader';
import MusicCard from '../components/MusicCard';
import { getMusicProvider } from '../services/music';
import { mockGenres } from '../data/mockData';
import type { SearchResult, SearchCategory } from '../types';
import { cn, debounce } from '../utils';
import { formatCount } from '../utils';

const categories: { key: SearchCategory; label: string; icon: React.ReactNode }[] = [
  { key: 'all', label: 'All', icon: <Search size={14} /> },
  { key: 'songs', label: 'Songs', icon: <Music size={14} /> },
  { key: 'artists', label: 'Artists', icon: <Users size={14} /> },
  { key: 'albums', label: 'Albums', icon: <Disc3 size={14} /> },
  { key: 'playlists', label: 'Playlists', icon: <ListMusic size={14} /> },
];

const searchSuggestions = [
  'Midnight Aurora',
  'Luna Echo',
  'Velvet Dreams',
  'Lo-fi',
  'Jazz',
  'Electronic',
  'Cosmic Wanderer',
  'Rock',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim()) {
        setResults(null);
        setHasSearched(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      setHasSearched(true);
      try {
        const provider = getMusicProvider();
        const res = await provider.search(q);
        setResults(res);
      } catch {
        setResults({ songs: [], artists: [], albums: [], playlists: [] });
      }
      setLoading(false);
    }, 300),
    []
  );

  useEffect(() => {
    performSearch(query);
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setResults(null);
    setHasSearched(false);
  };

  const isCategoryEmpty = 
    hasSearched && results && (
      (activeCategory === 'songs' && results.songs.length === 0) ||
      (activeCategory === 'artists' && results.artists.length === 0) ||
      (activeCategory === 'albums' && results.albums.length === 0) ||
      (activeCategory === 'playlists' && results.playlists.length === 0)
    );

  const noResults = hasSearched && results && results.songs.length === 0 && results.artists.length === 0 && results.albums.length === 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-display)] mb-6">Search</h1>

        {/* Search Input */}
        <div className="relative max-w-2xl">
          <Input
            icon={<Search size={20} />}
            placeholder="Search songs, artists, albums and more"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="text-base pr-10"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[var(--color-text-muted)] hover:text-white transition-colors"
              aria-label="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        {hasSearched && (
          <motion.div
            className="flex gap-2 mt-4 overflow-x-auto pb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ scrollbarWidth: 'none' }}
          >
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all',
                  activeCategory === cat.key
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:text-white border border-[var(--color-border-subtle)]'
                )}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Loading */}
      {loading && <PageLoader />}

      {/* No Query: Suggestions + Genres */}
      {!hasSearched && !loading && (
        <AnimatePresence>
          <motion.div className="space-y-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Search Suggestions */}
            <div>
              <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-3 flex items-center gap-2">
                <TrendingUp size={14} />
                Trending Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {searchSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setQuery(suggestion)}
                    className="px-4 py-2 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] text-sm text-[var(--color-text-secondary)] hover:text-white hover:border-[var(--color-border)] transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Browse Genres */}
            <div>
              <h3 className="text-sm font-medium text-[var(--color-text-muted)] mb-4">Browse Genres</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {mockGenres.map((genre, i) => (
                  <motion.button
                    key={genre.id}
                    className="relative overflow-hidden rounded-xl h-24 text-left group"
                    onClick={() => setQuery(genre.name)}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <img
                      src={genre.imageUrl}
                      alt={genre.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${genre.color}bb, ${genre.color}33)` }} />
                    <div className="absolute inset-0 flex items-end p-3">
                      <span className="text-sm font-bold text-white">{genre.name}</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* No Results for everything */}
      {noResults && !loading && (
        <EmptyState
          icon={<Search size={48} />}
          title="No results found"
          description={`We couldn't find anything for "${query}". Try a different search.`}
        />
      )}

      {/* No Results for specific category */}
      {!noResults && isCategoryEmpty && !loading && (
        <EmptyState
          icon={<Search size={48} />}
          title={`No ${activeCategory} found`}
          description={`We couldn't find any ${activeCategory} for "${query}".`}
        />
      )}

      {/* Results */}
      {results && !noResults && !loading && (
        <motion.div className="space-y-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Songs */}
          {(activeCategory === 'all' || activeCategory === 'songs') && results.songs.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold font-[var(--font-display)] mb-3 flex items-center gap-2">
                <Music size={18} className="text-[var(--color-accent)]" />
                Songs
              </h3>
              <div className="space-y-1">
                {results.songs.map((song, i) => (
                  <MusicCard key={song.id} song={song} songs={results.songs} variant="list" index={i} />
                ))}
              </div>
            </section>
          )}

          {/* Artists */}
          {(activeCategory === 'all' || activeCategory === 'artists') && results.artists.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold font-[var(--font-display)] mb-3 flex items-center gap-2">
                <Users size={18} className="text-[var(--color-accent)]" />
                Artists
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {results.artists.map((artist) => (
                  <Link key={artist.id} to={`/artist/${artist.id}`} className="flex flex-col items-center gap-3 cursor-pointer group">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[var(--color-accent)]/50 transition-colors">
                      <img src={artist.imageUrl} alt={artist.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">{artist.name}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{formatCount(artist.followers)} followers</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {(activeCategory === 'all' || activeCategory === 'albums') && results.albums.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold font-[var(--font-display)] mb-3 flex items-center gap-2">
                <Disc3 size={18} className="text-[var(--color-accent)]" />
                Albums
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {results.albums.map((album) => (
                  <Link key={album.id} to={`/album/${album.id}`} className="group cursor-pointer block">
                    <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-[var(--color-bg-card)]">
                      <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    </div>
                    <h4 className="text-sm font-medium truncate">{album.title}</h4>
                    <p className="text-xs text-[var(--color-text-muted)]">{album.artist}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </motion.div>
      )}
    </div>
  );
}
