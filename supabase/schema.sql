-- ============================================
-- Moodify Database Schema & RLS Policies
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Profiles Table (Linked to Auth Users)
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  preferred_moods TEXT[] DEFAULT '{}',
  preferred_genres TEXT[] DEFAULT '{}',
  preferred_languages TEXT[] DEFAULT '{}',
  reduced_motion BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile." ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to automatically create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- 2. Liked Songs
-- ============================================
CREATE TABLE public.liked_songs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  song_id TEXT NOT NULL, -- The provider ID (e.g. Deezer track ID)
  song_data JSONB NOT NULL, -- Cached song metadata to restore library without hitting API
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, song_id) -- Prevent duplicates
);

ALTER TABLE public.liked_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own liked songs." ON public.liked_songs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own liked songs." ON public.liked_songs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own liked songs." ON public.liked_songs FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 3. Recently Played
-- ============================================
CREATE TABLE public.recently_played (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  song_id TEXT NOT NULL,
  song_data JSONB NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.recently_played ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own recently played." ON public.recently_played FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recently played." ON public.recently_played FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recently played." ON public.recently_played FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own recently played." ON public.recently_played FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. Playlists
-- ============================================
CREATE TABLE public.playlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT false,
  mood TEXT,
  is_vibe_mix BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own playlists." ON public.playlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own playlists." ON public.playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own playlists." ON public.playlists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own playlists." ON public.playlists FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. Playlist Songs (Many-to-Many)
-- ============================================
CREATE TABLE public.playlist_songs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  playlist_id UUID REFERENCES public.playlists(id) ON DELETE CASCADE NOT NULL,
  song_id TEXT NOT NULL,
  song_data JSONB NOT NULL,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  UNIQUE(playlist_id, song_id)
);

ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

-- Users can only modify songs in playlists they own
CREATE POLICY "Users can read songs in own playlists." ON public.playlist_songs 
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_songs.playlist_id AND p.user_id = auth.uid())
  );
  
CREATE POLICY "Users can insert songs to own playlists." ON public.playlist_songs 
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.user_id = auth.uid())
  );
  
CREATE POLICY "Users can update songs in own playlists." ON public.playlist_songs 
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.user_id = auth.uid())
  );

CREATE POLICY "Users can delete songs from own playlists." ON public.playlist_songs 
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.playlists p WHERE p.id = playlist_id AND p.user_id = auth.uid())
  );

-- ============================================
-- 6. Saved Albums & Followed Artists
-- ============================================
CREATE TABLE public.saved_albums (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  album_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, album_id)
);

ALTER TABLE public.saved_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own saved albums." ON public.saved_albums FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved albums." ON public.saved_albums FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved albums." ON public.saved_albums FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.followed_artists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  artist_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, artist_id)
);

ALTER TABLE public.followed_artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own followed artists." ON public.followed_artists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own followed artists." ON public.followed_artists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own followed artists." ON public.followed_artists FOR DELETE USING (auth.uid() = user_id);
