export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  genres?: Genre[];
  runtime?: number;
  director?: string;
  cast?: string[];
}

export interface Genre {
  id: number;
  name: string;
}

export interface SearchFilters {
  genre?: number;
  year?: number;
  rating?: number;
  country?: string;
  cast?: string;
  sortBy?: 'popularity' | 'rating' | 'release_date' | 'title' | 'revenue' | 'vote_count';
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}