import { createClient } from '@/lib/supabase/client';
import { WatchlistItem, Movie, User } from '@/types';

interface ProfileDbRow {
  name?: string;
  email?: string;
  avatar?: string;
  favorite_genres?: number[];
  theme?: 'dark' | 'light';
  notifications?: boolean;
}

interface WatchlistRow {
  id: string;
  movie_id: number;
  movie_title: string;
  movie_overview: string | null;
  movie_poster_path: string | null;
  movie_backdrop_path: string | null;
  movie_release_date: string | null;
  movie_vote_average: number | null;
  movie_vote_count: number | null;
  movie_genre_ids: number[] | null;
  status: 'want_to_watch' | 'watched' | 'watch_later';
  personal_rating: number | null;
  notes: string | null;
  date_added: string;
  date_watched: string | null;
  where_watched: string | null;
}

interface WatchlistDbUpdates {
  status?: 'want_to_watch' | 'watched' | 'watch_later';
  personal_rating?: number;
  notes?: string;
  date_watched?: string;
  where_watched?: string;
}

class DatabaseService {
  private profileExists = new Set<string>(); // Cache profile existence

  private getSupabase() {
    const client = createClient();
    if (!client) {
      throw new Error('Supabase client not available during build time');
    }
    return client;
  }

  // Profile operations
  async ensureProfileExists(userId: string): Promise<void> {
    try {
      // Check cache first
      if (this.profileExists.has(userId)) {
        return;
      }

      // Check if profile already exists
      const { data: existingProfile, error: selectError } = await this.getSupabase()
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking existing profile:', selectError);
        throw selectError;
      }

      if (existingProfile) {
        this.profileExists.add(userId); // Cache the result
        return;
      }

      // Get user info from auth to create profile
      const { data: { user }, error: authError } = await this.getSupabase().auth.getUser();
      
      if (authError) {
        console.error('Error getting auth user:', authError);
        throw authError;
      }

      if (!user) {
        throw new Error('No authenticated user found');
      }

      if (user.id !== userId) {
        throw new Error(`User ID mismatch: auth user ${user.id} vs requested ${userId}`);
      }

      // Create profile
      const profileData = {
        id: userId,
        email: user.email,
        name: user.email?.split('@')[0] || 'User',
        favorite_genres: [],
        theme: 'dark',
        notifications: true,
      };

      const { data: insertData, error: insertError } = await this.getSupabase()
        .from('profiles')
        .insert(profileData)
        .select();

      if (insertError) {
        console.error('Error creating profile:', insertError);
        console.error('Error code:', insertError.code);
        console.error('Error message:', insertError.message);
        console.error('Error details:', insertError.details);
        console.error('Error hint:', insertError.hint);
        throw insertError;
      }

      this.profileExists.add(userId); // Cache the newly created profile
    } catch (error) {
      console.error('Error ensuring profile exists:', error);
      throw error;
    }
  }

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
      const dbUpdates: ProfileDbRow = {};

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

      const mappedData = data.map((item: WatchlistRow) => ({
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

      return mappedData;
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return [];
    }
  }

  async addToWatchlist(userId: string, movie: Movie, status: 'want_to_watch' | 'watched' | 'watch_later' = 'want_to_watch'): Promise<boolean> {
    try {
      // Ensure user profile exists before adding to watchlist
      await this.ensureProfileExists(userId);
      
      // Check if movie already exists in watchlist
      const { data: existingItem, error: checkError } = await this.getSupabase()
        .from('watchlist')
        .select('id, status')
        .eq('user_id', userId)
        .eq('movie_id', movie.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing watchlist item:', checkError);
        throw checkError;
      }

      // If movie already exists, update it instead of inserting
      if (existingItem) {
        return await this.updateWatchlistItem(userId, existingItem.id, { status });
      }

      // Movie doesn't exist, proceed with insert
      const insertData = {
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
      };

      const { data, error } = await this.getSupabase()
        .from('watchlist')
        .insert(insertData)
        .select();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      return false;
    }
  }

  async updateWatchlistItem(userId: string, itemId: string, updates: Partial<WatchlistItem>): Promise<boolean> {
    try {
      const dbUpdates: WatchlistDbUpdates = {};

      if (updates.status) dbUpdates.status = updates.status;
      if (updates.personalRating !== undefined) dbUpdates.personal_rating = updates.personalRating;
      if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
      if (updates.dateWatched) dbUpdates.date_watched = updates.dateWatched;
      if (updates.whereWatched !== undefined) dbUpdates.where_watched = updates.whereWatched;

      const { data, error } = await this.getSupabase()
        .from('watchlist')
        .update(dbUpdates)
        .eq('id', itemId)
        .eq('user_id', userId)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating watchlist item:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
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