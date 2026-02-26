'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Movie } from '@/types';
import { tmdbService } from '@/services/tmdb';
import { MovieModal } from '@/components/movies/MovieModal';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  onModalStateChange?: (rowTitle: string, isOpen: boolean) => void;
}

function MovieRow({ title, movies, onModalStateChange }: MovieRowProps) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  // Notify parent when modal state changes
  useEffect(() => {
    if (onModalStateChange) {
      onModalStateChange(title, !!selectedMovie);
    }
  }, [selectedMovie]); // Remove onModalStateChange and title from deps

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
          {movies.map((movie, index) => (
            <div
              key={`${movie.id}-${index}`}
              className="flex-none w-48 hover:scale-105 transition-transform duration-300 cursor-pointer group"
              onClick={() => setSelectedMovie(movie)}
            >
              <div className="relative h-72">
                <Image
                  src={tmdbService.getImageUrl(movie.poster_path, 'w342')}
                  alt={movie.title}
                  fill
                  className="object-cover rounded-lg shadow-lg"
                  sizes="192px"
                />
                <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1 flex items-center space-x-1">
                  <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span className="text-white text-xs font-medium">{movie.vote_average.toFixed(1)}</span>
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
          movie={selectedMovie}
          isOpen={true}
          onClose={() => setSelectedMovie(null)}
        />
      ) : null}
    </div>
  );
}

export default function Home() {
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
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);
  const [modalStates, setModalStates] = useState<{[key: string]: boolean}>({});
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
            interface TMDbVideo {
              key: string;
              site: string;
              type: string;
              name: string;
            }

            const videosResponse = await tmdbService.getMovieVideos(randomMovie.id);
            const youtubeVideos = videosResponse.results.filter((video: TMDbVideo) => video.site === 'YouTube');

            // Priority order for trailer selection (same as modal)
            const findTrailer = () => {
              let trailer = youtubeVideos.find((video: TMDbVideo) =>
                video.type === 'Trailer' &&
                (video.name.toLowerCase().includes('official') ||
                 video.name.toLowerCase().includes('main'))
              );

              if (!trailer) {
                trailer = youtubeVideos.find((video: TMDbVideo) => video.type === 'Trailer');
              }

              if (!trailer) {
                trailer = youtubeVideos.find((video: TMDbVideo) => video.type === 'Teaser');
              }

              if (!trailer) {
                trailer = youtubeVideos.find((video: TMDbVideo) =>
                  video.name.toLowerCase().includes('trailer')
                );
              }

              return trailer;
            };

            const selectedTrailer = findTrailer();
            if (selectedTrailer?.key) {
              setHeroTrailerKey(selectedTrailer.key);

              // Create iframe with improved autoplay for slow connections
              const iframe = document.createElement('iframe');
              iframe.src = `https://www.youtube.com/embed/${selectedTrailer.key}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${selectedTrailer.key}&modestbranding=1&iv_load_policy=3&fs=0&disablekb=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&start=0&preload=auto`;
              iframe.setAttribute('allow', 'autoplay; encrypted-media');
              iframe.setAttribute('allowfullscreen', 'true');
              iframe.style.position = 'absolute';
              iframe.style.left = '0';
              iframe.style.top = '0';
              iframe.style.width = '100%';
              iframe.style.height = '100%';
              iframe.style.border = 'none';
              iframe.style.opacity = '0';
              iframe.allow = 'autoplay; encrypted-media';
              iframe.loading = 'eager';
              iframe.title = `${randomMovie.title} Trailer`;

              let loadTimeout: NodeJS.Timeout;
              let readyTimeout: NodeJS.Timeout;
              let retryCount = 0;
              const maxRetries = 2;

              const handleLoad = () => {
                clearTimeout(loadTimeout);
                clearTimeout(readyTimeout);

                setIframeRef(iframe);
                setIsMuted(true);
                setAutoplayBlocked(true); // Show mute control

                // Give iframe time to start playing before showing
                readyTimeout = setTimeout(() => {
                  setTrailerReady(true);
                  setShowTrailer(true);
                  iframe.style.opacity = '1';
                }, 500);
              };

              const handleError = () => {
                if (retryCount < maxRetries) {
                  retryCount++;
                  setTimeout(() => {
                    iframe.src = iframe.src + `&retry=${retryCount}`;
                  }, 1000);
                } else {
                  // Fallback: proceed without video
                  setTrailerReady(true);
                }
              };

              iframe.onload = handleLoad;
              iframe.onerror = handleError;

              // Extended timeout for slow connections
              loadTimeout = setTimeout(() => {
                if (!trailerReady) {
                  handleLoad();
                }
              }, 8000); // Increased from 3s to 8s

              document.body.appendChild(iframe);
            } else {
              setTrailerReady(true); // No trailer available, proceed anyway
            }
          } catch {
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
      } catch {
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

  // Pause hero video when any modal opens, resume when closed
  useEffect(() => {
    if (iframeRef) {
      if (isAnyModalOpen) {
        // Pause video using YouTube API when modal opens
        try {
          if (iframeRef.contentWindow) {
            iframeRef.contentWindow.postMessage(
              '{"event":"command","func":"pauseVideo","args":""}',
              'https://www.youtube.com'
            );
          }
        } catch (error) {
          // Fallback: mute instead of changing src
          try {
            if (iframeRef.contentWindow) {
              iframeRef.contentWindow.postMessage(
                '{"event":"command","func":"mute","args":""}',
                'https://www.youtube.com'
              );
            }
          } catch (muteError) {
            // mute fallback failed
          }
        }
      } else {
        // Resume video using YouTube API when modal closes
        try {
          if (iframeRef.contentWindow) {
            iframeRef.contentWindow.postMessage(
              '{"event":"command","func":"playVideo","args":""}',
              'https://www.youtube.com'
            );
          }
        } catch (error) {
          // Fallback: unmute if we were using mute fallback
          try {
            if (iframeRef.contentWindow) {
              iframeRef.contentWindow.postMessage(
                '{"event":"command","func":"unMute","args":""}',
                'https://www.youtube.com'
              );
            }
          } catch (unmuteError) {
            // unmute fallback failed
          }
        }
      }
    }
  }, [isAnyModalOpen, iframeRef]);

  // Track hero modal state
  useEffect(() => {
    setModalStates(prev => ({ ...prev, hero: heroModalOpen }));
  }, [heroModalOpen]);

  // Update isAnyModalOpen when any modal state changes
  useEffect(() => {
    const anyModalOpen = Object.values(modalStates).some(isOpen => isOpen);
    setIsAnyModalOpen(anyModalOpen);
  }, [modalStates]);

  // Function to handle modal state changes from MovieRow components
  const handleModalStateChange = useCallback((rowTitle: string, isOpen: boolean) => {
    setModalStates(prev => ({ ...prev, [rowTitle]: isOpen }));
  }, []);

  // Scroll detection to pause video when out of view
  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.querySelector('.hero-section');
      if (heroSection) {
        const rect = heroSection.getBoundingClientRect();
        const isVisible = rect.bottom > 0 && rect.top < window.innerHeight;

        if (isVisible !== isVideoVisible) {
          setIsVideoVisible(isVisible);

          // Pause/resume video based on visibility using YouTube API
          if (iframeRef && !isAnyModalOpen) { // Only control if no modals are open
            if (isVisible) {
              // Resume video when scrolling back into view
              try {
                if (iframeRef.contentWindow) {
                  iframeRef.contentWindow.postMessage(
                    '{"event":"command","func":"playVideo","args":""}',
                    'https://www.youtube.com'
                  );
                }
              } catch (error) {
                // YouTube API play failed on scroll
              }
            } else {
              // Pause video when scrolling out of view
              try {
                if (iframeRef.contentWindow) {
                  iframeRef.contentWindow.postMessage(
                    '{"event":"command","func":"pauseVideo","args":""}',
                    'https://www.youtube.com'
                  );
                }
              } catch (error) {
                // YouTube API pause failed on scroll
              }
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [iframeRef, isVideoVisible]);

  const toggleMute = () => {
    if (iframeRef && heroTrailerKey) {
      const newMutedState = !isMuted;
      setIsMuted(newMutedState);

      // Try using YouTube IFrame API first (smoother)
      try {
        if (iframeRef.contentWindow) {
          const command = newMutedState ? 'mute' : 'unMute';
          iframeRef.contentWindow.postMessage(
            `{"event":"command","func":"${command}","args":""}`,
            'https://www.youtube.com'
          );
          return; // Exit early if API call succeeds
        }
      } catch (error) {
        // YouTube API not available, falling back to src change
      }

      // Fallback: Update iframe src (causes refresh but more reliable)
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
        <div className="hero-section relative overflow-hidden -mt-20 lg:-mt-24" style={{ height: 'calc(100vh + 5rem)', minHeight: 'calc(100vh + 6rem)' }}>
          {/* Background - Always show trailer if available, fallback to image */}
          {iframeRef && showTrailer ? (
            <div className="absolute inset-0 overflow-hidden">
              <div
                ref={(container) => {
                  if (container && iframeRef && !container.contains(iframeRef)) {
                    // Move preloaded iframe to visible container with aggressive scaling
                    iframeRef.style.position = 'absolute';
                    iframeRef.style.left = '50%';
                    iframeRef.style.top = '50%';
                    iframeRef.style.width = '133vw'; // Even more oversized to eliminate all black bars
                    iframeRef.style.height = '75vw'; // 133% of 16:9 aspect ratio
                    iframeRef.style.minHeight = '133vh'; // Oversized height
                    iframeRef.style.minWidth = '236.44vh'; // 133% of 16:9 aspect ratio
                    iframeRef.style.transform = 'translate(-50%, -50%) scale(1.1)'; // Additional scale for safety
                    iframeRef.style.transformOrigin = 'center';
                    iframeRef.style.pointerEvents = 'none';
                    iframeRef.style.filter = 'brightness(0.9)'; // Slightly darken to reduce harsh edges
                    container.appendChild(iframeRef);
                  }
                }}
                className="w-full h-full bg-black"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            </div>
          ) : heroTrailerKey && !showTrailer ? (
            // Show loading state while trailer is loading
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${tmdbService.getImageUrl(featuredMovie.backdrop_path, 'original')})`
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

              {/* Trailer loading indicator */}
              <div className="absolute top-4 right-4 z-20 bg-black/50 text-white p-3 rounded-full">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="text-sm">Loading trailer...</span>
                </div>
              </div>
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

          {/* Mute/Unmute button - Show when trailer is available */}
          {heroTrailerKey ? (
            <button
              onClick={toggleMute}
              className="absolute top-1/2 right-4 transform -translate-y-1/2 z-50 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-colors cursor-pointer"
              title={isMuted ? "Unmute" : "Mute"}
              style={{ pointerEvents: 'auto' }}
            >
              {isMuted ? (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              )}
            </button>
          ) : null}

          {/* Hero Content */}
          <div className="absolute bottom-40 left-4 md:left-12 z-10 max-w-xl">
            <h1 className="font-heading text-5xl md:text-7xl font-bold mb-4">{featuredMovie.title}</h1>
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
            </div>
          </div>
        </div>
      ) : (
        <div className="h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      )}

      {/* Movie Rows */}
      <div className="relative bg-gradient-to-b from-black via-gray-900/30 to-black">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="relative z-10 -mt-16 pb-20">
          <MovieRow title="Trending Now" movies={movieCategories.trending} onModalStateChange={handleModalStateChange} />
          <MovieRow title="Top Rated Movies" movies={movieCategories.topRated} onModalStateChange={handleModalStateChange} />
          <MovieRow title="Action & Adventure" movies={movieCategories.action} onModalStateChange={handleModalStateChange} />
          <MovieRow title="Horror Movies" movies={movieCategories.horror} onModalStateChange={handleModalStateChange} />
          <MovieRow title="Comedy Movies" movies={movieCategories.comedy} onModalStateChange={handleModalStateChange} />
          <MovieRow title="Drama Movies" movies={movieCategories.drama} onModalStateChange={handleModalStateChange} />
          <MovieRow title="Sci-Fi Movies" movies={movieCategories.sciFi} onModalStateChange={handleModalStateChange} />
          <MovieRow title="Thriller Movies" movies={movieCategories.thriller} onModalStateChange={handleModalStateChange} />
        </div>
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
