'use client';

import { useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { WatchlistItem } from '@/types';

export default function WatchlistPage() {
  const watchlistItems = useAppSelector(state => state.watchlist.items);
  const [activeTab, setActiveTab] = useState<WatchlistItem['status']>('want_to_watch');

  const filteredItems = watchlistItems.filter(item => item.status === activeTab);

  const getTabCounts = () => {
    return {
      want_to_watch: watchlistItems.filter(item => item.status === 'want_to_watch').length,
      watched: watchlistItems.filter(item => item.status === 'watched').length,
      watch_later: watchlistItems.filter(item => item.status === 'watch_later').length,
    };
  };

  const tabCounts = getTabCounts();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Watchlist</h1>
        <p className="text-gray-400">
          Manage your personal movie collection
        </p>
      </div>

      <div className="flex space-x-8 border-b border-netflix-gray mb-8">
        {[
          { key: 'want_to_watch' as const, label: 'Want to Watch', count: tabCounts.want_to_watch },
          { key: 'watched' as const, label: 'Watched', count: tabCounts.watched },
          { key: 'watch_later' as const, label: 'Watch Later', count: tabCounts.watch_later },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-4 px-2 border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-netflix-red text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      <div className="mt-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-semibold mb-2">
              {activeTab === 'want_to_watch' && "No movies in your 'Want to Watch' list"}
              {activeTab === 'watched' && "No watched movies yet"}
              {activeTab === 'watch_later' && "No movies in your 'Watch Later' list"}
            </h3>
            <p className="text-gray-400 mb-6">
              Start building your collection by searching for movies and adding them to your list.
            </p>
            <a
              href="/search"
              className="bg-netflix-red px-6 py-3 rounded-lg hover:bg-red-700 transition-colors inline-block"
            >
              Search Movies
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-netflix-gray rounded-lg overflow-hidden">
                <div className="relative aspect-[2/3]">
                  <img
                    src={item.movie.poster_path ? `https://image.tmdb.org/t/p/w500${item.movie.poster_path}` : '/placeholder.jpg'}
                    alt={item.movie.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                    {item.movie.title}
                  </h3>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>Added: {new Date(item.dateAdded).toLocaleDateString()}</div>
                    {item.personalRating && (
                      <div>★ {item.personalRating}/5</div>
                    )}
                    {item.notes && (
                      <div className="line-clamp-2">{item.notes}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}