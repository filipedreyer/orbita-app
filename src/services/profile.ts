import { supabase } from '../lib/supabase';

export interface RitualOrderSettings {
  date: string;
  ids: string[];
}

export interface ProfileSettingsRecord {
  homeScreen?: 'today';
  theme?: 'auto' | 'light' | 'dark';
  silenceStart?: string;
  silenceEnd?: string;
  weeklyReportDay?: string;
  ritualOrder?: RitualOrderSettings | null;
  [key: string]: unknown;
}

export async function fetchProfileSettings(userId: string): Promise<ProfileSettingsRecord> {
  const { data, error } = await supabase.from('profiles').select('settings').eq('id', userId).single();
  if (error) throw error;
  return (data?.settings as ProfileSettingsRecord) ?? {};
}

export async function updateProfileSettings(userId: string, settings: ProfileSettingsRecord): Promise<ProfileSettingsRecord> {
  const { data, error } = await supabase.from('profiles').update({ settings }).eq('id', userId).select('settings').single();
  if (error) throw error;
  return (data?.settings as ProfileSettingsRecord) ?? settings;
}
