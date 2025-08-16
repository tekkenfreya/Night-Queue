import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Movie, Genre, SearchFilters, ApiResponse } from '@/types';
import { tmdbService } from '@/services/tmdb';

interface MoviesState {
  searchResults: Movie[];
  popularMovies: Movie[];
  topRatedMovies: Movie[];
  genres: Genre[];
  currentMovie: Movie | null;
  searchQuery: string;
  filters: SearchFilters;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
  };
}

const initialState: MoviesState = {
  searchResults: [],
  popularMovies: [],
  topRatedMovies: [],
  genres: [],
  currentMovie: null,
  searchQuery: '',
  filters: {},
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
  },
};

export const searchMovies = createAsyncThunk(
  'movies/searchMovies',
  async ({ query, filters }: { query: string; filters?: SearchFilters }) => {
    const response = await tmdbService.searchMovies(query, filters);
    return response;
  }
);

export const fetchPopularMovies = createAsyncThunk(
  'movies/fetchPopularMovies',
  async (page: number = 1) => {
    const response = await tmdbService.getPopularMovies(page);
    return response;
  }
);

export const fetchTopRatedMovies = createAsyncThunk(
  'movies/fetchTopRatedMovies',
  async (page: number = 1) => {
    const response = await tmdbService.getTopRatedMovies(page);
    return response;
  }
);

export const fetchGenres = createAsyncThunk(
  'movies/fetchGenres',
  async () => {
    const response = await tmdbService.getGenres();
    return response.genres;
  }
);

export const fetchMovieDetails = createAsyncThunk(
  'movies/fetchMovieDetails',
  async (movieId: number) => {
    const response = await tmdbService.getMovieDetails(movieId);
    return response;
  }
);

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<SearchFilters>) => {
      state.filters = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchMovies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.results;
        state.pagination = {
          currentPage: action.payload.page,
          totalPages: action.payload.total_pages,
          totalResults: action.payload.total_results,
        };
      })
      .addCase(searchMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to search movies';
      })
      .addCase(fetchPopularMovies.fulfilled, (state, action) => {
        state.popularMovies = action.payload.results;
      })
      .addCase(fetchTopRatedMovies.fulfilled, (state, action) => {
        state.topRatedMovies = action.payload.results;
      })
      .addCase(fetchGenres.fulfilled, (state, action) => {
        state.genres = action.payload;
      })
      .addCase(fetchMovieDetails.fulfilled, (state, action) => {
        state.currentMovie = action.payload;
      });
  },
});

export const { setSearchQuery, setFilters, clearSearchResults, clearError } = moviesSlice.actions;
export default moviesSlice.reducer;