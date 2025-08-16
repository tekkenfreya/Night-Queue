import { createClient } from '@/lib/supabase/client';
import { WatchlistItem, Movie, User, UserPreferences } from '@/types';

class DatabaseService {
  private getSupabase() {
    return createClient();
  }

  // Profile operations
  async getProfile(userId: string): Promise<User | null> {
    try {
      const { data, error } = await this.getSupabase()
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        preferences: {
          favoriteGenres: data.favorite_genres || [],
          theme: data.theme || 'dark',
          notifications: data.notifications ?? true,
        },
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      const dbUpdates: any = {};
      
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.email) dbUpdates.email = updates.email;
      if (updates.avatar) dbUpdates.avatar = updates.avatar;
      
      if (updates.preferences) {
        if (updates.preferences.favoriteGenres) {
          dbUpdates.favorite_genres = updates.preferences.favoriteGenres;
        }
        if (updates.preferences.theme) {
          dbUpdates.theme = updates.preferences.theme;
        }
        if (updates.preferences.notifications !== undefined) {
          dbUpdates.notifications = updates.preferences.notifications;
        }
      }

      const { error } = await this.getSupabase()
        .from('profiles')
        .update(dbUpdates)
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  // Watchlist operations
  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    try {
      const { data, error } = await this.getSupabase()
        .from('watchlist')
        .select('*')
        .eq('user_id', userId)
        .order('date_added', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map(item => ({
        id: item.id,
        movieId: item.movie_id,
        movie: {
          id: item.movie_id,
          title: item.movie_title,
          overview: item.movie_overview || '',
          poster_path: item.movie_poster_path,
          backdrop_path: item.movie_backdrop_path,
          release_date: item.movie_release_date || '',
          vote_average: item.movie_vote_average || 0,
          vote_count: item.movie_vote_count || 0,
          genre_ids: item.movie_genre_ids || [],
        },
        status: item.status as 'want_to_watch' | 'watched' | 'watch_later',
        personalRating: item.personal_rating,
        notes: item.notes,
        dateAdded: item.date_added,
        dateWatched: item.date_watched,
        whereWatched: item.where_watched,
      }));
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      return [];
    }
  }

  async addToWatchlist(userId: string, movie: Movie, status: 'want_to_watch' | 'watched' | 'watch_later' = 'want_to_watch'): Promise<boolean> {
    try {
      const { error } = await this.getSupabase()
        .from('watchlist')
        .insert({
          user_id: userId,
          movie_id: movie.id,
          status,
          movie_title: movie.title,
          movie_overview: movie.overview,
          movie_poster_path: movie.poster_path,
          movie_backdrop_path: movie.backdrop_path,
          movie_release_date: movie.release_date,
          movie_vote_average: movie.vote_average,
          movie_vote_count: movie.vote_count,
          movie_genre_ids: movie.genre_ids,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
  }

  async updateWatchlistItem(userId: string, itemId: string, updates: Partial<WatchlistItem>): Promise<boolean> {
    try {
      const dbUpdates: any = {};
      
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.personalRating) dbUpdates.personal_rating = updates.personalRating;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.dateWatched) dbUpdates.date_watched = updates.dateWatched;
      if (updates.whereWatched !== undefined) dbUpdates.where_watched = updates.whereWatched;

      const { error } = await this.getSupabase()
        .from('watchlist')
        .update(dbUpdates)
        .eq('id', itemId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating watchlist item:', error);
      return false;
    }
  }

  async removeFromWatchlist(userId: string, itemId: string): Promise<boolean> {
    try {
      const { error } = await this.getSupabase()
        .from('watchlist')
        .delete()
        .eq('id', itemId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      return false;
    }
  }

  async isMovieInWatchlist(userId: string, movieId: number): Promise<boolean> {
    try {
      const { data, error } = await this.getSupabase()
        .from('watchlist')
        .select('id')
        .eq('user_id', userId)
        .eq('movie_id', movieId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking watchlist:', error);
      return false;
    }
  }
}

export const databaseService = new DatabaseService();