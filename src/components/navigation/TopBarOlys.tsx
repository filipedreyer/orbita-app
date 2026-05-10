import { Inbox, Menu, Search, UserCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../app/routes';
import { useDataStore } from '../../store';
import { Button } from '../ui/Button';
import { OlysBrand } from './OlysBrand';

export function TopBarOlys() {
  const navigate = useNavigate();
  const hasInboxContext = useDataStore((state) => state.inbox.length > 0);

  return (
    <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
      <div className="flex min-w-0 items-center gap-3">
        <Button variant="ghost" size="icon" ariaLabel="Menu" onClick={() => navigate(routes.central)}>
          <Menu className="h-4 w-4" />
        </Button>
        <OlysBrand />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" ariaLabel="Acesso" onClick={() => navigate(routes.central)}>
          <UserCircle className="h-4 w-4" />
        </Button>
        <Button className="relative" variant="ghost" size="icon" ariaLabel="Inbox" onClick={() => navigate(routes.memoriaInbox)}>
          <Inbox className="h-4 w-4" />
          {hasInboxContext ? <span className="absolute right-2 top-2 h-2 w-2 rounded-[var(--radius-pill)] bg-[var(--accent)]" aria-hidden="true" /> : null}
        </Button>
        <Button variant="ghost" size="icon" ariaLabel="Busca" onClick={() => navigate(routes.memoria)}>
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
