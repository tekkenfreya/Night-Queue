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
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-netflix-gray border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-netflix-red"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-netflix-red px-4 py-1 rounded text-sm hover:bg-red-700 transition-colors"
        >
          Search
        </button>
      </div>
    </form>
  );
}