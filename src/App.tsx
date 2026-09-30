import { BrowserRouter } from 'react-router-dom';
import { PlayerProvider } from './store/playerStore';
import { LibraryProvider } from './store/libraryStore';
import { MoodProvider } from './store/moodStore';
import { AuthProvider } from './store/authStore';
import { VibeFlowProvider } from './store/vibeFlowStore';
import { ToastProvider } from './store/toastStore';
import AnimatedRoutes from './components/AnimatedRoutes';
import { ToastContainer } from './components/ui';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PlayerProvider>
          <LibraryProvider>
            <MoodProvider>
              <VibeFlowProvider>
                <ToastProvider>
                  <AnimatedRoutes />
                  <ToastContainer />
                </ToastProvider>
              </VibeFlowProvider>
            </MoodProvider>
          </LibraryProvider>
        </PlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
