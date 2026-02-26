'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Movie } from '@/types';
import { tmdbService } from '@/services/tmdb';
import { MovieModal } from './MovieModal';

interface MovieCardProps {
  movie: Movie;
  showFullDetails?: boolean;
}

export function MovieCard({ movie, showFullDetails = false }: MovieCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getReleaseYear = () => {
    return movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  };

  const getRating = () => {
    return movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
  };

  if (showFullDetails || isExpanded) {
    return (
      <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg animate-scaleIn">
        <div className="md:flex">
          <div className="md:w-1/3">
            <div className="relative aspect-[2/3]">
              <Image
                src={tmdbService.getImageUrl(movie.poster_path)}
                alt={movie.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
          </div>

          <div className="md:w-2/3 p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-white">{movie.title}</h2>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm text-gray-300">
              <span className="bg-yellow-600 px-2 py-1 rounded">⭐ {getRating()}</span>
              <span>{getReleaseYear()}</span>
              <span>{movie.vote_count} votes</span>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed">
              {movie.overview || 'No synopsis available.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-all duration-300 cursor-pointer group shadow-lg hover:shadow-2xl animate-slideUp"
        onClick={() => setIsModalOpen(true)}
      >
      <div className="relative aspect-[2/3]">
        <Image
          src={tmdbService.getImageUrl(movie.poster_path)}
          alt={movie.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 right-2">
          <span className="bg-black/70 text-yellow-400 text-xs px-2 py-1 rounded">
            ⭐ {getRating()}
          </span>
        </div>
      </div>
      </div>

      <MovieModal
        movie={movie}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
