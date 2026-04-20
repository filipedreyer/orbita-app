import { getSupabase } from '../lib/supabase';
import type { ProfileSettingsRecord } from '../lib/types';

export async function fetchProfileSettings(userId: string): Promise<ProfileSettingsRecord> {
  const { data, error } = await getSupabase().from('profiles').select('settings').eq('id', userId).single();
  if (error) throw error;
  return (data?.settings as ProfileSettingsRecord) ?? {};
}

export async function updateProfileSettings(userId: string, settings: ProfileSettingsRecord): Promise<ProfileSettingsRecord> {
  const { data, error } = await getSupabase().from('profiles').update({ settings }).eq('id', userId).select('settings').single();
  if (error) throw error;
  return (data?.settings as ProfileSettingsRecord) ?? settings;
}
