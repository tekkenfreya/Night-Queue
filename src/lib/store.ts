import { configureStore } from '@reduxjs/toolkit';
import moviesReducer from './slices/moviesSlice';
import watchlistReducer from './slices/watchlistSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    movies: moviesReducer,
    watchlist: watchlistReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;