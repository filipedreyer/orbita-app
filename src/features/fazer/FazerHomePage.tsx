import { Moon, Siren, Sparkles, Waypoints } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { routes } from '../../app/routes';
import { Button } from '../../components/ui/Button';

const fazerRoutes = [
  { label: 'Hoje', path: routes.fazerHoje },
  { label: 'Timeline', path: routes.fazerTimeline },
];

export function FazerHomePage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">Fazer</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]">Execução diária</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Hoje, Ritual, Encerramento, Painel de Atenção e Timeline agora compartilham uma base de domínio explícita.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate(routes.fazerAtencao)}>
            <Siren className="h-4 w-4" />
            Atenção
          </Button>
          <Button variant="secondary" onClick={() => navigate(routes.fazerRitual)}>
            <Sparkles className="h-4 w-4" />
            Ritual
          </Button>
          <Button variant="secondary" onClick={() => navigate(routes.fazerEncerramento)}>
            <Moon className="h-4 w-4" />
            Encerramento
          </Button>
          <Button variant="ghost" onClick={() => navigate(routes.fazerTimeline)}>
            <Waypoints className="h-4 w-4" />
            Timeline
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-3xl border border-[var(--border)] bg-white p-2">
        {fazerRoutes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            className={({ isActive }) =>
              `rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                isActive ? 'bg-[var(--teal-light)] text-[var(--teal)]' : 'text-[var(--text-secondary)]'
              }`
            }
          >
            {route.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
