import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, hasSupabaseConfig } from '../services/supabase';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

// Extend our domain user if needed, but for now we map Supabase user
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isInitialized: boolean;
  authPromptOpen: boolean;
}

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  requireAuth: (action: () => void) => void;
  closeAuthPrompt: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isInitialized: false,
    authPromptOpen: false,
  });

  useEffect(() => {
    if (!hasSupabaseConfig) {
      setState(s => ({ ...s, isLoading: false, isInitialized: true }));
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSession = (session: Session | null) => {
    if (session?.user) {
      const user: AuthUser = {
        id: session.user.id,
        email: session.user.email || '',
        displayName: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User',
      };
      setState(s => ({ ...s, user, session, isLoading: false, isInitialized: true, authPromptOpen: false }));
    } else {
      setState(s => ({ ...s, user: null, session: null, isLoading: false, isInitialized: true }));
    }
  };

  const signOut = async () => {
    if (!hasSupabaseConfig) return;
    await supabase.auth.signOut();
  };

  const requireAuth = (action: () => void) => {
    if (state.user) {
      action();
    } else {
      setState(s => ({ ...s, authPromptOpen: true }));
    }
  };

  const closeAuthPrompt = () => {
    setState(s => ({ ...s, authPromptOpen: false }));
  };

  return (
    <AuthContext.Provider value={{ ...state, signOut, requireAuth, closeAuthPrompt }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
