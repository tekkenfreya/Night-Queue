'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/lib/hooks';
import { setUser } from '@/lib/slices/userSlice';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simple mock authentication - replace with real auth later
    setTimeout(() => {
      const mockUser = {
        id: '1',
        email,
        name: email.split('@')[0],
        preferences: {
          favoriteGenres: [],
          theme: 'dark' as const,
          notifications: true,
        },
      };

      dispatch(setUser(mockUser));
      router.push('/');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-netflix-gray p-8 rounded-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">Sign In to NightQueue</h1>
        
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
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <p className="text-center text-gray-400 text-sm mt-6">
          Demo app - use any email/password to login
        </p>
      </div>
    </div>
  );
}