import { useEffect, useState } from 'react';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useAppDispatch } from '@/lib/hooks';
import { setUser, logout } from '@/lib/slices/userSlice';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setAuthUser] = useState<User | null>(null);
  const supabase = createClient();
  const dispatch = useAppDispatch();

  // If no supabase client (build time), return early
  if (!supabase) {
    return {
      user: null,
      loading: false,
      signOut: async () => {},
    };
  }

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthUser(session?.user ?? null);
      
      if (session?.user) {
        const reduxUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.email?.split('@')[0] || '',
          preferences: {
            favoriteGenres: [],
            theme: 'dark' as const,
            notifications: true,
          },
        };
        dispatch(setUser(reduxUser));
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        setAuthUser(session?.user ?? null);
        
        if (session?.user) {
          const reduxUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.email?.split('@')[0] || '',
            preferences: {
              favoriteGenres: [],
              theme: 'dark' as const,
              notifications: true,
            },
          };
          dispatch(setUser(reduxUser));
        } else {
          dispatch(logout());
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth, dispatch]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    loading,
    signOut,
  };
}