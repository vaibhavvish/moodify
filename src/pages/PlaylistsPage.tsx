import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ListMusic, Play, Shuffle, MoreHorizontal, Trash2, Edit3, Music } from 'lucide-react';
import { Button, Modal, Input, EmptyState } from '../components/ui';
import MusicCard from '../components/MusicCard';
import { useLibrary } from '../store/libraryStore';
import { usePlayer } from '../store/playerStore';
import { useAuth } from '../store/authStore';
import { mockPlaylists, getSongById } from '../data/mockData';
import type { Playlist, Song } from '../types';
import { cn } from '../utils';

export default function PlaylistsPage() {
  const { state, createPlaylist, deletePlaylist, renamePlaylist, removeFromPlaylist } = useLibrary();
  const { playSong } = usePlayer();
  const { requireAuth } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const allPlaylists = [...mockPlaylists, ...state.playlists];

  const handleCreate = () => {
    requireAuth(() => {
      if (!newPlaylistName.trim()) return;
      const pl = createPlaylist(newPlaylistName.trim(), newPlaylistDesc.trim() || undefined);
      setShowCreateModal(false);
      setNewPlaylistName('');
      setNewPlaylistDesc('');
      setSelectedPlaylist(pl);
    });
  };

  const handlePlayAll = (playlist: Playlist) => {
    const songs = playlist.songs.map(getSongById).filter(Boolean) as Song[];
    if (songs.length > 0) playSong(songs[0], songs);
  };

  const handleShufflePlay = (playlist: Playlist) => {
    const songs = playlist.songs.map(getSongById).filter(Boolean) as Song[];
    const shuffled = [...songs].sort(() => Math.random() - 0.5);
    if (shuffled.length > 0) playSong(shuffled[0], shuffled);
  };

  const handleRename = (id: string) => {
    if (editName.trim()) {
      renamePlaylist(id, editName.trim());
    }
    setEditingId(null);
  };

  const playlistSongs = selectedPlaylist
    ? (selectedPlaylist.songs.map(getSongById).filter(Boolean) as Song[])
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-display)]">Playlists</h1>
          <p className="text-[var(--color-text-muted)] mt-2">Create and manage your playlists</p>
        </div>
        <Button onClick={() => requireAuth(() => setShowCreateModal(true))} className="gap-2">
          <Plus size={18} />
          <span className="hidden sm:inline">Create Playlist</span>
        </Button>
      </motion.div>

      {/* Layout: Sidebar + Detail */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Playlist List */}
        <div className="lg:w-80 shrink-0 space-y-2">
          {allPlaylists.length === 0 ? (
            <EmptyState
              icon={<ListMusic size={48} />}
              title="No playlists yet"
              description="Create your first playlist to get started."
              action={
                <Button onClick={() => requireAuth(() => setShowCreateModal(true))} size="sm">
                  <Plus size={14} /> Create
                </Button>
              }
            />
          ) : (
            allPlaylists.map((pl) => (
              <motion.button
                key={pl.id}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                  selectedPlaylist?.id === pl.id
                    ? 'bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20'
                    : 'hover:bg-white/[0.03] border border-transparent'
                )}
                onClick={() => setSelectedPlaylist(pl)}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[var(--color-bg-card)]">
                  {pl.coverUrl ? (
                    <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-accent)]/20 to-purple-500/10">
                      <Music size={18} className="text-[var(--color-text-muted)]" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{pl.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{pl.songs.length} songs</p>
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Playlist Detail */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            {selectedPlaylist ? (
              <motion.div
                key={selectedPlaylist.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* Playlist Header */}
                <div className="flex items-start gap-5">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden shrink-0 bg-[var(--color-bg-card)] shadow-lg">
                    {selectedPlaylist.coverUrl ? (
                      <img src={selectedPlaylist.coverUrl} alt={selectedPlaylist.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--color-accent)]/20 to-purple-500/10">
                        <ListMusic size={40} className="text-[var(--color-text-muted)]" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pt-2">
                    <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Playlist</p>
                    {editingId === selectedPlaylist.id ? (
                      <div className="flex gap-2 mb-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="text-lg font-bold py-1"
                          onKeyDown={(e) => { if (e.key === 'Enter') handleRename(selectedPlaylist.id); }}
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleRename(selectedPlaylist.id)}>Save</Button>
                      </div>
                    ) : (
                      <h2 className="text-2xl md:text-3xl font-bold font-[var(--font-display)] truncate mb-1">
                        {selectedPlaylist.name}
                      </h2>
                    )}
                    {selectedPlaylist.description && (
                      <p className="text-sm text-[var(--color-text-muted)] mb-3">{selectedPlaylist.description}</p>
                    )}
                    <p className="text-xs text-[var(--color-text-muted)]">
                      {selectedPlaylist.songs.length} songs
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      <Button size="md" onClick={() => handlePlayAll(selectedPlaylist)} className="gap-2">
                        <Play size={16} fill="currentColor" /> Play
                      </Button>
                      <Button size="md" variant="secondary" onClick={() => handleShufflePlay(selectedPlaylist)} className="gap-2">
                        <Shuffle size={16} /> Shuffle
                      </Button>
                      {selectedPlaylist.createdBy === 'user' && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => { setEditingId(selectedPlaylist.id); setEditName(selectedPlaylist.name); }}
                            aria-label="Rename"
                          >
                            <Edit3 size={16} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => { deletePlaylist(selectedPlaylist.id); setSelectedPlaylist(null); }}
                            aria-label="Delete"
                          >
                            <Trash2 size={16} className="text-red-400" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Songs */}
                {playlistSongs.length > 0 ? (
                  <div className="space-y-1">
                    {playlistSongs.map((song, i) => (
                      <MusicCard key={song.id} song={song} songs={playlistSongs} variant="list" index={i} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Music size={40} />}
                    title="This playlist is empty"
                    description="Search for songs and add them to this playlist."
                  />
                )}
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <EmptyState
                  icon={<ListMusic size={48} />}
                  title="Select a playlist"
                  description="Choose a playlist from the sidebar to view its songs."
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Playlist Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Playlist">
        <div className="space-y-4 mt-2">
          <Input
            placeholder="Playlist name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            autoFocus
          />
          <Input
            placeholder="Description (optional)"
            value={newPlaylistDesc}
            onChange={(e) => setNewPlaylistDesc(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newPlaylistName.trim()}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
