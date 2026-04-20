import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const supabaseEnvError =
  'VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY precisam estar configuradas para executar o Orbita com dados reais.';

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export function getSupabase() {
  if (!supabase) {
    throw new Error(supabaseEnvError);
  }

  return supabase;
}
