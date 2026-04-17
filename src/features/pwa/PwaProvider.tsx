import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

interface PwaContextValue {
  canInstall: boolean;
  isInstalled: boolean;
  isOfflineReady: boolean;
  isOnline: boolean;
  installApp: () => Promise<boolean>;
}

function readInstalledState() {
  if (typeof window === 'undefined') return false;
  const mediaQuery = window.matchMedia('(display-mode: standalone)');
  const standaloneNavigator = navigator as NavigatorWithStandalone;
  return mediaQuery.matches || standaloneNavigator.standalone === true;
}

const PwaContext = createContext<PwaContextValue | null>(null);

export function PwaProvider({ children }: PropsWithChildren) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => readInstalledState());
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handlePrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setPromptEvent(null);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handlePrompt);
    window.addEventListener('appinstalled', handleInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value = useMemo<PwaContextValue>(
    () => ({
      canInstall: !!promptEvent && !isInstalled,
      isInstalled,
      isOfflineReady: 'serviceWorker' in navigator,
      isOnline,
      installApp: async () => {
        if (!promptEvent) return false;
        await promptEvent.prompt();
        const result = await promptEvent.userChoice;
        const accepted = result.outcome === 'accepted';
        if (accepted) {
          setPromptEvent(null);
        }
        return accepted;
      },
    }),
    [isInstalled, isOnline, promptEvent],
  );

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}

export function usePwa() {
  const context = useContext(PwaContext);
  if (!context) {
    throw new Error('usePwa must be used within PwaProvider');
  }
  return context;
}
