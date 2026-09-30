import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Loader2, ArrowLeft } from 'lucide-react';
import { supabase, hasSupabaseConfig } from '../services/supabase';
import { useAuth } from '../store/authStore';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function SignupPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasSupabaseConfig) {
      setError('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file to enable authentication.');
      return;
    }

    if (!email || !password || !displayName) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) throw error;
      
      // Usually Supabase logs them in automatically if email confirmations are off.
      // We can just redirect.
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[var(--color-bg)]" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-accent)]/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
          
          <div className="mb-6 relative z-10">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-[var(--color-text-muted)] hover:text-white transition-colors">
              <ArrowLeft size={16} /> Back to login
            </Link>
          </div>

          <div className="text-center mb-8 relative z-10">
            <h1 className="text-3xl font-bold font-[var(--font-display)] mb-2">Create Account</h1>
            <p className="text-[var(--color-text-muted)]">Join Moodify to sync your vibe across devices</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm relative z-10"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSignup} className="space-y-4 relative z-10">
            <Input
              icon={<UserIcon size={18} />}
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
            <Input
              icon={<Mail size={18} />}
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              icon={<Lock size={18} />}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              icon={<Lock size={18} />}
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
              className="mt-6"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'Create Account'}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
