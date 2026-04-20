import type { PropsWithChildren } from 'react';
import { AlertCircle, Bot, FileText, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { routes } from './routes';
import { BottomTabs } from '../components/navigation/BottomTabs';
import { FloatingButtons } from '../components/navigation/FloatingButtons';
import { PageTransition } from '../components/motion/PageTransition';
import { Button } from '../components/ui/Button';
import { useIA } from '../features/ia/useIA';
import { useDataStore } from '../store';

export function AppLayout({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const location = useLocation();
  const { openChat, openReports } = useIA();
  const loading = useDataStore((state) => state.loading);
  const error = useDataStore((state) => state.error);
  const clearError = useDataStore((state) => state.clearError);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">Órbita</p>
            <h1 className="text-xl font-bold tracking-[-0.03em]">Sistema operacional pessoal</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" ariaLabel="Relatorios contextuais" onClick={openReports}>
              <FileText className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" ariaLabel="Leitura contextual" onClick={openChat}>
              <Bot className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" ariaLabel="Central" onClick={() => navigate(routes.central)}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

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
              <Button variant="ghost" onClick={clearError}>
                Fechar
              </Button>
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6">
        <PageTransition key={location.pathname}>{children}</PageTransition>
      </main>

      <FloatingButtons />
      <BottomTabs />
    </div>
  );
}
