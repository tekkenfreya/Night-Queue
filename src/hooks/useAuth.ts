import { useEffect, useState } from 'react';
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { useAppDispatch } from '@/lib/hooks';
import { setUser, logout } from '@/lib/slices/userSlice';

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [user, setAuthUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);
  const supabase = createClient();
  const dispatch = useAppDispatch();

  // If no supabase client (build time), return early
  if (!supabase) {
    return {
      user: null,
      loading: false,
      initialized: true,
      signOut: async () => {},
      signIn: async () => {},
    };
  }

  useEffect(() => {
    // Get initial session only if not already initialized
    const getInitialSession = async () => {
      if (initialized) return;
      
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
      } else {
        // Ensure Redux state is cleared if no session
        dispatch(logout());
      }
      
      setLoading(false);
      setInitialized(true);
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
  }, [supabase.auth, dispatch, initialized]);

  const signOut = async () => {
    try {
      // Clear all local state first
      setAuthUser(null);
      dispatch(logout());
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear any additional local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('supabase.auth.token');
        sessionStorage.clear();
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const signIn = async () => {
    // This will be called when user wants to explicitly sign in
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setAuthUser(session.user);
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
  };

  return {
    user,
    loading,
    initialized,
    signOut,
    signIn,
  };
}