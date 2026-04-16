import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import { onAuthStateChange } from '../../services/auth';
import { useAuthStore } from '../../store';

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const { session, loading, initialize, setSession } = useAuthStore();

  useEffect(() => {
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

export function useAuth() {
  return useContext(AuthContext);
}
