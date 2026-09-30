import { motion } from 'framer-motion';
import { Heart, Clock, ListMusic, Disc3, Users, Music } from 'lucide-react';
import { EmptyState } from '../components/ui';
import MusicCard from '../components/MusicCard';
import { useLibrary } from '../store/libraryStore';
import { mockAlbums, mockArtists, mockPlaylists } from '../data/mockData';
import { cn, formatCount } from '../utils';
import { Link } from 'react-router-dom';
import { useState } from 'react';

type LibraryTab = 'liked' | 'recent' | 'playlists' | 'albums' | 'artists';

const tabs: { key: LibraryTab; label: string; icon: React.ReactNode }[] = [
  { key: 'liked', label: 'Liked Songs', icon: <Heart size={16} /> },
  { key: 'recent', label: 'Recently Played', icon: <Clock size={16} /> },
  { key: 'playlists', label: 'My Playlists', icon: <ListMusic size={16} /> },
  { key: 'albums', label: 'Saved Albums', icon: <Disc3 size={16} /> },
  { key: 'artists', label: 'Followed Artists', icon: <Users size={16} /> },
];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState<LibraryTab>('liked');
  const { getLikedSongs, getRecentlyPlayedSongs, state } = useLibrary();

  const likedSongs = getLikedSongs();
  const recentSongs = getRecentlyPlayedSongs();
  const userPlaylists = state.playlists;
  const allPlaylists = [...mockPlaylists, ...userPlaylists];

  const sectionAnim = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-display)]">Your Library</h1>
        <p className="text-[var(--color-text-muted)] mt-2">Your music collection in one place</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              activeTab === tab.key
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:text-white border border-[var(--color-border-subtle)]'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div {...sectionAnim} key={activeTab}>
        {activeTab === 'liked' && (
          <>
            {likedSongs.length > 0 ? (
              <div className="space-y-1">
                <p className="text-sm text-[var(--color-text-muted)] mb-4">{likedSongs.length} songs</p>
                {likedSongs.map((song, i) => (
                  <MusicCard key={song.id} song={song} songs={likedSongs} variant="list" index={i} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Heart size={48} />}
                title="No liked songs yet"
                description="Start liking songs to build your collection."
              />
            )}
          </>
        )}

        {activeTab === 'recent' && (
          <>
            {recentSongs.length > 0 ? (
              <div className="space-y-1">
                <p className="text-sm text-[var(--color-text-muted)] mb-4">Your listening history</p>
                {recentSongs.map((song, i) => (
                  <MusicCard key={song.id} song={song} songs={recentSongs} variant="list" index={i} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Clock size={48} />}
                title="No recently played songs"
                description="Start listening to build your history."
              />
            )}
          </>
        )}

        {activeTab === 'playlists' && (
          <>
            {allPlaylists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {allPlaylists.map((pl) => (
                  <Link
                    key={pl.id}
                    to="/playlists"
                    className="group cursor-pointer block"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden mb-3 bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)] group-hover:border-[var(--color-border)] transition-colors">
                      {pl.coverUrl ? (
                        <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-accent)]/20 to-purple-500/10">
                          <ListMusic size={32} className="text-[var(--color-text-muted)]" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-medium truncate">{pl.name}</h3>
                    <p className="text-xs text-[var(--color-text-muted)]">{pl.songs.length} songs</p>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<ListMusic size={48} />}
                title="No playlists yet"
                description="Create your first playlist to organize your music."
                action={
                  <Link to="/playlists" className="text-[var(--color-accent)] text-sm font-medium hover:underline">
                    Create Playlist
                  </Link>
                }
              />
            )}
          </>
        )}

        {activeTab === 'albums' && (
          <EmptyState
            icon={<Disc3 size={48} />}
            title="No saved albums"
            description="Albums you save will appear here."
          />
        )}

        {activeTab === 'artists' && (
          <EmptyState
            icon={<Users size={48} />}
            title="No followed artists"
            description="Follow artists to stay updated with their music."
          />
        )}
      </motion.div>
    </div>
  );
}
