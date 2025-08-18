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
      setIsScrolled(window.scrollY > 20);
    };
    
    // Check initial scroll position
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/80 backdrop-blur-lg' : '!bg-transparent'
    }`}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-20 lg:h-24">
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <img 
                src="/nextpick.png" 
                alt="NextPick" 
                className="h-10 lg:h-14 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link 
                href="/" 
                className="text-white hover:text-gray-300 transition-colors duration-200 text-base font-heading font-semibold"
              >
                Home
              </Link>
              <Link 
                href="/search" 
                className="text-white hover:text-gray-300 transition-colors duration-200 text-base font-heading font-semibold"
              >
                Search
              </Link>
              <Link 
                href="/watchlist" 
                className="text-white hover:text-gray-300 transition-colors duration-200 text-base font-heading font-semibold"
              >
                My List
              </Link>
            </nav>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-5">
            {/* Search icon */}
            <Link href="/search" className="p-3 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>


            {/* User Profile */}
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 hover:bg-gray-800/60 rounded-md p-2 transition-all duration-200 group"
                >
                  <div className="hidden lg:block text-right">
                    <div className="text-sm font-heading font-bold text-white group-hover:text-gray-200 transition-colors">
                      {currentUser?.name || 'User'}
                    </div>
                    <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                      {currentUser?.email}
                    </div>
                  </div>
                  <div className="w-9 h-9 bg-gradient-to-br from-netflix-red to-red-700 rounded-md flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:shadow-xl transition-shadow">
                    {currentUser?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  {/* Dropdown arrow */}
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isUserMenuOpen ? (
                  <div className="absolute right-0 mt-3 w-56 bg-black/95 backdrop-blur-md border border-gray-700/50 rounded-lg shadow-2xl z-50 animate-fadeIn overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-700/50">
                      <div className="text-sm font-heading font-bold text-white">
                        {currentUser?.name || 'User'}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {currentUser?.email}
                      </div>
                    </div>
                    <Link 
                      href="/profile" 
                      className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-800/60 hover:text-white transition-all duration-200"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile
                    </Link>
                    <button 
                      onClick={() => {
                        signOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-800/60 hover:text-white transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link 
                href="/login" 
                className="bg-netflix-red hover:bg-netflix-red/90 px-6 py-3 rounded-md text-white font-heading font-bold transition-colors duration-200 text-base"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-3 hover:bg-white/10 rounded-full transition-colors"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="lg:hidden border-t border-white/10 py-6">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-white/90 hover:text-white transition-colors duration-200 font-heading font-semibold py-3 text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/search" 
                className="text-white/90 hover:text-white transition-colors duration-200 font-heading font-semibold py-3 text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Search
              </Link>
              <Link 
                href="/watchlist" 
                className="text-white/90 hover:text-white transition-colors duration-200 font-heading font-semibold py-3 text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                My List
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}