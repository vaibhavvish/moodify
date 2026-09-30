import { useNavigate } from 'react-router-dom';
import { User, LogIn, X } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { useAuth } from '../store/authStore';

export default function AuthPromptModal() {
  const { authPromptOpen, closeAuthPrompt } = useAuth();
  const navigate = useNavigate();

  if (!authPromptOpen) return null;

  return (
    <Modal isOpen={authPromptOpen} onClose={closeAuthPrompt}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-pink-500 flex items-center justify-center mx-auto mb-6">
          <User size={32} className="text-white" />
        </div>
        
        <h2 className="text-2xl font-bold font-[var(--font-display)] mb-2">
          Sign in required
        </h2>
        
        <p className="text-[var(--color-text-muted)] mb-8 max-w-sm mx-auto">
          Create an account or sign in to save music to your personal library and access it anywhere.
        </p>

        <div className="flex flex-col gap-3">
          <Button 
            variant="primary" 
            size="lg" 
            fullWidth
            onClick={() => {
              closeAuthPrompt();
              navigate('/signup');
            }}
          >
            Create Account
          </Button>
          
          <Button 
            variant="secondary" 
            size="lg"
            fullWidth
            className="gap-2"
            onClick={() => {
              closeAuthPrompt();
              navigate('/login');
            }}
          >
            <LogIn size={18} />
            Sign In
          </Button>
          
          <button 
            onClick={closeAuthPrompt}
            className="mt-4 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </Modal>
  );
}
