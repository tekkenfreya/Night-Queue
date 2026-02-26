'use client';

import Link from 'next/link';

export default function KDramaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900 text-white">
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-heading text-6xl md:text-8xl font-black mb-4 tracking-wide">
            <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              NextPick
            </span>
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-purple-400">K-Drama</h2>
          <p className="text-xl text-gray-300">Korean Entertainment Universe</p>
        </div>

        {/* Coming Soon Content */}
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-black/50 rounded-2xl p-12 border border-purple-500/20">
            <div className="text-8xl mb-8">🌸</div>
            <h3 className="text-4xl font-bold mb-6 text-purple-400">Coming Soon</h3>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Immerse yourself in the world of Korean entertainment. Discover K-dramas, Korean movies, 
              and cultural content. Experience the Korean Wave (Hallyu) like never before.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-purple-900/30 p-6 rounded-xl border border-purple-500/20">
                <h4 className="text-lg font-semibold mb-2 text-purple-300">K-Drama Series</h4>
                <p className="text-sm text-gray-400">Romance, thriller, historical, and modern dramas</p>
              </div>
              <div className="bg-purple-900/30 p-6 rounded-xl border border-purple-500/20">
                <h4 className="text-lg font-semibold mb-2 text-purple-300">Korean Movies</h4>
                <p className="text-sm text-gray-400">Acclaimed Korean cinema and indie films</p>
              </div>
              <div className="bg-purple-900/30 p-6 rounded-xl border border-purple-500/20">
                <h4 className="text-lg font-semibold mb-2 text-purple-300">Cultural Content</h4>
                <p className="text-sm text-gray-400">K-pop, variety shows, and cultural insights</p>
              </div>
            </div>

            <Link
              href="/movies"
              className="inline-flex items-center px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
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