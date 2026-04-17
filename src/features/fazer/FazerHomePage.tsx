import { Moon, Siren, Sparkles, Waypoints } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { routes } from '../../app/routes';
import { Button } from '../../components/ui/Button';
import { OnboardingChecklist } from '../onboarding/OnboardingChecklist';

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
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]">Execucao diaria</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Hoje, Ritual, Encerramento, Painel de Atencao e Timeline compartilham uma base operacional unica.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate(routes.fazerAtencao)}>
            <Siren className="h-4 w-4" />
            Atencao
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

      <OnboardingChecklist
        area="fazer"
        title="Como operar o dia no Orbita"
        description="Use o Ritual para decidir a sequencia, Hoje para executar e Encerramento para fechar o ciclo sem ambiguidade."
        primaryLabel="Abrir Ritual"
        onPrimaryAction={() => navigate(routes.fazerRitual)}
        steps={[
          { title: 'Ritual', description: 'Revise a carga do dia e ajuste a ordem manual.' },
          { title: 'Hoje', description: 'Execute a lista do dia com feedback e undo visivel.' },
          { title: 'Encerramento', description: 'Registre o diario e feche o dia com contexto.' },
        ]}
      />

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
