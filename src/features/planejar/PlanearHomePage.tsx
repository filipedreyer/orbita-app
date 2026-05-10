import { CalendarClock, Flag, FolderKanban, HeartPulse, ShieldCheck } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Button, Card } from '../../components/ui';
import { routes } from '../../app/routes';
import { IAEntryPoints } from '../ia/IAEntryPoints';
import { IAOnboarding } from '../ia/IAOnboarding';
import { useIA } from '../ia/useIA';
import { OnboardingChecklist } from '../onboarding/OnboardingChecklist';
import { PlanOnboardingBuilder } from './PlanOnboardingBuilder';

const cards = [
  { label: 'Metas', path: routes.planejarMetas, icon: Flag, description: 'Direcao e resultados de medio prazo.' },
  { label: 'Projetos', path: routes.planejarProjetos, icon: FolderKanban, description: 'Frentes concretas que precisam de avanco.' },
  { label: 'Habitos', path: routes.planejarHabitos, icon: HeartPulse, description: 'Ciclos recorrentes que sustentam o sistema.' },
  { label: 'Essencial protegido', path: routes.planejarInegociaveis, icon: ShieldCheck, description: 'Condicao aplicada ao que precisa de protecao sistemica.' },
] as const;

export function PlanearHomePage() {
  const navigate = useNavigate();
  const { routeContext } = useIA();

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">Planejar</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]">Portfolio do sistema</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Planejar segue a estrutura final da spec: Metas, Projetos, Habitos, Essencial protegido e Revisao Semanal como superficies reais.
          </p>
        </div>
        <NavLink to={routes.planejarRevisaoSemanal}>
          {({ isActive }) => (
            <Button variant={isActive ? 'primary' : 'secondary'}>
              <CalendarClock className="h-4 w-4" />
              Revisao semanal
            </Button>
          )}
        </NavLink>
      </div>

      <OnboardingChecklist
        area="planejar"
        title="Como ler o portfolio de Planejar"
        description="Comece pelas metas, desdobre em projetos, acompanhe habitos e aplique Essencial protegido como condicao, nao como entidade."
        primaryLabel="Abrir Metas"
        onPrimaryAction={() => navigate(routes.planejarMetas)}
        steps={[
          { title: 'Metas', description: 'Defina direcao e resultado esperado.' },
          { title: 'Projetos', description: 'Traga as frentes reais que movem as metas.' },
          { title: 'Revisao', description: 'Use a revisao semanal para consolidar o portfolio.' },
        ]}
      />

      <PlanOnboardingBuilder />

      <IAEntryPoints
        title="Leitura contextual de Planejar"
        description="Abre os drawers contextuais do portfolio atual, com foco em leitura e relatorios do que ja existe na camada Planejar."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <NavLink key={card.path} to={card.path}>
            {({ isActive }) => (
              <Card className={`space-y-4 p-5 transition ${isActive ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'hover:border-[var(--border-strong)]'}`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-2xl)] bg-[var(--surface)] text-[var(--accent)] shadow-[var(--shadow-card)]">
                  <card.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-[var(--text)]">{card.label}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{card.description}</p>
                </div>
              </Card>
            )}
          </NavLink>
        ))}
      </div>

      <IAOnboarding steps={routeContext.onboardingSteps} />

      <Outlet />
    </div>
  );
}
