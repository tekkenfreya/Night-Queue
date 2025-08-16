-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  name TEXT,
  avatar TEXT,
  favorite_genres INTEGER[] DEFAULT '{}',
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create watchlist table (matching WatchlistItem interface)
CREATE TABLE IF NOT EXISTS public.watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id INTEGER NOT NULL,
  status TEXT DEFAULT 'want_to_watch' CHECK (status IN ('want_to_watch', 'watched', 'watch_later')),
  personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 5),
  notes TEXT,
  date_added TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_watched DATE,
  where_watched TEXT,
  -- Store movie data for quick access
  movie_title TEXT NOT NULL,
  movie_overview TEXT,
  movie_poster_path TEXT,
  movie_backdrop_path TEXT,
  movie_release_date TEXT,
  movie_vote_average DECIMAL,
  movie_vote_count INTEGER,
  movie_genre_ids INTEGER[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- RLS Policies for watchlist
CREATE POLICY "Users can view own watchlist" 
  ON public.watchlist FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to own watchlist" 
  ON public.watchlist FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlist" 
  ON public.watchlist FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from own watchlist" 
  ON public.watchlist FOR DELETE 
  USING (auth.uid() = user_id);

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_watchlist_updated_at
  BEFORE UPDATE ON public.watchlist
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();