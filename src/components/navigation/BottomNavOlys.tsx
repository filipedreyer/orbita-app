import { CheckCircle2, FolderKanban, LibraryBig } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { routes } from '../../app/routes';

const bottomNavItems = [
  { label: 'Fazer', path: routes.fazer, icon: CheckCircle2 },
  { label: 'Planejar', path: routes.planejar, icon: FolderKanban },
  { label: 'Memória', path: routes.memoria, icon: LibraryBig },
] as const;

export function BottomNavOlys() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[color-mix(in_srgb,var(--surface)_95%,transparent)] pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-3 px-2">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-[var(--radius-2xl)] px-3 py-3 text-xs font-semibold transition ${
                  isActive ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-tertiary)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)]'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
