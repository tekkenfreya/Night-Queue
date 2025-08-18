'use client';

import { useState, useEffect } from 'react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
  placeholder?: string;
}

export function SearchBar({ onSearch, initialValue = '', placeholder = 'Search...' }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative group">
        {/* Glass morphism effect background */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl" />
        
        <div className="relative flex items-center">
          <div className="absolute left-6 flex items-center pointer-events-none">
            <svg className="h-6 w-6 text-gray-400 group-focus-within:text-netflix-red transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-16 pr-32 py-5 bg-transparent text-white placeholder-gray-400 text-lg font-medium focus:outline-none transition-all duration-300"
          />
          <button
            type="submit"
            className="absolute right-3 bg-gradient-to-r from-netflix-red to-red-600 hover:from-red-600 hover:to-red-700 px-8 py-3 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </div>
          </button>
        </div>
        
        {/* Focus ring effect */}
        <div className="absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded-2xl border-2 border-netflix-red/50 shadow-lg shadow-netflix-red/20" />
        </div>
      </div>
    </form>
  );
}