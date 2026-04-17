import type { PropsWithChildren } from 'react';
import { Bot, FileText, Menu, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { routes } from './routes';
import { BottomTabs } from '../components/navigation/BottomTabs';
import { FloatingButtons } from '../components/navigation/FloatingButtons';
import { PageTransition } from '../components/motion/PageTransition';
import { Button } from '../components/ui/Button';
import { useIA } from '../features/ia/useIA';

export function AppLayout({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const location = useLocation();
  const { openChat, openReports } = useIA();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">Órbita</p>
            <h1 className="text-xl font-bold tracking-[-0.03em]">Sistema operacional pessoal</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" ariaLabel="Buscar">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" ariaLabel="Relatorios de IA" onClick={openReports}>
              <FileText className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" ariaLabel="IA mockada" onClick={openChat}>
              <Bot className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" ariaLabel="Central" onClick={() => navigate(routes.central)}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6">
        <PageTransition key={location.pathname}>{children}</PageTransition>
      </main>

      <FloatingButtons />
      <BottomTabs />
    </div>
  );
}
