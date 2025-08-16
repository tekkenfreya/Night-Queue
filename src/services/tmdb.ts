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
    const hasAdvancedFilters = filters.genre || filters.rating || filters.country || filters.sortBy;
    
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

      return this.fetchFromTMDb<ApiResponse<Movie>>('/search/movie', params);
    }
  }

  private async searchWithFilters(query: string, filters: SearchFilters): Promise<ApiResponse<Movie>> {
    const allResults: Movie[] = [];
    let currentPage = 1;
    const maxPages = 5; // Limit to prevent excessive API calls
    const targetResults = 100; // Try to get at least 100 results
    
    // Apply minimum vote count for rating-based sorting to prevent unreliable ratings
    const isRatingBasedSort = filters.sortBy === 'vote_average' || filters.rating;
    
    while (currentPage <= maxPages && allResults.length < targetResults) {
      const params: Record<string, any> = {
        page: currentPage,
        sort_by: filters.sortBy ? `${filters.sortBy}.${filters.sortOrder || 'desc'}` : 'popularity.desc',
      };

      // Add search query if provided
      if (query.trim()) {
        params.with_keywords = query;
      }

      // Apply all filters consistently
      if (filters.genre) params.with_genres = filters.genre;
      if (filters.year) params.primary_release_year = filters.year;
      
      // Apply vote count minimum for rating filter OR when sorting by rating
      if (filters.rating || isRatingBasedSort) {
        if (filters.rating) {
          params.vote_average_gte = filters.rating;
        }
        params.vote_count_gte = 100; // Always require minimum 100 votes for reliable ratings
      }
      
      if (filters.country && filters.country.trim() !== '') params.with_origin_country = filters.country;

      const response = await this.fetchFromTMDb<ApiResponse<Movie>>('/discover/movie', params);
      
      // Additional client-side filtering for vote count when rating-based operations
      let filteredResults = response.results;
      if (isRatingBasedSort) {
        filteredResults = response.results.filter(movie => movie.vote_count >= 100);
      }
      
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
    return this.fetchFromTMDb<ApiResponse<Movie>>('/movie/popular', { page });
  }

  async getTopRatedMovies(page: number = 1): Promise<ApiResponse<Movie>> {
    return this.fetchFromTMDb<ApiResponse<Movie>>('/movie/top_rated', { page });
  }

  async getGenres(): Promise<{ genres: Genre[] }> {
    return this.fetchFromTMDb<{ genres: Genre[] }>('/genre/movie/list');
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