import type { PropsWithChildren } from 'react';
import { useEffect, useMemo } from 'react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { onAuthStateChange } from '../../services/auth';
import { useAuthStore } from '../../store';
import { AuthContext } from './AuthContext';

export function AuthProvider({ children }: PropsWithChildren) {
  const { session, loading, initialize, setSession } = useAuthStore();

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(null);
      return;
    }

    void initialize();
    const {
      data: { subscription },
    } = onAuthStateChange((nextSession) => {
      setSession(nextSession);
    });

    return () => subscription.unsubscribe();
  }, [initialize, setSession]);

  const value = useMemo(
    () => ({
      session,
      loading,
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
