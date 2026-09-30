import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, LogIn, LogOut, Settings } from 'lucide-react';
import { Button, EmptyState } from '../components/ui';
import { useAuth } from '../store/authStore';
import { useLibrary } from '../store/libraryStore';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { state: libState } = useLibrary();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-display)]">Profile</h1>
        <p className="text-[var(--color-text-muted)] mt-2">Manage your account and preferences</p>
      </motion.div>

      {user ? (
        <motion.div
          className="max-w-2xl mx-auto space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-6 p-6 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-pink-500 flex items-center justify-center shrink-0">
              {user.displayName ? (
                <span className="text-white text-3xl font-bold">{user.displayName.charAt(0).toUpperCase()}</span>
              ) : (
                <User size={32} className="text-white" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{user.displayName}</h2>
              <p className="text-[var(--color-text-muted)]">{user.email}</p>
            </div>
            <Button variant="secondary" onClick={handleLogout} className="gap-2">
              <LogOut size={16} /> Sign Out
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Liked Songs', value: libState.likedSongs.length },
              { label: 'Playlists', value: libState.playlists.length },
              { label: 'Saved Albums', value: libState.savedAlbums.length },
              { label: 'Following', value: libState.followedArtists.length },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center">
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="max-w-md mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <EmptyState
            icon={<User size={56} />}
            title="Sign in to Moodify"
            description="Create an account or sign in to save your library, sync playlists, and unlock personalized recommendations."
            action={
              <Link to="/login">
                <Button className="gap-2 mt-2">
                  <LogIn size={18} />
                  Sign In
                </Button>
              </Link>
            }
          />
        </motion.div>
      )}

      {/* Settings Preview */}
      <motion.div
        className="max-w-lg mx-auto space-y-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Preferences</h3>
        {[
          { label: 'Audio Quality', value: 'High' },
          { label: 'Theme', value: 'Dark' },
          { label: 'Reduced Motion', value: 'Off' },
          { label: 'Language', value: 'English' },
        ].map((pref) => (
          <div
            key={pref.label}
            className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-subtle)]"
          >
            <span className="text-sm">{pref.label}</span>
            <span className="text-sm text-[var(--color-text-muted)]">{pref.value}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
