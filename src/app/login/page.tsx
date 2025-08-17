'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { setUser } from '@/lib/slices/userSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const redirectTo = searchParams.get('redirectTo') || '/';

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
          setMessage('Login successful! Redirecting...');
          
          // Small delay to show success message before redirect
          setTimeout(() => {
            router.push(redirectTo);
          }, 1000);
        }
      }
    } catch (error) {
      setMessage('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md shadow-2xl animate-scaleIn border border-gray-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isSignUp ? 'Join NightQueue' : 'Welcome Back'}
          </h1>
          <p className="text-gray-400">
            {isSignUp ? 'Create your movie tracking account' : 'Sign in to your account'}
          </p>
        </div>
        
        {message ? (
          <div className={`mb-6 p-4 rounded-lg text-sm animate-slideUp ${
            message.includes('check your email') || message.includes('successful')
              ? 'bg-green-900/50 border border-green-600 text-green-200' 
              : 'bg-red-900/50 border border-red-600 text-red-200'
          }`}>
            <div className="flex items-center gap-3">
              {message.includes('check your email') || message.includes('successful') ? (
                <span className="text-green-400">✓</span>
              ) : (
                <span className="text-red-400">❌</span>
              )}
              {message}
            </div>
          </div>
        ) : null}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-netflix-red focus:ring-2 focus:ring-netflix-red/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-netflix-red focus:ring-2 focus:ring-netflix-red/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter your password"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-netflix-red py-3 rounded-lg font-medium hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                {isSignUp ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              isSignUp ? 'Sign Up' : 'Sign In'
            )}
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="text-white">Loading...</div>
    </div>}>
      <LoginForm />
    </Suspense>
  );
}