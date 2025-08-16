import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WatchlistItem, Movie } from '@/types';
import { databaseService } from '@/services/database';

interface WatchlistState {
  items: WatchlistItem[];
  loading: boolean;
  error: string | null;
}

const initialState: WatchlistState = {
  items: [],
  loading: false,
  error: null,
};

// Async thunks for database operations
export const fetchWatchlist = createAsyncThunk(
  'watchlist/fetchWatchlist',
  async (userId: string) => {
    return await databaseService.getWatchlist(userId);
  }
);

export const addToWatchlistDB = createAsyncThunk(
  'watchlist/addToWatchlistDB',
  async ({ userId, movie, status }: { userId: string; movie: Movie; status: WatchlistItem['status'] }) => {
    const success = await databaseService.addToWatchlist(userId, movie, status);
    if (!success) throw new Error('Failed to add to watchlist');
    return { movie, status };
  }
);

export const removeFromWatchlistDB = createAsyncThunk(
  'watchlist/removeFromWatchlistDB',
  async ({ userId, itemId, movieId }: { userId: string; itemId: string; movieId: number }) => {
    const success = await databaseService.removeFromWatchlist(userId, itemId);
    if (!success) throw new Error('Failed to remove from watchlist');
    return movieId;
  }
);

export const updateWatchlistItemDB = createAsyncThunk(
  'watchlist/updateWatchlistItemDB',
  async ({ userId, itemId, updates }: { userId: string; itemId: string; updates: Partial<WatchlistItem> }) => {
    const success = await databaseService.updateWatchlistItem(userId, itemId, updates);
    if (!success) throw new Error('Failed to update watchlist item');
    return { itemId, updates };
  }
);

const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    addToWatchlist: (state, action: PayloadAction<{ movie: Movie; status: WatchlistItem['status'] }>) => {
      const { movie, status } = action.payload;
      const existingItem = state.items.find(item => item.movieId === movie.id);
      
      if (!existingItem) {
        const newItem: WatchlistItem = {
          id: `${movie.id}-${Date.now()}`,
          movieId: movie.id,
          movie,
          status,
          dateAdded: new Date().toISOString(),
        };
        state.items.push(newItem);
      } else {
        existingItem.status = status;
      }
    },
    
    removeFromWatchlist: (state, action: PayloadAction<number>) => {
      state.items = state.items.filter(item => item.movieId !== action.payload);
    },
    
    updateWatchlistItem: (state, action: PayloadAction<Partial<WatchlistItem> & { id: string }>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
    
    markAsWatched: (state, action: PayloadAction<{ 
      id: string; 
      rating?: number; 
      notes?: string; 
      whereWatched?: string; 
    }>) => {
      const { id, rating, notes, whereWatched } = action.payload;
      const index = state.items.findIndex(item => item.id === id);
      if (index !== -1) {
        state.items[index].status = 'watched';
        state.items[index].dateWatched = new Date().toISOString();
        if (rating !== undefined) state.items[index].personalRating = rating;
        if (notes !== undefined) state.items[index].notes = notes;
        if (whereWatched !== undefined) state.items[index].whereWatched = whereWatched;
      }
    },
    
    clearWatchlist: (state) => {
      state.items = [];
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch watchlist
      .addCase(fetchWatchlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWatchlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchWatchlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch watchlist';
      })
      
      // Add to watchlist
      .addCase(addToWatchlistDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWatchlistDB.fulfilled, (state, action) => {
        state.loading = false;
        // Optimistically add to local state - will be replaced by next fetch
      })
      .addCase(addToWatchlistDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to add to watchlist';
      })
      
      // Remove from watchlist
      .addCase(removeFromWatchlistDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWatchlistDB.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.movieId !== action.payload);
      })
      .addCase(removeFromWatchlistDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to remove from watchlist';
      })
      
      // Update watchlist item
      .addCase(updateWatchlistItemDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWatchlistItemDB.fulfilled, (state, action) => {
        state.loading = false;
        const { itemId, updates } = action.payload;
        const index = state.items.findIndex(item => item.id === itemId);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...updates };
        }
      })
      .addCase(updateWatchlistItemDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update watchlist item';
      });
  },
});

export const { 
  addToWatchlist, 
  removeFromWatchlist, 
  updateWatchlistItem, 
  markAsWatched, 
  clearWatchlist,
  setLoading,
  setError
} = watchlistSlice.actions;

export default watchlistSlice.reducer;