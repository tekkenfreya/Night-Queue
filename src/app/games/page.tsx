'use client';

import Link from 'next/link';

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-black to-emerald-900 text-white">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-heading text-6xl md:text-8xl font-black mb-4 tracking-wide">
            <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
              NextPick
            </span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-green-400">Games</h2>
          <p className="text-xl text-gray-300">Interactive Entertainment Universe</p>
        </div>

        {/* Coming Soon Content */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-black/50 rounded-2xl p-12 border border-green-500/20">
            <div className="text-8xl mb-8">🎮</div>
            <h3 className="text-4xl font-bold mb-6 text-green-400">Coming Soon</h3>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              We're building the ultimate gaming discovery platform. Explore the latest games, 
              read reviews, connect with the gaming community, and discover your next favorite game.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-900/30 p-6 rounded-xl border border-green-500/20">
                <h4 className="text-lg font-semibold mb-2 text-green-300">Game Discovery</h4>
                <p className="text-sm text-gray-400">Find games by genre, platform, and ratings</p>
              </div>
              <div className="bg-green-900/30 p-6 rounded-xl border border-green-500/20">
                <h4 className="text-lg font-semibold mb-2 text-green-300">Reviews & Ratings</h4>
                <p className="text-sm text-gray-400">Community-driven game reviews and scores</p>
              </div>
              <div className="bg-green-900/30 p-6 rounded-xl border border-green-500/20">
                <h4 className="text-lg font-semibold mb-2 text-green-300">Gaming Lists</h4>
                <p className="text-sm text-gray-400">Create and manage your gaming wishlist</p>
              </div>
            </div>

            <Link
              href="/movies"
              className="inline-flex items-center px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
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