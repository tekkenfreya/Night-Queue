'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { SearchFilters } from '@/types';
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
      const hasFilters = Object.values(filters).some(value => {
        if (value === undefined || value === null || value === '') return false;
        // For genre, null/undefined means "All Genres" so not a filter
        return true;
      });
      if (hasFilters) {
        dispatch(discoverMovies(filters));
      }
    }
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900/50 via-black to-black text-white relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }} />
      </div>
      
      {/* Hero Search Section */}
      <div className="relative z-10 flex-1 flex items-center justify-center">
        
        <div className="relative container mx-auto px-4 lg:px-8 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Search Movies Title */}
            <div className="mb-8">
              <h1 className="font-heading text-6xl md:text-8xl font-black mb-4 tracking-tight" style={{ color: '#E50914' }}>
                Search Movies
              </h1>
              <p className="text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto">
                Your shortcut to the good stuff.
              </p>
            </div>
            
            {/* Enhanced Search Bar */}
            <div className="mb-8">
              <div className="max-w-2xl mx-auto">
                <SearchBar 
                  onSearch={handleSearch}
                  initialValue={searchQuery}
                  placeholder="Search for movies, actors, directors..."
                />
              </div>
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="group flex items-center gap-3 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                <svg className={`w-5 h-5 text-netflix-red transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                <span className="font-medium">{showFilters ? 'Hide Filters' : 'Advanced Filters'}</span>
              </button>
              
              {searchResults.length > 0 ? (
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-600/50 px-6 py-3 rounded-full backdrop-blur-sm">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-300 font-medium">
                    {searchResults.length} movie{searchResults.length !== 1 ? 's' : ''} found
                  </span>
                </div>
              ) : null}
            </div>
            
            {/* Filter Panel */}
            {showFilters ? (
              <div className="mt-8">
                <div className="bg-gray-900/60 backdrop-blur-md border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
                  <FilterPanel
                    filters={filters}
                    genres={genres}
                    onFilterChange={handleFilterChange}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
        
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Results Section */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <LoadingSpinner />
            </div>
            <p className="text-gray-300 mt-8 text-lg">Searching the cinema universe...</p>
          </div>
        ) : null}
        
        {error ? (
          <div className="max-w-2xl mx-auto mb-8">
            <div className="bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-600/50 backdrop-blur-sm text-red-200 px-8 py-6 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Search Error</h4>
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {!loading && searchResults.length === 0 && searchQuery ? (
          <div className="text-center py-32 animate-fadeIn">
            <div className="text-8xl mb-8">🎭</div>
            <div className="max-w-lg mx-auto">
              <h3 className="text-3xl font-bold text-white mb-4">No Movies Found</h3>
              <p className="text-xl text-gray-300 mb-2">
                No results for "<span className="text-netflix-red font-semibold">{searchQuery}</span>"
              </p>
              <p className="text-gray-500 mb-8">Try different keywords, check your spelling, or explore our filters</p>
              <div className="flex flex-wrap justify-center gap-3">
                {['action', 'comedy', 'drama', 'thriller', 'horror'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSearch(suggestion)}
                    className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 px-4 py-2 rounded-full text-sm text-gray-300 hover:text-white transition-all duration-200 capitalize"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}


        {searchResults.length > 0 ? (
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 text-center">
              <h2 className="font-heading text-2xl font-bold text-white mb-2">Search Results</h2>
              <div className="h-1 w-24 bg-gradient-to-r from-netflix-red to-red-600 rounded-full mx-auto" />
            </div>
            <MovieGrid movies={searchResults} />
          </div>
        ) : null}
      </div>
    </div>
  );
}