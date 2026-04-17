import { Flag, FolderKanban, HeartPulse, ShieldCheck } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { Card } from '../../components/ui';
import { routes } from '../../app/routes';

const cards = [
  { label: 'Metas', path: routes.planejarMetas, icon: Flag, description: 'Direção e resultados de médio prazo.' },
  { label: 'Projetos', path: routes.planejarProjetos, icon: FolderKanban, description: 'Frentes concretas que precisam de avanço.' },
  { label: 'Hábitos', path: routes.planejarHabitos, icon: HeartPulse, description: 'Ciclos recorrentes que sustentam o sistema.' },
  { label: 'Inegociáveis', path: routes.planejarInegociaveis, icon: ShieldCheck, description: 'Restrições e proteções estruturais.' },
] as const;

export function PlanearHomePage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">Planejar</p>
        <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]">Portfólio do sistema</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
          Este é o hub-esqueleto da Fase 4. O detalhamento de Metas, Projetos, Hábitos e Inegociáveis entra apenas na Fase 5.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <NavLink key={card.path} to={card.path}>
            {({ isActive }) => (
              <Card className={`space-y-3 p-4 transition ${isActive ? 'border-[var(--teal)] bg-[var(--teal-light)]' : ''}`}>
                <card.icon className="h-5 w-5 text-[var(--teal)]" />
                <p className="text-lg font-semibold">{card.label}</p>
                <p className="text-sm text-[var(--text-secondary)]">{card.description}</p>
              </Card>
            )}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
