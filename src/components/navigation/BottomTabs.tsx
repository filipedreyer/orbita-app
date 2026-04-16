import { CheckCircle2, FolderKanban, LibraryBig } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { tabRoutes } from '../../app/routes';

const icons = [CheckCircle2, FolderKanban, LibraryBig];

export function BottomTabs() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-white/95 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-3 px-2 py-2">
        {tabRoutes.map((tab, index) => {
          const Icon = icons[index];
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 rounded-2xl px-3 py-3 text-xs font-semibold transition ${
                  isActive ? 'bg-[var(--teal-light)] text-[var(--teal)]' : 'text-[var(--text-tertiary)]'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
