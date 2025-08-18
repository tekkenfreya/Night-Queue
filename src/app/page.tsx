'use client';

import { useState, useEffect } from 'react';
import { Movie } from '@/types';
import { tmdbService } from '@/services/tmdb';
import { useAppSelector, useAppDispatch } from '@/lib/hooks';
import { addToWatchlist, removeFromWatchlist, addToWatchlistDB } from '@/lib/slices/watchlistSlice';
import { MovieModal } from '@/components/movies/MovieModal';

interface MovieRowProps {
  title: string;
  movies: Movie[];
}

function MovieRow({ title, movies }: MovieRowProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, currentUser } = useAppSelector(state => state.user);
  const { items: watchlistItems } = useAppSelector(state => state.watchlist);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

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
              onClick={() => setSelectedMovie(movie)}
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
          movie={selectedMovie}
          isOpen={true}
          onClose={() => setSelectedMovie(null)}
        />
      ) : null}
    </div>
  );
}

export default function Home() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, currentUser } = useAppSelector(state => state.user);
  const { items: watchlistItems } = useAppSelector(state => state.watchlist);
  const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [heroTrailerKey, setHeroTrailerKey] = useState<string | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerReady, setTrailerReady] = useState(false);
  const [iframeRef, setIframeRef] = useState<HTMLIFrameElement | null>(null);
  const [isMuted, setIsMuted] = useState(false); // Start unmuted
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [isVideoVisible, setIsVideoVisible] = useState(true);
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

        // Load trailer for featured movie
        if (randomMovie) {
          try {
            const videosResponse = await tmdbService.getMovieVideos(randomMovie.id);
            const youtubeVideos = videosResponse.results.filter((video: any) => video.site === 'YouTube');
            
            // Priority order for trailer selection (same as modal)
            const findTrailer = () => {
              let trailer = youtubeVideos.find((video: any) => 
                video.type === 'Trailer' && 
                (video.name.toLowerCase().includes('official') || 
                 video.name.toLowerCase().includes('main'))
              );
              
              if (!trailer) {
                trailer = youtubeVideos.find((video: any) => video.type === 'Trailer');
              }
              
              if (!trailer) {
                trailer = youtubeVideos.find((video: any) => video.type === 'Teaser');
              }
              
              if (!trailer) {
                trailer = youtubeVideos.find((video: any) => 
                  video.name.toLowerCase().includes('trailer')
                );
              }
              
              return trailer;
            };
            
            const selectedTrailer = findTrailer();
            if (selectedTrailer?.key) {
              setHeroTrailerKey(selectedTrailer.key);
              
              // Create iframe with reliable autoplay (muted)
              const iframe = document.createElement('iframe');
              iframe.src = `https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${selectedTrailer.key}&modestbranding=1&iv_load_policy=3&fs=0&disablekb=1&enablejsapi=1&origin=${window.location.origin}&start=0`;
              iframe.style.position = 'absolute';
              iframe.style.left = '-9999px';
              iframe.style.width = '100%';
              iframe.style.height = '100%';
              iframe.style.border = 'none';
              iframe.allow = 'autoplay; encrypted-media';
              iframe.loading = 'eager';
              
              let loadTimeout: NodeJS.Timeout;
              
              const handleLoad = () => {
                clearTimeout(loadTimeout);
                setIframeRef(iframe);
                setTrailerReady(true);
                setShowTrailer(true);
                setIsMuted(true);
                setAutoplayBlocked(true); // Show mute control
              };
              
              iframe.onload = handleLoad;
              
              // Fallback timeout
              loadTimeout = setTimeout(() => {
                handleLoad();
              }, 3000);
              
              document.body.appendChild(iframe);
            } else {
              setTrailerReady(true); // No trailer available, proceed anyway
            }
          } catch (error) {
            console.error('Error fetching hero trailer:', error);
            setTrailerReady(true); // Proceed without trailer if error
          }
        } else {
          setTrailerReady(true); // No featured movie, proceed anyway
        }

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
        setTrailerReady(true); // Proceed if error
      }
      // Don't set isLoading to false here - wait for trailer ready
    };

    loadMovies();
  }, []);

  // Set loading to false when trailer is ready
  useEffect(() => {
    if (trailerReady) {
      setIsLoading(false);
    }
  }, [trailerReady]);

  // Scroll detection to pause video when out of view
  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector('.hero-section');
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;
        
        if (isVisible !== isVideoVisible) {
          setIsVideoVisible(isVisible);
          
          // Pause/resume video based on visibility
          if (iframeRef) {
            if (isVisible) {
              // Resume video by reloading with autoplay
              const currentSrc = iframeRef.src;
              if (currentSrc && !currentSrc.includes('autoplay=1')) {
                const newSrc = currentSrc.replace('autoplay=0', 'autoplay=1');
                iframeRef.src = newSrc;
              }
            } else {
              // Pause video by removing autoplay
              const currentSrc = iframeRef.src;
              if (currentSrc && currentSrc.includes('autoplay=1')) {
                const newSrc = currentSrc.replace('autoplay=1', 'autoplay=0');
                iframeRef.src = newSrc;
              }
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [iframeRef, isVideoVisible]);

  const isInWatchlist = (movieId: number) => {
    return watchlistItems.some(item => item.movieId === movieId);
  };

  const handleHeroWatchlistToggle = async () => {
    if (!featuredMovie || !isAuthenticated || !currentUser) return;

    if (isInWatchlist(featuredMovie.id)) {
      dispatch(removeFromWatchlist(featuredMovie.id));
    } else {
      dispatch(addToWatchlist({ movie: featuredMovie, status: 'want_to_watch' }));
      try {
        await dispatch(addToWatchlistDB({ 
          userId: currentUser.id, 
          movie: featuredMovie, 
          status: 'want_to_watch' 
        })).unwrap();
      } catch (error) {
        console.error('Failed to sync with database:', error);
      }
    }
  };

  const toggleMute = () => {
    if (iframeRef && heroTrailerKey) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);
      
      // Update iframe src with new mute parameter
      const currentSrc = iframeRef.src;
      const newSrc = currentSrc.replace(
        newMutedState ? /mute=0/ : /mute=1/, 
        newMutedState ? 'mute=1' : 'mute=0'
      );
      iframeRef.src = newSrc;
    }
  };

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
        <div className="hero-section relative h-screen overflow-hidden">
          {/* Background - Always show trailer if available, fallback to image */}
          {iframeRef ? (
            <div className="absolute inset-0">
              <div 
                ref={(container) => {
                  if (container && iframeRef && !container.contains(iframeRef)) {
                    // Move preloaded iframe to visible container
                    iframeRef.style.position = 'absolute';
                    iframeRef.style.left = '0';
                    iframeRef.style.top = '0';
                    iframeRef.style.width = '100%';
                    iframeRef.style.height = '100%';
                    iframeRef.style.transform = 'scale(1.2)';
                    iframeRef.style.transformOrigin = 'center';
                    iframeRef.style.pointerEvents = 'none';
                    container.appendChild(iframeRef);
                  }
                }}
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              
              {/* Mute/Unmute button */}
              {iframeRef ? (
                <button 
                  onClick={toggleMute}
                  className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  )}
                </button>
              ) : null}
            </div>
          ) : (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${tmdbService.getImageUrl(featuredMovie.backdrop_path, 'original')})`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>
          )}

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
              <button 
                onClick={() => setHeroModalOpen(true)}
                className="bg-white text-black px-8 py-3 rounded-md font-bold hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                <span>Play</span>
              </button>
              {isAuthenticated ? (
                <button 
                  onClick={handleHeroWatchlistToggle}
                  className={`px-8 py-3 rounded-md font-bold transition-colors flex items-center space-x-2 ${
                    featuredMovie && isInWatchlist(featuredMovie.id)
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-600/80 hover:bg-gray-600 text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>{featuredMovie && isInWatchlist(featuredMovie.id) ? '✓ In List' : 'Add to List'}</span>
                </button>
              ) : (
                <button className="bg-gray-600/80 text-white px-8 py-3 rounded-md font-bold hover:bg-gray-600 transition-colors flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Sign in to Add</span>
                </button>
              )}
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

      {/* Hero Movie Modal */}
      {featuredMovie && heroModalOpen ? (
        <MovieModal 
          movie={featuredMovie}
          isOpen={heroModalOpen}
          onClose={() => setHeroModalOpen(false)}
        />
      ) : null}
    </div>
  );
}