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
    <div className="min-h-screen bg-gradient-to-b from-gray-900/50 via-black to-black text-white relative flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>
      
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* NextPick Logo/Branding */}
        <div className="text-center mb-12">
          <div className="mb-6">
            <img 
              src="/nextpick.png" 
              alt="NextPick" 
              className="h-16 md:h-20 w-auto mx-auto"
            />
          </div>
          <p className="text-gray-300 text-lg font-light">
            Find the gems. Skip the rest.
          </p>
        </div>
        
        <div className="bg-black/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="font-heading text-2xl font-black text-white mb-2 tracking-wide">
              {isSignUp ? 'JOIN THE EXPERIENCE' : 'WELCOME BACK'}
            </h2>
            <p className="text-gray-400 text-sm">
              {isSignUp ? 'Create your movie tracking account' : 'Sign in to continue your journey'}
            </p>
          </div>
        
          {message ? (
            <div className={`mb-6 p-4 rounded-xl text-sm backdrop-blur-sm border ${
              message.includes('check your email') || message.includes('successful')
                ? 'bg-green-900/30 border-green-600/50 text-green-200' 
                : 'bg-red-900/30 border-red-600/50 text-red-200'
            }`}>
              <div className="flex items-center gap-3">
                {message.includes('check your email') || message.includes('successful') ? (
                  <div className="w-6 h-6 bg-green-600/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-red-600/20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                <span className="font-medium">{message}</span>
              </div>
            </div>
          ) : null}
        
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-heading font-semibold mb-3 text-gray-200 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-netflix-red focus:ring-2 focus:ring-netflix-red/20 focus:bg-gray-800/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  placeholder="your@email.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-heading font-semibold mb-3 text-gray-200 uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-netflix-red focus:ring-2 focus:ring-netflix-red/20 focus:bg-gray-800/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-netflix-red to-red-600 hover:from-red-700 hover:to-red-800 py-4 rounded-xl font-heading font-bold text-lg tracking-wide uppercase transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  {isSignUp ? 'Join NextPick' : 'Enter NextPick'}
                </>
              )}
            </button>
          </form>
        
          <div className="mt-8 pt-6 border-t border-gray-700/50">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-3">
                {isSignUp ? 'Already part of NextPick?' : 'New to NextPick?'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setMessage('');
                }}
                className="text-netflix-red hover:text-red-400 font-heading font-semibold text-sm uppercase tracking-wide transition-colors duration-200 relative group"
              >
                {isSignUp ? 'Sign In Instead' : 'Create Account'}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-netflix-red transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-900/50 via-black to-black text-white relative flex items-center justify-center">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-netflix-red mx-auto mb-4"></div>
          <div className="font-heading text-lg font-semibold tracking-wide">Loading NextPick...</div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}