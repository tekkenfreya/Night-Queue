'use client';

import { Film, Calendar, Star, Globe, ArrowUpDown, SortAsc, X } from 'lucide-react';
import { Genre, SearchFilters } from '@/types';

interface FilterPanelProps {
  filters: SearchFilters;
  genres: Genre[];
  onFilterChange: (filters: SearchFilters) => void;
}

export function FilterPanel({ filters, genres, onFilterChange }: FilterPanelProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
  
  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'FR', name: 'France' },
    { code: 'DE', name: 'Germany' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'CN', name: 'China' },
    { code: 'IN', name: 'India' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'BR', name: 'Brazil' },
    { code: 'MX', name: 'Mexico' },
    { code: 'RU', name: 'Russia' },
  ];

  const handleFilterChange = (key: keyof SearchFilters, value: SearchFilters[keyof SearchFilters]) => {
    const newFilters = { ...filters, [key]: value || undefined };
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-netflix-gray p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-2">
            <Film className="w-4 h-4 text-gray-400" />
            Genre
          </label>
          <select
            value={filters.genre || ''}
            onChange={(e) => handleFilterChange('genre', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 bg-netflix-dark border border-gray-600 rounded text-white [&>option]:bg-netflix-dark [&>option]:text-white"
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
          <label className="flex items-center gap-1.5 text-sm font-medium mb-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            Year
          </label>
          <select
            value={filters.year || ''}
            onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 bg-netflix-dark border border-gray-600 rounded text-white [&>option]:bg-netflix-dark [&>option]:text-white"
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
          <label className="flex items-center gap-1.5 text-sm font-medium mb-2">
            <Star className="w-4 h-4 text-gray-400" />
            Minimum Rating
          </label>
          <select
            value={filters.rating || ''}
            onChange={(e) => handleFilterChange('rating', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 bg-netflix-dark border border-gray-600 rounded text-white [&>option]:bg-netflix-dark [&>option]:text-white"
          >
            <option value="">Any Rating</option>
            <option value="5">5+ Stars (Good)</option>
            <option value="6">6+ Stars (Great)</option>
            <option value="7">7+ Stars (Excellent)</option>
            <option value="8">8+ Stars (Outstanding)</option>
            <option value="9">9+ Stars (Masterpiece)</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-2">
            <Globe className="w-4 h-4 text-gray-400" />
            Country
          </label>
          <select
            value={filters.country || ''}
            onChange={(e) => handleFilterChange('country', e.target.value || undefined)}
            className="w-full px-3 py-2 bg-netflix-dark border border-gray-600 rounded text-white [&>option]:bg-netflix-dark [&>option]:text-white"
          >
            <option value="">All Countries</option>
            {countries.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            Sort By
          </label>
          <select
            value={filters.sortBy || 'popularity'}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 bg-netflix-dark border border-gray-600 rounded text-white [&>option]:bg-netflix-dark [&>option]:text-white"
          >
            <option value="popularity">Popularity</option>
            <option value="rating">Rating</option>
            <option value="release_date">Release Date</option>
            <option value="title">Title</option>
            <option value="vote_count">Popularity (Votes)</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium mb-2">
            <SortAsc className="w-4 h-4 text-gray-400" />
            Sort Order
          </label>
          <select
            value={filters.sortOrder || 'desc'}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="w-full px-3 py-2 bg-netflix-dark border border-gray-600 rounded text-white [&>option]:bg-netflix-dark [&>option]:text-white"
          >
            <option value="desc">High to Low</option>
            <option value="asc">Low to High</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={() => onFilterChange({})}
          className="flex items-center gap-1.5 text-netflix-red hover:underline"
        >
          <X className="w-4 h-4" />
          Clear Filters
        </button>
      </div>
    </div>
  );
}