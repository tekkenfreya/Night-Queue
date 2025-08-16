'use client';

import Image from 'next/image';
import { Movie } from '@/types';
import { tmdbService } from '@/services/tmdb';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addToWatchlist, removeFromWatchlist } from '@/lib/slices/watchlistSlice';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  const dispatch = useAppDispatch();
  const watchlistItems = useAppSelector(state => state.watchlist.items);
  
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

  return (
    <div className="bg-netflix-gray rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer group">
      <div className="relative aspect-[2/3]">
        <Image
          src={tmdbService.getImageUrl(movie.poster_path)}
          alt={movie.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
        />
        
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-opacity flex items-center justify-center">
          <button
            onClick={handleWatchlistToggle}
            className={`opacity-0 group-hover:opacity-100 transition-opacity px-4 py-2 rounded text-sm font-medium ${
              isInWatchlist
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-netflix-red hover:bg-red-700'
            }`}
          >
            {isInWatchlist ? 'In List' : 'Add to List'}
          </button>
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-semibold text-sm mb-1 line-clamp-2">
          {movie.title}
        </h3>
        
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>{getReleaseYear()}</span>
          <span>⭐ {getRating()}</span>
        </div>
      </div>
    </div>
  );
}