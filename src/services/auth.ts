import type { Session, User } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';

export async function signUp(email: string, password: string, displayName?: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName },
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
  const supabase = getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getUser(): Promise<User | null> {
  const supabase = getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requestPasswordReset(email: string) {
  const supabase = getSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(password: string) {
  const supabase = getSupabase();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}

export function onAuthStateChange(callback: (session: Session | null) => void) {
  const supabase = getSupabase();
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
