import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/HomePage';
import DiscoverPage from '../pages/DiscoverPage';
import SearchPage from '../pages/SearchPage';
import LibraryPage from '../pages/LibraryPage';
import PlaylistsPage from '../pages/PlaylistsPage';
import ProfilePage from '../pages/ProfilePage';
import ArtistPage from '../pages/ArtistPage';
import AlbumPage from '../pages/AlbumPage';
import GenrePage from '../pages/GenrePage';
import VibeMatchPage from '../pages/VibeMatchPage';
import MoodPage from '../pages/MoodPage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import VibeFlowPage from '../pages/VibeFlowPage';
import { PageTransition } from './ui';

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
        
        <Route element={<MainLayout />}>
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/discover" element={<PageTransition><DiscoverPage /></PageTransition>} />
          <Route path="/search" element={<PageTransition><SearchPage /></PageTransition>} />
          <Route path="/library" element={<PageTransition><LibraryPage /></PageTransition>} />
          <Route path="/playlists" element={<PageTransition><PlaylistsPage /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
          <Route path="/artist/:id" element={<PageTransition><ArtistPage /></PageTransition>} />
          <Route path="/album/:id" element={<PageTransition><AlbumPage /></PageTransition>} />
          <Route path="/genre/:name" element={<PageTransition><GenrePage /></PageTransition>} />
          <Route path="/vibe-match" element={<PageTransition><VibeMatchPage /></PageTransition>} />
          <Route path="/mood/:mood" element={<PageTransition><MoodPage /></PageTransition>} />
          <Route path="/vibe-flow" element={<PageTransition><VibeFlowPage /></PageTransition>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
