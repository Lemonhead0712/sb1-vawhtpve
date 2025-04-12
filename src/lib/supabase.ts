import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage,
    storageKey: 'supabase.auth.token',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// ✅ Get current authenticated user (safe session check)
export async function getUser() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) throw new Error('No active session');

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    return user ?? null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// ✅ Sign in user
export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
}

// ✅ Sign up user
export async function signUp(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
}

// ✅ Sign out and delete user's analysis results
export async function signOut() {
  try {
    const user = await getUser();
    if (user) {
      await supabase.from('analysis_results').delete().eq('user_id', user.id);
    }

    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw signOutError;

    localStorage.removeItem('supabase.auth.token');
  } catch (error) {
    console.error('Error signing out and cleaning data:', error);
    throw error;
  }
}

// ✅ Update user profile
export async function updateProfile(userId: string, updates: any) {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates, updated_at: new Date().toISOString() });

    if (error) throw error;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

// ✅ Upload avatar image
export async function uploadAvatar(userId: string, file: File) {
  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl }, error: urlError } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    if (urlError) throw urlError;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
}

// ✅ Fetch profile
export async function getProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error;
  }
}

// ✅ Refresh session
export async function refreshSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (!session) {
      const { data: { session: refreshedSession }, error: refreshError } =
        await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;
      return refreshedSession?.user ?? null;
    }

    return session.user;
  } catch (error) {
    console.error('Error refreshing session:', error);
    return null;
  }
}
