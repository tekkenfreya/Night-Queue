'use client';

import Link from 'next/link';

export default function AnimePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-black to-red-900 text-white">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-heading text-6xl md:text-8xl font-black mb-4 tracking-wide">
            <span className="bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
              NextPick
            </span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-orange-400">Anime</h2>
          <p className="text-xl text-gray-300">Japanese Animation Universe</p>
        </div>

        {/* Coming Soon Content */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-black/50 rounded-2xl p-12 border border-orange-500/20">
            <div className="text-8xl mb-8">⚡</div>
            <h3 className="text-4xl font-bold mb-6 text-orange-400">Coming Soon</h3>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Dive into the vibrant world of anime. Discover series, movies, OVAs, and manga adaptations. 
              From shounen adventures to slice-of-life stories, find your next anime obsession.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-orange-900/30 p-6 rounded-xl border border-orange-500/20">
                <h4 className="text-lg font-semibold mb-2 text-orange-300">Anime Series</h4>
                <p className="text-sm text-gray-400">Seasonal anime, ongoing series, and classics</p>
              </div>
              <div className="bg-orange-900/30 p-6 rounded-xl border border-orange-500/20">
                <h4 className="text-lg font-semibold mb-2 text-orange-300">Anime Movies</h4>
                <p className="text-sm text-gray-400">Studio Ghibli, theatrical releases, and OVAs</p>
              </div>
              <div className="bg-orange-900/30 p-6 rounded-xl border border-orange-500/20">
                <h4 className="text-lg font-semibold mb-2 text-orange-300">Manga & More</h4>
                <p className="text-sm text-gray-400">Manga recommendations and anime culture</p>
              </div>
            </div>

            <Link
              href="/movies"
              className="inline-flex items-center px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Movies
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}