'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { setUser } from '@/lib/slices/userSlice';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (error) {
          setMessage(error.message);
        } else if (data.user && !data.session) {
          setMessage('Please check your email for a verification link!');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
        } else if (data.user) {
          const user = {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.email?.split('@')[0] || '',
            preferences: {
              favoriteGenres: [],
              theme: 'dark' as const,
              notifications: true,
            },
          };
          dispatch(setUser(user));
          router.push('/');
        }
      }
    } catch (error) {
      setMessage('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-netflix-gray p-8 rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">
          {isSignUp ? 'Sign Up for NightQueue' : 'Sign In to NightQueue'}
        </h1>
        
        {message ? (
          <div className={`mb-4 p-3 rounded text-sm ${
            message.includes('check your email') 
              ? 'bg-green-800 text-green-200' 
              : 'bg-red-800 text-red-200'
          }`}>
            {message}
          </div>
        ) : null}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-netflix-dark border border-gray-600 rounded text-white focus:outline-none focus:border-netflix-red"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 bg-netflix-dark border border-gray-600 rounded text-white focus:outline-none focus:border-netflix-red"
              placeholder="Enter your password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-netflix-red py-3 rounded font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading 
              ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
              : (isSignUp ? 'Sign Up' : 'Sign In')
            }
          </button>
        </form>
        
        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage('');
            }}
            className="text-netflix-red hover:underline text-sm"
          >
            {isSignUp 
              ? 'Already have an account? Sign In' 
              : "Don't have an account? Sign Up"
            }
          </button>
        </div>
      </div>
    </div>
  );
}