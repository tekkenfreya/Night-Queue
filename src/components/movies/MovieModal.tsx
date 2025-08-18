'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Movie } from '@/types';
import { tmdbService } from '@/services/tmdb';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { addToWatchlist, removeFromWatchlist } from '@/lib/slices/watchlistSlice';

interface MovieModalProps {
  movie: Movie;
  isOpen: boolean;
  onClose: () => void;
}

interface MovieVideo {
  id: string;
  key: string;
  name: string;
  type: string;
  site: string;
}

export function MovieModal({ movie, isOpen, onClose }: MovieModalProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.user);
  const watchlistItems = useAppSelector(state => state.watchlist.items);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);
  
  const isInWatchlist = watchlistItems.some(item => item.movieId === movie.id);

  useEffect(() => {
    if (isOpen && movie.id) {
      setIsLoadingTrailer(true);
      tmdbService.getMovieVideos(movie.id)
        .then(response => {
          // Filter YouTube videos first
          const youtubeVideos = response.results.filter((video: MovieVideo) => video.site === 'YouTube');
          
          // Priority order for trailer selection
          const findTrailer = () => {
            // 1. Official Trailer (highest priority)
            let trailer = youtubeVideos.find((video: MovieVideo) => 
              video.type === 'Trailer' && 
              (video.name.toLowerCase().includes('official') || 
               video.name.toLowerCase().includes('main'))
            );
            
            // 2. Any Trailer
            if (!trailer) {
              trailer = youtubeVideos.find((video: MovieVideo) => video.type === 'Trailer');
            }
            
            // 3. Teaser as fallback
            if (!trailer) {
              trailer = youtubeVideos.find((video: MovieVideo) => video.type === 'Teaser');
            }
            
            // 4. Any video with "trailer" in the name
            if (!trailer) {
              trailer = youtubeVideos.find((video: MovieVideo) => 
                video.name.toLowerCase().includes('trailer')
              );
            }
            
            return trailer;
          };
          
          const selectedTrailer = findTrailer();
          setTrailerKey(selectedTrailer?.key || null);
        })
        .catch(error => {
          console.error('Error fetching trailer:', error);
          setTrailerKey(null);
        })
        .finally(() => {
          setIsLoadingTrailer(false);
        });
    }
  }, [isOpen, movie.id]);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      return; // Do nothing if not authenticated
    }
    
    if (isInWatchlist) {
      dispatch(removeFromWatchlist(movie.id));
    } else {
      dispatch(addToWatchlist({ movie, status: 'want_to_watch' }));
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getReleaseYear = () => {
    return movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  };

  const getRating = () => {
    return movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-8"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-lg w-[90vw] max-w-5xl h-[80vh] flex flex-col shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Trailer Section - Fixed height */}
        <div className="relative h-[45vh] bg-black rounded-t-lg overflow-hidden">
            {isLoadingTrailer ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-netflix-red"></div>
              </div>
            ) : trailerKey ? (
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=1&rel=0`}
                title={`${movie.title} Trailer`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; encrypted-media"
              />
            ) : (
              <div 
                className="w-full h-full bg-cover bg-center relative"
                style={{
                  backgroundImage: `url(${tmdbService.getImageUrl(movie.backdrop_path, 'w1280')})`
                }}
              >
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="text-center text-white">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg">No trailer available</p>
                  </div>
                </div>
              </div>
            )}
          </div>

        {/* Content Section - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex gap-6">
            {/* Poster */}
            <div className="flex-shrink-0">
              <div className="relative w-32 aspect-[2/3] rounded-lg overflow-hidden">
                <Image
                  src={tmdbService.getImageUrl(movie.poster_path)}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
            </div>

            {/* Details */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-3">{movie.title}</h2>
              
              <div className="flex items-center gap-4 mb-4 text-sm">
                <span className="bg-yellow-600 px-3 py-1 rounded-full text-white font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  {getRating()}
                </span>
                <span className="text-gray-300">{getReleaseYear()}</span>
                <span className="text-gray-400">{movie.vote_count} votes</span>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Synopsis</h3>
                <p className="text-gray-300 leading-relaxed text-sm">
                  {movie.overview || 'No synopsis available for this movie.'}
                </p>
              </div>

              <button
                onClick={handleWatchlistToggle}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  !isAuthenticated
                    ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                    : isInWatchlist
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-netflix-red hover:bg-red-700 text-white'
                }`}
                disabled={!isAuthenticated}
              >
                {!isAuthenticated 
                  ? 'Sign in to Add' 
                  : isInWatchlist 
                  ? '✓ In Watchlist' 
                  : '+ Add to Watchlist'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}