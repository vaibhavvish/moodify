import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Player from '../components/Player';
import AmbientBackground from '../components/AmbientBackground';
import AuthPromptModal from '../components/AuthPromptModal';
import VibeFlowController from '../components/VibeFlowController';
import { usePlayer } from '../store/playerStore';
import { cn } from '../utils';

export default function MainLayout() {
  const { state } = usePlayer();
  const hasPlayer = !!state.currentSong;

  return (
    <div className="min-h-screen flex flex-col">
      <AmbientBackground />
      <Navbar />

      {/* Main content area */}
      <main
        className={cn(
          'flex-1 px-4 md:px-8 lg:px-12',
          'pt-[calc(var(--nav-height)+16px)] md:pt-[calc(var(--nav-height)+24px)]',
          // Bottom padding for player + mobile nav
          hasPlayer ? 'pb-[180px] md:pb-[120px]' : 'pb-24 md:pb-8'
        )}
      >
        <div className="max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Player */}
      <Player />
      
      <AuthPromptModal />
      <VibeFlowController />
    </div>
  );
}
