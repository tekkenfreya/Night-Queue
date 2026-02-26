'use client';

import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { WatchlistItem } from '@/types';
import { removeFromWatchlistDB, updateWatchlistItemDB } from '@/lib/slices/watchlistSlice';
import { tmdbService } from '@/services/tmdb';
import { MovieModal } from '@/components/movies/MovieModal';
import Link from 'next/link';

interface MovieRowProps {
  title: string;
  movies: WatchlistItem[];
}

function MovieRow({ title, movies }: MovieRowProps) {
  const dispatch = useAppDispatch();
  const { currentUser } = useAppSelector(state => state.user);
  const [selectedMovie, setSelectedMovie] = useState<WatchlistItem | null>(null);

  const handleRemoveFromWatchlist = async (item: WatchlistItem) => {
    if (!currentUser) return;
    
    try {
      await dispatch(removeFromWatchlistDB({
        userId: currentUser.id,
        itemId: item.id,
        movieId: item.movieId
      })).unwrap();
    } catch (error) {
      console.error('Failed to remove from watchlist:', error);
    }
  };

  const handleMarkAsWatched = async (item: WatchlistItem) => {
    if (!currentUser || item.status === 'watched') return;
    
    try {
      await dispatch(updateWatchlistItemDB({
        userId: currentUser.id,
        itemId: item.id,
        updates: {
          status: 'watched' as const,
          dateWatched: new Date().toISOString()
        }
      })).unwrap();
    } catch (error) {
      console.error('Failed to mark as watched:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    }
  };

  const scrollLeft = () => {
    const container = document.getElementById(`row-${title.replace(/\s+/g, '-')}`);
    if (container) {
      container.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.getElementById(`row-${title.replace(/\s+/g, '-')}`);
    if (container) {
      container.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-12">
      <h2 className="font-heading text-2xl font-black text-white mb-6 px-4 md:px-12 tracking-wide uppercase">{title}</h2>
      <div className="relative group">
        <button 
          onClick={scrollLeft}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <div 
          id={`row-${title.replace(/\s+/g, '-')}`}
          className="flex overflow-x-scroll scrollbar-hide space-x-6 px-4 md:px-12"
        >
          {movies.map((item, index) => (
            <div 
              key={`${item.id}-${index}`} 
              className="flex-none w-48 group"
            >
              <div className="relative">
                <div 
                  className="cursor-pointer hover:scale-105 transition-transform duration-300 ease-out"
                  onClick={() => setSelectedMovie(item)}
                >
                  <img
                    src={item.movie.poster_path ? tmdbService.getImageUrl(item.movie.poster_path, 'w342') : '/placeholder.jpg'}
                    alt={item.movie.title}
                    className="w-full h-72 object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                  />
                  <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1 flex items-center space-x-1 group-hover:bg-black/90 transition-all duration-300">
                    <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span className="text-white text-xs font-medium">{item.movie.vote_average?.toFixed(1) || 'N/A'}</span>
                  </div>
                  
                </div>
                
                {/* Fixed Action Buttons */}
                <div className="mt-3 space-y-2">
                  {item.status !== 'watched' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsWatched(item);
                      }}
                      className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium transition-colors duration-200 text-white"
                    >
                      Mark as Watched
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFromWatchlist(item);
                    }}
                    className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors duration-200 text-white"
                  >
                    Remove from List
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          onClick={scrollRight}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {selectedMovie ? (
        <MovieModal 
          movie={selectedMovie.movie}
          isOpen={true}
          onClose={() => setSelectedMovie(null)}
        />
      ) : null}
    </div>
  );
}

export default function WatchlistPage() {
  const watchlistItems = useAppSelector(state => state.watchlist.items);

  const wantToWatchMovies = watchlistItems.filter(item => item.status === 'want_to_watch');
  const watchedMovies = watchlistItems.filter(item => item.status === 'watched');
  const watchLaterMovies = watchlistItems.filter(item => item.status === 'watch_later');

  const hasAnyMovies = watchlistItems.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900/50 via-black to-black text-white relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>
      {/* Header */}
      <div className="relative z-10 px-4 md:px-12 pt-8 pb-6">
        <h1 className="font-heading text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">My List</h1>
        <p className="text-gray-400 text-lg">Your personal movie collection</p>
      </div>

      {!hasAnyMovies ? (
        <div className="relative z-10 text-center py-20">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="font-heading text-2xl font-semibold text-white mb-2">Your list is empty</h3>
          <p className="text-gray-400 text-lg mb-6">
            Start building your collection by searching for movies and adding them to your list.
          </p>
          <Link
            href="/search"
            className="bg-netflix-red px-8 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 inline-block font-medium"
          >
            Search Movies
          </Link>
        </div>
      ) : (
        <div className="relative z-10 pb-20">
          {wantToWatchMovies.length > 0 && (
            <MovieRow title="Want to Watch" movies={wantToWatchMovies} />
          )}
          {watchedMovies.length > 0 && (
            <MovieRow title="Watched" movies={watchedMovies} />
          )}
          {watchLaterMovies.length > 0 && (
            <MovieRow title="Watch Later" movies={watchLaterMovies} />
          )}
        </div>
      )}
    </div>
  );
}