'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

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
            <Link href="/movies" className="flex items-center space-x-2">
              <img
                src="/nextpick.png"
                alt="NextPick"
                className="h-10 lg:h-14 w-auto"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                href="/movies"
                className="text-white hover:text-gray-300 transition-colors duration-200 text-base font-heading font-semibold"
              >
                Movies
              </Link>
              <Link
                href="/anime"
                className="text-white hover:text-gray-300 transition-colors duration-200 text-base font-heading font-semibold"
              >
                Anime
              </Link>
              <Link
                href="/kdrama"
                className="text-white hover:text-gray-300 transition-colors duration-200 text-base font-heading font-semibold"
              >
                K-Drama
              </Link>
              <Link
                href="/games"
                className="text-white hover:text-gray-300 transition-colors duration-200 text-base font-heading font-semibold"
              >
                Games
              </Link>
            </nav>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-5">
            {/* Search icon */}
            <Link href="/search" className="p-3 hover:bg-white/10 rounded-full transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

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
                href="/movies"
                className="text-white/90 hover:text-white transition-colors duration-200 font-heading font-semibold py-3 text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Movies
              </Link>
              <Link
                href="/anime"
                className="text-white/90 hover:text-white transition-colors duration-200 font-heading font-semibold py-3 text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Anime
              </Link>
              <Link
                href="/kdrama"
                className="text-white/90 hover:text-white transition-colors duration-200 font-heading font-semibold py-3 text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                K-Drama
              </Link>
              <Link
                href="/games"
                className="text-white/90 hover:text-white transition-colors duration-200 font-heading font-semibold py-3 text-lg"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Games
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
