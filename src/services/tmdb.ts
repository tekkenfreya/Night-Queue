import { Movie, Genre, ApiResponse, SearchFilters } from '@/types';

const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';

// Only throw error at runtime, not during build
const isAPIConfigured = () => {
  if (!TMDB_API_KEY || !TMDB_BASE_URL) {
    throw new Error('TMDB API configuration is required. Please add NEXT_PUBLIC_TMDB_API_KEY to your environment variables.');
  }
};

class TMDbService {
  private async fetchFromTMDb<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    isAPIConfigured(); // Check API configuration at runtime
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', TMDB_API_KEY);
    
    Object.entries(params).forEach(([key, value]: [string, any]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`TMDb API error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async searchMovies(query: string, filters: SearchFilters = {}): Promise<ApiResponse<Movie>> {
    // Check if filters are applied beyond just search query
    const hasAdvancedFilters = filters.genre || filters.rating || filters.country || filters.cast || filters.sortBy;
    
    if (hasAdvancedFilters) {
      // Use discover API for better filter support and fetch multiple pages
      return this.searchWithFilters(query, filters);
    } else {
      // Use simple search API for text-only searches
      const params: Record<string, any> = {
        query,
        page: 1,
      };

      if (filters.year) params.primary_release_year = filters.year;

      const response = await this.fetchFromTMDb<ApiResponse<Movie>>('/search/movie', params);
      return {
        ...response,
        results: response.results.filter(movie => movie.vote_count >= 50)
      };
    }
  }

  private async searchWithFilters(query: string, filters: SearchFilters): Promise<ApiResponse<Movie>> {
    const allResults: Movie[] = [];
    let currentPage = 1;
    const maxPages = 5; // Limit to prevent excessive API calls
    const targetResults = 100; // Try to get at least 100 results
    
    // Apply minimum vote count for rating-based sorting to prevent unreliable ratings
    const isRatingBasedSort = filters.sortBy === 'rating' || filters.sortBy === 'vote_count' || filters.rating;
    
    while (currentPage <= maxPages && allResults.length < targetResults) {
      const params: Record<string, any> = {
        page: currentPage,
        sort_by: filters.sortBy ? `${filters.sortBy === 'rating' ? 'vote_average' : filters.sortBy}.${filters.sortOrder || 'desc'}` : 'popularity.desc',
        include_video: false,
      };

      // Apply all filters consistently
      if (filters.genre) params.with_genres = filters.genre;
      if (filters.year) params.primary_release_year = filters.year;
      if (filters.cast && filters.cast.trim()) params.with_cast = filters.cast;
      
      // Apply rating filter if specified
      if (filters.rating) {
        params.vote_average_gte = filters.rating;
      }
      
      // ALWAYS apply vote count minimum to avoid low-quality movies
      params['vote_count.gte'] = 50; // Always require minimum 50 votes for reliable ratings
      
      if (filters.country && filters.country.trim() !== '') params.with_origin_country = filters.country;

      const response = await this.fetchFromTMDb<ApiResponse<Movie>>('/discover/movie', params);
      
      // Additional client-side filtering for vote count to ensure quality
      let filteredResults = response.results.filter(movie => movie.vote_count >= 50);
      
      allResults.push(...filteredResults);
      
      // Break if no more pages or no results on current page
      if (currentPage >= response.total_pages || response.results.length === 0) {
        break;
      }
      
      currentPage++;
    }

    // Return combined results with updated pagination info
    return {
      results: allResults,
      page: 1,
      total_pages: Math.ceil(allResults.length / 20),
      total_results: allResults.length
    };
  }

  async getMovieDetails(movieId: number): Promise<Movie> {
    return this.fetchFromTMDb<Movie>(`/movie/${movieId}`);
  }

  async getPopularMovies(page: number = 1): Promise<ApiResponse<Movie>> {
    const response = await this.fetchFromTMDb<ApiResponse<Movie>>('/movie/popular', { page });
    return {
      ...response,
      results: response.results.filter(movie => movie.vote_count >= 50)
    };
  }

  async getTopRatedMovies(page: number = 1): Promise<ApiResponse<Movie>> {
    const response = await this.fetchFromTMDb<ApiResponse<Movie>>('/movie/top_rated', { page });
    return {
      ...response,
      results: response.results.filter(movie => movie.vote_count >= 50)
    };
  }

  async getGenres(): Promise<{ genres: Genre[] }> {
    return this.fetchFromTMDb<{ genres: Genre[] }>('/genre/movie/list');
  }

  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Promise<ApiResponse<Movie>> {
    const response = await this.fetchFromTMDb<ApiResponse<Movie>>(`/trending/movie/${timeWindow}`);
    return {
      ...response,
      results: response.results.filter(movie => movie.vote_count >= 50)
    };
  }

  async getNowPlayingMovies(page: number = 1): Promise<ApiResponse<Movie>> {
    const response = await this.fetchFromTMDb<ApiResponse<Movie>>('/movie/now_playing', { page });
    return {
      ...response,
      results: response.results.filter(movie => movie.vote_count >= 50)
    };
  }

  async getUpcomingMovies(page: number = 1): Promise<ApiResponse<Movie>> {
    const response = await this.fetchFromTMDb<ApiResponse<Movie>>('/movie/upcoming', { page });
    return {
      ...response,
      results: response.results.filter(movie => movie.vote_count >= 50)
    };
  }

  async discoverMovies(filters: SearchFilters = {}): Promise<ApiResponse<Movie>> {
    return this.searchWithFilters('', filters);
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    if (!path) return 'https://via.placeholder.com/500x750/374151/9CA3AF?text=No+Image';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}

export const tmdbService = new TMDbService();