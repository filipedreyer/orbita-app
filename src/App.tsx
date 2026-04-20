import { AppRouter } from './app/AppRouter';
import { ConfigurationErrorScreen } from './app/ConfigurationErrorScreen';
import { isSupabaseConfigured } from './lib/supabase';

export default function App() {
  if (!isSupabaseConfigured) {
    return <ConfigurationErrorScreen />;
  }

  return <AppRouter />;
}
