'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { searchMovies, discoverMovies, fetchGenres, setSearchQuery, setFilters } from '@/lib/slices/moviesSlice';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterPanel } from '@/components/search/FilterPanel';
import { MovieGrid } from '@/components/movies/MovieGrid';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function SearchPage() {
  const dispatch = useAppDispatch();
  const { searchResults, loading, error, searchQuery, filters, genres } = useAppSelector(state => state.movies);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchGenres());
  }, [dispatch]);

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query));
    if (query.trim()) {
      dispatch(searchMovies({ query, filters }));
    } else {
      // If no query but filters exist, use discover
      const hasFilters = Object.values(filters).some(value => value !== undefined && value !== null && value !== '');
      if (hasFilters) {
        dispatch(discoverMovies(filters));
      }
    }
  };

  const handleFilterChange = (newFilters: any) => {
    dispatch(setFilters(newFilters));
    if (searchQuery.trim()) {
      dispatch(searchMovies({ query: searchQuery, filters: newFilters }));
    } else {
      // If no search query but filters exist, use discover
      const hasFilters = Object.values(newFilters).some(value => value !== undefined && value !== null && value !== '');
      if (hasFilters) {
        dispatch(discoverMovies(newFilters));
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 animate-slideUp">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-netflix-red bg-clip-text text-transparent">
          Discover Movies
        </h1>
        <p className="text-gray-400 mb-8">Find your next favorite film</p>
        
        <div className="space-y-6">
          <div className="animate-fadeIn">
            <SearchBar 
              onSearch={handleSearch}
              initialValue={searchQuery}
              placeholder="Search for movies, actors, directors..."
            />
          </div>
          
          <div className="flex items-center justify-between animate-fadeIn">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <span className="text-netflix-red">⚙️</span>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            {searchResults.length > 0 ? (
              <div className="bg-gray-800 px-4 py-2 rounded-lg">
                <p className="text-green-400 font-medium">
                  ✓ Found {searchResults.length} movies
                </p>
              </div>
            ) : null}
          </div>
          
          {showFilters ? (
            <div className="animate-slideUp">
              <FilterPanel
                filters={filters}
                genres={genres}
                onFilterChange={handleFilterChange}
              />
            </div>
          ) : null}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <LoadingSpinner />
          <p className="text-gray-400 mt-4 animate-pulse">Searching for movies...</p>
        </div>
      ) : null}
      
      {error ? (
        <div className="bg-red-900/20 border border-red-600 text-red-200 px-6 py-4 rounded-lg mb-6 animate-slideUp">
          <div className="flex items-center gap-3">
            <span className="text-red-400">❌</span>
            <span>{error}</span>
          </div>
        </div>
      ) : null}

      {!loading && searchResults.length === 0 && searchQuery ? (
        <div className="text-center py-20 animate-fadeIn">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold text-white mb-2">No movies found</h3>
          <p className="text-gray-400 text-lg">
            No results for "<span className="text-netflix-red">{searchQuery}</span>"
          </p>
          <p className="text-gray-500 mt-2">Try different keywords or check your spelling</p>
        </div>
      ) : null}

      {!loading && searchResults.length === 0 && !searchQuery ? (
        <div className="text-center py-20 animate-fadeIn">
          <div className="text-8xl mb-6">🍿</div>
          <h3 className="text-2xl font-semibold text-white mb-2">Ready to discover?</h3>
          <p className="text-gray-400 text-lg mb-4">
            Start typing to search thousands of movies
          </p>
          <p className="text-gray-500 text-sm mb-6">
            Or use filters below to discover movies by genre, year, rating, and more!
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <span className="bg-gray-800 px-3 py-1 rounded text-sm text-gray-300">Action</span>
            <span className="bg-gray-800 px-3 py-1 rounded text-sm text-gray-300">Comedy</span>
            <span className="bg-gray-800 px-3 py-1 rounded text-sm text-gray-300">Drama</span>
          </div>
        </div>
      ) : null}

      {searchResults.length > 0 ? (
        <div className="animate-slideUp">
          <MovieGrid movies={searchResults} />
        </div>
      ) : null}
    </div>
  );
}