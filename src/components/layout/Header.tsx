'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { isAuthenticated, currentUser } = useAppSelector(state => state.user);
  const { signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-netflix-dark/95 backdrop-blur-md' : 'bg-gradient-to-b from-black/60 to-transparent'
    }`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl lg:text-3xl font-black text-netflix-red">
                NETFLIX
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link 
                href="/" 
                className="text-white hover:text-gray-300 transition-colors duration-200 text-sm font-medium"
              >
                Home
              </Link>
              <Link 
                href="/tv" 
                className="text-white hover:text-gray-300 transition-colors duration-200 text-sm font-medium"
              >
                TV Shows
              </Link>
              <Link 
                href="/search" 
                className="text-white hover:text-gray-300 transition-colors duration-200 text-sm font-medium"
              >
                Movies
              </Link>
              <Link 
                href="/new" 
                className="text-white hover:text-gray-300 transition-colors duration-200 text-sm font-medium"
              >
                New & Popular
              </Link>
              <Link 
                href="/watchlist" 
                className="text-white hover:text-gray-300 transition-colors duration-200 text-sm font-medium"
              >
                My List
              </Link>
              <Link 
                href="/languages" 
                className="text-white hover:text-gray-300 transition-colors duration-200 text-sm font-medium"
              >
                Browse by Languages
              </Link>
            </nav>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* Search icon */}
            <Link href="/search" className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            {/* Notifications */}
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 01-6 0v-1m6 0H9" />
              </svg>
            </button>

            {/* User Profile */}
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 hover:bg-white/10 rounded-lg p-2 transition-colors"
                >
                  <div className="hidden md:block text-right">
                    <div className="text-sm font-medium text-white">
                      {currentUser?.name || 'User'}
                    </div>
                    <div className="text-xs text-white/60">
                      {currentUser?.email}
                    </div>
                  </div>
                  <div className="w-8 h-8 bg-netflix-red rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                </button>
                
                {isUserMenuOpen ? (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-600 rounded-lg shadow-2xl z-50 animate-fadeIn">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-3 text-gray-200 hover:bg-netflix-red hover:text-white transition-all duration-200 rounded-t-lg"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <button 
                      onClick={() => {
                        signOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-200 hover:bg-netflix-red hover:text-white transition-all duration-200 rounded-b-lg"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-netflix-red hover:bg-netflix-red/90 px-4 py-2 rounded-md text-white font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 py-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="text-white/90 hover:text-white transition-colors duration-200 font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/search" 
                className="text-white/90 hover:text-white transition-colors duration-200 font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Search
              </Link>
              <Link 
                href="/watchlist" 
                className="text-white/90 hover:text-white transition-colors duration-200 font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My List
              </Link>
              <Link 
                href="/discover" 
                className="text-white/90 hover:text-white transition-colors duration-200 font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Discover
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}