import { FolderTree, Kanban, Link2, Rocket } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { routes } from '../../app/routes';
import { Card } from '../../components/ui/Card';
import { usePlanejarProjection } from '../../store/planejar';

const planejarRoutes = [
  { label: 'Backlog', path: routes.planejarBacklog, icon: FolderTree },
  { label: 'Prioridades', path: routes.planejarPrioridades, icon: Kanban },
  { label: 'Dependencias', path: routes.planejarDependencias, icon: Link2 },
  { label: 'Prontos', path: routes.planejarProntos, icon: Rocket },
] as const;

export function PlanejarHomePage() {
  const projection = usePlanejarProjection();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">Planejar</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]">Backlog, prioridade e transicao para Fazer</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Planejar define backlog, horizonte, dependencias bloqueantes, elegibilidade e o recorte pronto para execucao.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card className="p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Elegiveis</p>
          <p className="mt-3 text-3xl font-bold">{projection.summary.eligibleCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Backlog</p>
          <p className="mt-3 text-3xl font-bold">{projection.summary.backlogCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Bloqueados</p>
          <p className="mt-3 text-3xl font-bold">{projection.summary.blockedCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Prontos para Fazer</p>
          <p className="mt-3 text-3xl font-bold">{projection.summary.readyCount}</p>
        </Card>
      </div>

      <Card className="p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Prioridade basica desta fase</p>
        <p className="mt-3 text-sm font-semibold text-[var(--text)]">{projection.summary.priorityRule}</p>
      </Card>

      <div className="flex flex-wrap gap-2 rounded-3xl border border-[var(--border)] bg-white p-2">
        {planejarRoutes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
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
