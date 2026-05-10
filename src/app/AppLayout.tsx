import type { PropsWithChildren } from 'react';
import { OlysShell } from './OlysShell';
import { useDataStore } from '../store';

export function AppLayout({ children }: PropsWithChildren) {
  const loading = useDataStore((state) => state.loading);
  const error = useDataStore((state) => state.error);
  const clearError = useDataStore((state) => state.clearError);

  return (
    <OlysShell loading={loading} error={error} onClearError={clearError}>
      {children}
    </OlysShell>
  );
}
