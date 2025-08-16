'use client';

import { Genre, SearchFilters } from '@/types';

interface FilterPanelProps {
  filters: SearchFilters;
  genres: Genre[];
  onFilterChange: (filters: SearchFilters) => void;
}

export function FilterPanel({ filters, genres, onFilterChange }: FilterPanelProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-netflix-gray p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Genre</label>
          <select
            value={filters.genre || ''}
            onChange={(e) => handleFilterChange('genre', e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-3 py-2 bg-netflix-dark border border-gray-600 rounded text-white"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Year</label>
          <select
            value={filters.year || ''}
            onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : null)}
            className="w-full px-3 py-2 bg-netflix-dark border border-gray-600 rounded text-white"
          >
            <option value="">Any Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Minimum Rating</label>
          <select
            value={filters.rating || ''}
            onChange={(e) => handleFilterChange('rating', e.target.value ? parseFloat(e.target.value) : null)}
            className="w-full px-3 py-2 bg-netflix-dark border border-gray-600 rounded text-white"
          >
            <option value="">Any Rating</option>
            <option value="7">7+ Stars</option>
            <option value="8">8+ Stars</option>
            <option value="9">9+ Stars</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Sort By</label>
          <select
            value={filters.sortBy || 'popularity'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 bg-netflix-dark border border-gray-600 rounded text-white"
          >
            <option value="popularity">Popularity</option>
            <option value="vote_average">Rating</option>
            <option value="release_date">Release Date</option>
            <option value="title">Title</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onFilterChange({})}
          className="text-netflix-red hover:underline"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}