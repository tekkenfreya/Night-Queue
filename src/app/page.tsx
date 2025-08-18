'use client';

import { useState, useEffect } from 'react';
import { Movie } from '@/types';
import { tmdbService } from '@/services/tmdb';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { addToWatchlist, removeFromWatchlist, addToWatchlistDB } from '@/lib/slices/watchlistSlice';

interface MovieRowProps {
  title: string;
  movies: Movie[];
}

function MovieRow({ title, movies }: MovieRowProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, currentUser } = useAppSelector(state => state.user);
  const { items: watchlistItems } = useAppSelector(state => state.watchlist);

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

  const isInWatchlist = (movieId: number) => {
    return watchlistItems.some(item => item.movieId === movieId);
  };

  const handleWatchlistToggle = async (movie: Movie) => {
    if (!isAuthenticated || !currentUser) return;

    if (isInWatchlist(movie.id)) {
      dispatch(removeFromWatchlist(movie.id));
    } else {
      dispatch(addToWatchlist({ movie, status: 'want_to_watch' }));
      // Also sync with database if user is authenticated
      try {
        await dispatch(addToWatchlistDB({ 
          userId: currentUser.id, 
          movie, 
          status: 'want_to_watch' 
        })).unwrap();
      } catch (error) {
        console.error('Failed to sync with database:', error);
      }
    }
  };

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6 px-4 md:px-12">{title}</h2>
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
          {movies.map((movie) => (
            <div 
              key={movie.id} 
              className="flex-none w-48 hover:scale-105 transition-transform duration-300 cursor-pointer group"
            >
              <div className="relative">
                <img
                  src={tmdbService.getImageUrl(movie.poster_path, 'w342')}
                  alt={movie.title}
                  className="w-full h-72 object-cover rounded-lg shadow-lg"
                />
                <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1 flex items-center space-x-1">
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span className="text-white text-xs font-medium">{movie.vote_average.toFixed(1)}</span>
                </div>
                
                {/* Watchlist button overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {isAuthenticated ? (
                  <div className="absolute top-1/2 left-2 right-2 transform -translate-y-1/2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWatchlistToggle(movie);
                      }}
                      className={`w-full py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isInWatchlist(movie.id)
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-netflix-red hover:bg-red-700 text-white'
                      }`}
                    >
                      {isInWatchlist(movie.id) ? '✓ In List' : '+ Add to List'}
                    </button>
                  </div>
                ) : null}
              </div>
              <h3 className="text-white text-sm mt-2 truncate">{movie.title}</h3>
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
    </div>
  );
}

export default function Home() {
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [movieCategories, setMovieCategories] = useState({
    trending: [] as Movie[],
    topRated: [] as Movie[],
    action: [] as Movie[],
    horror: [] as Movie[],
    comedy: [] as Movie[],
    drama: [] as Movie[],
    sciFi: [] as Movie[],
    thriller: [] as Movie[]
  });

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoading(true);
        
        // Load featured movie (random from popular)
        const popularResponse = await tmdbService.getPopularMovies();
        const randomMovie = popularResponse.results[Math.floor(Math.random() * popularResponse.results.length)];
        setFeaturedMovie(randomMovie);

        // Load movie categories
        const [
          trendingResponse,
          topRatedResponse,
          actionResponse,
          horrorResponse,
          comedyResponse,
          dramaResponse,
          sciFiResponse,
          thrillerResponse
        ] = await Promise.all([
          tmdbService.getTrendingMovies(),
          tmdbService.getTopRatedMovies(),
          tmdbService.discoverMovies({ genre: 28 }), // Action
          tmdbService.discoverMovies({ genre: 27 }), // Horror
          tmdbService.discoverMovies({ genre: 35 }), // Comedy
          tmdbService.discoverMovies({ genre: 18 }), // Drama
          tmdbService.discoverMovies({ genre: 878 }), // Sci-Fi
          tmdbService.discoverMovies({ genre: 53 })  // Thriller
        ]);

        setMovieCategories({
          trending: trendingResponse.results.slice(0, 20),
          topRated: topRatedResponse.results.slice(0, 20),
          action: actionResponse.results.slice(0, 20),
          horror: horrorResponse.results.slice(0, 20),
          comedy: comedyResponse.results.slice(0, 20),
          drama: dramaResponse.results.slice(0, 20),
          sciFi: sciFiResponse.results.slice(0, 20),
          thriller: thrillerResponse.results.slice(0, 20)
        });
      } catch (error) {
        console.error('Error loading movies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovies();
  }, []);

  // Show loading screen until all data is loaded
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-netflix-red mx-auto mb-4"></div>
          <div className="text-xl font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Featured Movie Hero Section */}
      {featuredMovie ? (
        <div className="relative h-screen overflow-hidden">
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${tmdbService.getImageUrl(featuredMovie.backdrop_path, 'original')})`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          </div>

          {/* Hero Content */}
          <div className="absolute bottom-32 left-4 md:left-12 z-10 max-w-xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">{featuredMovie.title}</h1>
            <p className="text-lg md:text-xl mb-6 line-clamp-3">{featuredMovie.overview}</p>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                <span className="text-white font-semibold">{featuredMovie.vote_average.toFixed(1)}</span>
              </div>
              <span className="text-gray-300">{new Date(featuredMovie.release_date).getFullYear()}</span>
            </div>

            <div className="flex space-x-4">
              <button className="bg-white text-black px-8 py-3 rounded-md font-bold hover:bg-gray-200 transition-colors flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>Play</span>
              </button>
              <button className="bg-gray-600/80 text-white px-8 py-3 rounded-md font-bold hover:bg-gray-600 transition-colors flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>More Info</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      )}

      {/* Movie Rows */}
      <div className="relative z-10 -mt-16 pb-20">
        <MovieRow title="Trending Now" movies={movieCategories.trending} />
        <MovieRow title="Top Rated Movies" movies={movieCategories.topRated} />
        <MovieRow title="Action & Adventure" movies={movieCategories.action} />
        <MovieRow title="Horror Movies" movies={movieCategories.horror} />
        <MovieRow title="Comedy Movies" movies={movieCategories.comedy} />
        <MovieRow title="Drama Movies" movies={movieCategories.drama} />
        <MovieRow title="Sci-Fi Movies" movies={movieCategories.sciFi} />
        <MovieRow title="Thriller Movies" movies={movieCategories.thriller} />
      </div>
    </div>
  );
}