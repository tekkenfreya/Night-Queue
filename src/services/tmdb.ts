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
      if (value !== undefined && value !== null) {
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
    const params: Record<string, any> = {
      query,
      page: 1,
    };

    if (filters.year) params.year = filters.year;
    if (filters.genre) params.with_genres = filters.genre;

    return this.fetchFromTMDb<ApiResponse<Movie>>('/search/movie', params);
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
    const params: Record<string, any> = {
      page: 1,
      sort_by: filters.sortBy ? `${filters.sortBy}.${filters.sortOrder || 'desc'}` : 'popularity.desc',
    };

    if (filters.genre) params.with_genres = filters.genre;
    if (filters.year) params.year = filters.year;
    if (filters.rating) params.vote_average_gte = filters.rating;
    if (filters.country) params.with_origin_country = filters.country;

    return this.fetchFromTMDb<ApiResponse<Movie>>('/discover/movie', params);
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    if (!path) return 'https://via.placeholder.com/500x750/374151/9CA3AF?text=No+Image';
    return `https://image.tmdb.org/t/p/${size}${path}`;
  }
}

export const tmdbService = new TMDbService();