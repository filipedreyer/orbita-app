import type { PropsWithChildren } from 'react';
import { AlertCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { PageTransition } from '../components/motion/PageTransition';
import { BottomNavOlys } from '../components/navigation/BottomNavOlys';
import { FloatingActionPair } from '../components/navigation/FloatingActionPair';
import { TopBarOlys } from '../components/navigation/TopBarOlys';
import { Button } from '../components/ui/Button';

interface OlysShellProps extends PropsWithChildren {
  loading: boolean;
  error: string | null;
  onClearError: () => void;
}

export function OlysShell({ children, loading, error, onClearError }: OlysShellProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/90 backdrop-blur">
        <TopBarOlys />

        {loading ? (
          <div className="border-t border-[var(--border)] bg-[var(--surface-alt)] px-4 py-2 text-center text-xs font-medium text-[var(--text-secondary)]">
            Sincronizando dados do app...
          </div>
        ) : null}

        {error ? (
          <div className="border-t border-[var(--danger)]/20 bg-[var(--danger)]/8">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2 text-sm text-[var(--text)]">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-[var(--danger)]" />
                <span>{error}</span>
              </div>
              <Button variant="ghost" onClick={onClearError}>
                Fechar
              </Button>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-[calc(env(safe-area-inset-bottom)+9rem)] pt-6">
        <PageTransition key={location.pathname}>{children}</PageTransition>
      </main>

      <FloatingActionPair />
      <BottomNavOlys />
    </div>
  );
}
