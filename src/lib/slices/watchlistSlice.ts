import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { WatchlistItem, Movie } from '@/types';

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
  },
});

export const { 
  addToWatchlist, 
  removeFromWatchlist, 
  updateWatchlistItem, 
  markAsWatched, 
  clearWatchlist 
} = watchlistSlice.actions;

export default watchlistSlice.reducer;