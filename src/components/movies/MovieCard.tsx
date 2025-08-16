'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Movie } from '@/types';
import { tmdbService } from '@/services/tmdb';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addToWatchlist, removeFromWatchlist } from '@/lib/slices/watchlistSlice';

interface MovieCardProps {
  movie: Movie;
  showFullDetails?: boolean;
}

export function MovieCard({ movie, showFullDetails = false }: MovieCardProps) {
  const dispatch = useAppDispatch();
  const watchlistItems = useAppSelector(state => state.watchlist.items);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const isInWatchlist = watchlistItems.some(item => item.movieId === movie.id);
  
  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isInWatchlist) {
      dispatch(removeFromWatchlist(movie.id));
    } else {
      dispatch(addToWatchlist({ movie, status: 'want_to_watch' }));
    }
  };

  const getReleaseYear = () => {
    return movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  };

  const getRating = () => {
    return movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  };

  if (showFullDetails || isExpanded) {
    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-scaleIn">
        <div className="md:flex">
          <div className="md:w-1/3">
            <div className="relative aspect-[2/3]">
              <Image
                src={tmdbService.getImageUrl(movie.poster_path)}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>
          
          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">{movie.title}</h2>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-300">
              <span className="bg-yellow-600 px-2 py-1 rounded">⭐ {getRating()}</span>
              <span>{getReleaseYear()}</span>
              <span>{movie.vote_count} votes</span>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed">
              {movie.overview || 'No synopsis available.'}
            </p>
            
            <button
              onClick={handleWatchlistToggle}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                isInWatchlist
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-netflix-red hover:bg-red-700 text-white'
              }`}
            >
              {isInWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-2xl animate-slideUp"
      onClick={() => setIsExpanded(true)}
    >
      <div className="relative aspect-[2/3]">
        <Image
          src={tmdbService.getImageUrl(movie.poster_path)}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute bottom-4 left-4 right-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleWatchlistToggle}
            className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isInWatchlist
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-netflix-red hover:bg-red-700 text-white'
            }`}
          >
            {isInWatchlist ? '✓ In List' : '+ Add to List'}
          </button>
        </div>
        
        <div className="absolute top-2 right-2">
          <span className="bg-black/70 text-yellow-400 text-xs px-2 py-1 rounded">
            ⭐ {getRating()}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-netflix-red transition-colors">
          {movie.title}
        </h3>
        
        <div className="flex justify-between items-center text-sm text-gray-400">
          <span>{getReleaseYear()}</span>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded">Click for details</span>
        </div>
      </div>
    </div>
  );
}