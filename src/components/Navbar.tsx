import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Compass,
  Search,
  Library,
  ListMusic,
  User,
  Menu,
  X,
  Music2,
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../store/authStore';
import Button from './ui/Button';
import { cn } from '../utils';

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/library', label: 'Library', icon: Library },
  { to: '/playlists', label: 'Playlists', icon: ListMusic },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:flex fixed top-0 left-0 right-0 z-40 h-[var(--nav-height)] items-center justify-between px-8 glass">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-gradient-to-br from-[var(--color-accent)] to-purple-400 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
            <Music2 size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold font-[var(--font-display)] bg-gradient-to-r from-[var(--color-text-primary)] to-[var(--color-text-secondary)] bg-clip-text text-transparent">
            Moodify
          </span>
        </NavLink>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'text-[var(--color-text-primary)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/[0.06] rounded-xl border border-white/[0.08]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <item.icon size={18} className="relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* Profile / Auth */}
        <div className="flex items-center gap-3">
          {user ? (
            <NavLink
              to="/profile"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-pink-500 flex items-center justify-center">
                {user.displayName ? (
                  <span className="text-white font-bold text-xs">{user.displayName.charAt(0).toUpperCase()}</span>
                ) : (
                  <User size={16} className="text-white" />
                )}
              </div>
            </NavLink>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-[var(--color-text-muted)] hover:text-white transition-colors">
                Log in
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-white/[0.06]">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-colors',
                  isActive
                    ? 'text-[var(--color-accent)]'
                    : 'text-[var(--color-text-muted)]'
                )
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile Menu Button (profile only) */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-xl glass"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-40 bg-[var(--color-bg-primary)]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {user ? (
              <NavLink
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-6 py-3 rounded-xl text-lg"
              >
                <User size={24} />
                <span>Profile</span>
              </NavLink>
            ) : (
              <div className="flex flex-col gap-4">
                <Link to="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="secondary" size="lg" fullWidth>Log in</Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileOpen(false)}>
                  <Button variant="primary" size="lg" fullWidth>Sign up</Button>
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
