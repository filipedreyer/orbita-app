import { Archive, BookOpenText, FileStack, Inbox, Link2, Paperclip, Search, Shapes } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { routes } from '../../app/routes';

const memoryRoutes = [
  { label: 'Home', path: routes.memoria, icon: BookOpenText, end: true },
  { label: 'Inbox', path: routes.memoriaInbox, icon: Inbox },
  { label: 'Itens', path: routes.memoriaItens, icon: Search },
  { label: 'Caixola', path: routes.memoriaCaixola, icon: FileStack },
  { label: 'Atalhos', path: routes.memoriaAtalhos, icon: Link2 },
  { label: 'Templates', path: routes.memoriaTemplates, icon: Shapes },
  { label: 'Arquivados', path: routes.memoriaArquivados, icon: Archive },
  { label: 'Anexos', path: routes.memoriaAnexos, icon: Paperclip },
] as const;

export function MemoriaLayout() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">Memória</p>
        <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]">Caixola, inbox e recuperação</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
          A Memória nasce como um hub navegável: capturar, reencontrar, arquivar e escrever notas com o mesmo editor.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-3xl border border-[var(--border)] bg-white p-2">
        {memoryRoutes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            end={'end' in route ? route.end : undefined}
            className={({ isActive }) =>
              `inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                isActive ? 'bg-[var(--teal-light)] text-[var(--teal)]' : 'text-[var(--text-secondary)]'
              }`
            }
          >
            <route.icon className="h-4 w-4" />
            {route.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
