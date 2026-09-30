import { supabase, hasSupabaseConfig } from './supabase';
import type { Song, Playlist } from '../types';

// ============================================
// Liked Songs
// ============================================
export async function syncLikedSong(song: Song, isLiked: boolean): Promise<void> {
  if (!hasSupabaseConfig) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  if (isLiked) {
    // Insert
    await supabase.from('liked_songs').upsert({
      user_id: session.user.id,
      song_id: song.id,
      song_data: song,
    }, { onConflict: 'user_id,song_id' });
  } else {
    // Delete
    await supabase
      .from('liked_songs')
      .delete()
      .match({ user_id: session.user.id, song_id: song.id });
  }
}

export async function getCloudLikedSongs(): Promise<Song[]> {
  if (!hasSupabaseConfig) return [];
  const { data, error } = await supabase
    .from('liked_songs')
    .select('song_data')
    .order('created_at', { ascending: false });

  if (error) return [];
  return data.map((row) => row.song_data as Song);
}

// ============================================
// Recently Played
// ============================================
export async function syncRecentlyPlayed(song: Song): Promise<void> {
  if (!hasSupabaseConfig) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  // We can just insert, and we could clean up old ones, but for now we'll just insert.
  await supabase.from('recently_played').insert({
    user_id: session.user.id,
    song_id: song.id,
    song_data: song,
  });
}

export async function getCloudRecentlyPlayed(): Promise<Song[]> {
  if (!hasSupabaseConfig) return [];
  const { data, error } = await supabase
    .from('recently_played')
    .select('song_data')
    .order('played_at', { ascending: false })
    .limit(20);

  if (error) return [];
  return data.map((row) => row.song_data as Song);
}

// ============================================
// Playlists
// ============================================
export async function syncCreatePlaylist(playlist: Playlist): Promise<void> {
  if (!hasSupabaseConfig) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  await supabase.from('playlists').insert({
    id: playlist.id,
    user_id: session.user.id,
    name: playlist.name,
    description: playlist.description,
    is_public: playlist.isPublic,
    mood: playlist.mood,
    is_vibe_mix: playlist.isVibeMix,
    created_at: playlist.createdAt,
    updated_at: playlist.updatedAt,
  });
}

export async function syncDeletePlaylist(id: string): Promise<void> {
  if (!hasSupabaseConfig) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  await supabase.from('playlists').delete().match({ user_id: session.user.id, id });
}

export async function syncRenamePlaylist(id: string, name: string): Promise<void> {
  if (!hasSupabaseConfig) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  await supabase.from('playlists').update({ name, updated_at: new Date().toISOString() }).match({ user_id: session.user.id, id });
}

export async function syncAddToPlaylist(playlistId: string, song: Song): Promise<void> {
  if (!hasSupabaseConfig) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  // We can't rely on position logic locally easily, so we just append
  await supabase.from('playlist_songs').insert({
    playlist_id: playlistId,
    song_id: song.id,
    song_data: song,
  });
}

export async function syncRemoveFromPlaylist(playlistId: string, songId: string): Promise<void> {
  if (!hasSupabaseConfig) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  await supabase.from('playlist_songs').delete().match({ playlist_id: playlistId, song_id: songId });
}

export async function getCloudPlaylists(): Promise<Playlist[]> {
  if (!hasSupabaseConfig) return [];
  const { data, error } = await supabase
    .from('playlists')
    .select('*, playlist_songs(song_id)')
    .order('created_at', { ascending: true });

  if (error || !data) return [];
  
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    coverUrl: row.cover_url,
    songs: row.playlist_songs ? row.playlist_songs.map((ps: any) => ps.song_id) : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isPublic: row.is_public,
    createdBy: row.user_id,
    mood: row.mood,
    isVibeMix: row.is_vibe_mix,
  }));
}

// ============================================
// Saved Albums & Followed Artists
// ============================================
export async function syncSavedAlbum(albumId: string, isSaved: boolean): Promise<void> {
  if (!hasSupabaseConfig) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  if (isSaved) {
    await supabase.from('saved_albums').upsert({ user_id: session.user.id, album_id: albumId }, { onConflict: 'user_id,album_id' });
  } else {
    await supabase.from('saved_albums').delete().match({ user_id: session.user.id, album_id: albumId });
  }
}

export async function getCloudSavedAlbums(): Promise<string[]> {
  if (!hasSupabaseConfig) return [];
  const { data, error } = await supabase.from('saved_albums').select('album_id');
  if (error) return [];
  return data.map(r => r.album_id);
}

export async function syncFollowedArtist(artistId: string, isFollowed: boolean): Promise<void> {
  if (!hasSupabaseConfig) return;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return;

  if (isFollowed) {
    await supabase.from('followed_artists').upsert({ user_id: session.user.id, artist_id: artistId }, { onConflict: 'user_id,artist_id' });
  } else {
    await supabase.from('followed_artists').delete().match({ user_id: session.user.id, artist_id: artistId });
  }
}

export async function getCloudFollowedArtists(): Promise<string[]> {
  if (!hasSupabaseConfig) return [];
  const { data, error } = await supabase.from('followed_artists').select('artist_id');
  if (error) return [];
  return data.map(r => r.artist_id);
}
