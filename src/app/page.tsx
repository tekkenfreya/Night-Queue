'use client';

import Link from 'next/link';
import { useAppSelector } from '@/lib/hooks';

export default function Home() {
  const { isAuthenticated } = useAppSelector(state => state.user);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Video/Image Placeholder */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70">
          <div className="absolute inset-0 bg-[url('/hero-bg.jpg')] bg-cover bg-center opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-netflix-dark via-transparent to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-4xl px-4">
          <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Your Personal
            <span className="block text-netflix-red">Movie Universe</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
            Discover, track, and organize your favorite films. Join millions of movie lovers in building the ultimate watchlist.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!isAuthenticated ? (
              <>
                <Link 
                  href="/login"
                  className="bg-netflix-red hover:bg-netflix-red/90 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-2xl"
                >
                  Get Started Free
                </Link>
                <Link 
                  href="/search"
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 border border-white/30"
                >
                  Browse Movies
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/search"
                  className="bg-netflix-red hover:bg-netflix-red/90 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-2xl"
                >
                  Discover Movies
                </Link>
                <Link 
                  href="/watchlist"
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 border border-white/30"
                >
                  My Watchlist
                </Link>
              </>
            )}
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-12">
            {['Personal Ratings', 'Custom Lists', 'Movie Discovery', 'Track Progress'].map((feature) => (
              <div key={feature} className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-300 border border-white/20">
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-netflix-dark">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to
              <span className="text-netflix-red"> Track Movies</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful tools to organize, discover, and enjoy your movie collection like never before.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-netflix-gray/50 p-8 rounded-2xl backdrop-blur-sm border border-white/10 hover:border-netflix-red/50 transition-all duration-300">
              <div className="w-16 h-16 bg-netflix-red/20 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-netflix-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Smart Discovery</h3>
              <p className="text-gray-400 leading-relaxed">
                Find your next favorite movie with intelligent recommendations based on your taste and viewing history.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-netflix-gray/50 p-8 rounded-2xl backdrop-blur-sm border border-white/10 hover:border-netflix-red/50 transition-all duration-300">
              <div className="w-16 h-16 bg-netflix-red/20 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-netflix-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Personal Lists</h3>
              <p className="text-gray-400 leading-relaxed">
                Organize movies into custom lists - want to watch, favorites, by genre, or any way you like.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-netflix-gray/50 p-8 rounded-2xl backdrop-blur-sm border border-white/10 hover:border-netflix-red/50 transition-all duration-300">
              <div className="w-16 h-16 bg-netflix-red/20 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-netflix-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">Rate & Review</h3>
              <p className="text-gray-400 leading-relaxed">
                Keep track of what you've watched with personal ratings, notes, and reviews to remember every detail.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-netflix-red/10 to-purple-900/10">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Start Your
            <span className="text-netflix-red"> Movie Journey?</span>
          </h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of movie lovers who've already discovered their perfect way to track and discover films.
          </p>
          {!isAuthenticated ? (
            <Link 
              href="/login"
              className="bg-netflix-red hover:bg-netflix-red/90 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-2xl inline-block"
            >
              Start Free Today
            </Link>
          ) : (
            <Link 
              href="/search"
              className="bg-netflix-red hover:bg-netflix-red/90 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-2xl inline-block"
            >
              Explore Movies Now
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}