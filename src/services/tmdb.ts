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
  private async fetchFromTMDb<T>(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
    isAPIConfigured(); // Check API configuration at runtime
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', TMDB_API_KEY);

    Object.entries(params).forEach(([key, value]: [string, string | number | boolean]) => {
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
    // Note: genre=null means "All Genres" which is not a filter constraint
    const hasAdvancedFilters = (filters.genre && filters.genre > 0) || filters.rating || filters.country || filters.cast || filters.sortBy;
    
    if (hasAdvancedFilters) {
      // Use discover API for better filter support and fetch multiple pages
      return this.searchWithFilters(query, filters);
    } else {
      // Use simple search API for text-only searches
      const params: Record<string, string | number | boolean> = {
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
    // If we have a search query (like "star wars"), get search results first then apply filters
    if (query.trim()) {
      return this.searchThenApplyFilters(query, filters);
    }
    
    // Otherwise use discover API for filter-only queries (no search text)
    const allResults: Movie[] = [];
    let currentPage = 1;
    const maxPages = 25; // Allow up to 25 pages (500 results)
    const targetResults = 500; // Try to get up to 500 results
    
    while (currentPage <= maxPages && allResults.length < targetResults) {
      const getSortBy = (sortBy?: string, sortOrder?: string) => {
        const order = sortOrder || 'desc';
        switch (sortBy) {
          case 'rating':
            return `vote_average.${order}`;
          case 'release_date':
            return `release_date.${order}`;
          case 'title':
            return `title.${order}`;
          case 'vote_count':
            return `vote_count.${order}`;
          case 'popularity':
          default:
            return `popularity.${order}`;
        }
      };

      const params: Record<string, string | number | boolean> = {
        page: currentPage,
        sort_by: getSortBy(filters.sortBy, filters.sortOrder),
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

  async searchThenApplyFilters(query: string, filters: SearchFilters): Promise<ApiResponse<Movie>> {
    // Get search results first
    const searchParams: Record<string, string | number | boolean> = { query, page: 1 };
    if (filters.year) searchParams.primary_release_year = filters.year;
    
    const searchResponse = await this.fetchFromTMDb<ApiResponse<Movie>>('/search/movie', searchParams);
    let results = searchResponse.results.filter(movie => movie.vote_count >= 50);
    
    // Apply additional filters client-side
    if (filters.genre) {
      results = results.filter(movie => movie.genre_ids?.includes(filters.genre!));
    }
    
    if (filters.rating) {
      results = results.filter(movie => movie.vote_average >= filters.rating!);
    }
    
    // Apply sorting client-side
    if (filters.sortBy) {
      results.sort((a, b) => {
        let aValue: string | number, bValue: string | number;
        
        switch (filters.sortBy) {
          case 'rating':
            aValue = a.vote_average || 0;
            bValue = b.vote_average || 0;
            break;
          case 'release_date':
            aValue = new Date(a.release_date || '1900-01-01').getTime();
            bValue = new Date(b.release_date || '1900-01-01').getTime();
            break;
          case 'title':
            aValue = a.title?.toLowerCase() || '';
            bValue = b.title?.toLowerCase() || '';
            break;
          case 'vote_count':
            aValue = a.vote_count || 0;
            bValue = b.vote_count || 0;
            break;
          case 'popularity':
          default:
            // Use popularity score based on vote average and count
            aValue = (a.vote_average || 0) * Math.log((a.vote_count || 0) + 1);
            bValue = (b.vote_average || 0) * Math.log((b.vote_count || 0) + 1);
            break;
        }
        
        const order = filters.sortOrder === 'asc' ? 1 : -1;
        
        // Handle string comparisons properly
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue) * order;
        }
        
        // Handle numeric comparisons
        if (aValue < bValue) return -1 * order;
        if (aValue > bValue) return 1 * order;
        return 0;
      });
    }
    
    return {
      results,
      page: 1,
      total_pages: Math.ceil(results.length / 20),
      total_results: results.length
    };
  }

  async getMovieDetails(movieId: number): Promise<Movie> {
    return this.fetchFromTMDb<Movie>(`/movie/${movieId}`);
  }

  async getMovieVideos(movieId: number): Promise<{ results: Array<{ id: string; key: string; name: string; type: string; site: string }> }> {
    return this.fetchFromTMDb(`/movie/${movieId}/videos`);
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