import { createContext, useContext } from 'react';

export interface PwaContextValue {
  canInstall: boolean;
  isInstalled: boolean;
  isOfflineReady: boolean;
  isOnline: boolean;
  installApp: () => Promise<boolean>;
}

export const PwaContext = createContext<PwaContextValue | null>(null);

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error('usePwa must be used within PwaProvider');
  }
  return context;
}

