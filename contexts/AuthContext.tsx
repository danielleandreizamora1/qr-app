import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { getSession, signOut as signOutUser } from '@/lib/auth';
import { getProfile } from '@/lib/profiles';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string | null) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    setProfile(await getProfile(userId));
  };

  useEffect(() => {
    let mounted = true;

    getSession()
      .then(async (currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
        await loadProfile(currentSession?.user.id ?? null);
      })
      .catch(() => {
        if (mounted) {
          setSession(null);
          setProfile(null);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      if (event === 'SIGNED_OUT') {
        setProfile(null);
        return;
      }
      void loadProfile(nextSession?.user.id ?? null);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    await loadProfile(session?.user.id ?? null);
  };

  const signOut = async () => {
    await signOutUser();
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
