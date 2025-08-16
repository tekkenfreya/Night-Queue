'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { searchMovies, fetchGenres, setSearchQuery, setFilters } from '@/lib/slices/moviesSlice';
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
    }
  };

  const handleFilterChange = (newFilters: any) => {
    dispatch(setFilters(newFilters));
    if (searchQuery.trim()) {
      dispatch(searchMovies({ query: searchQuery, filters: newFilters }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Search Movies</h1>
        
        <div className="space-y-4">
          <SearchBar 
            onSearch={handleSearch}
            initialValue={searchQuery}
            placeholder="Search for movies..."
          />
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-netflix-red hover:underline"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            
            {searchResults.length > 0 && (
              <p className="text-gray-400">
                Found {searchResults.length} movies
              </p>
            )}
          </div>
          
          {showFilters && (
            <FilterPanel
              filters={filters}
              genres={genres}
              onFilterChange={handleFilterChange}
            />
          )}
        </div>
      </div>

      {loading && <LoadingSpinner />}
      
      {error && (
        <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {!loading && searchResults.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            No movies found for "{searchQuery}"
          </p>
        </div>
      )}

      {!loading && searchResults.length === 0 && !searchQuery && (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg">
            Start typing to search for movies...
          </p>
        </div>
      )}

      {searchResults.length > 0 && <MovieGrid movies={searchResults} />}
    </div>
  );
}