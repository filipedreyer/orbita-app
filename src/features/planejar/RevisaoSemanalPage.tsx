import { CalendarClock, Flag, FolderKanban, HeartPulse, ShieldCheck } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Card, ProgressBar } from '../../components/ui';
import { routes } from '../../app/routes';
import { usePlanejarPortfolio } from '../../store/planejar';

const links = [
  { label: 'Metas', path: routes.planejarMetas, icon: Flag },
  { label: 'Projetos', path: routes.planejarProjetos, icon: FolderKanban },
  { label: 'Habitos', path: routes.planejarHabitos, icon: HeartPulse },
  { label: 'Inegociaveis', path: routes.planejarInegociaveis, icon: ShieldCheck },
] as const;

export function RevisaoSemanalPage() {
  const portfolio = usePlanejarPortfolio();
  const completionRatio =
    portfolio.weeklyReview.projectsCount > 0
      ? Math.min(100, Math.round((portfolio.weeklyReview.completedThisWeek / portfolio.weeklyReview.projectsCount) * 100))
      : 0;

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-[var(--teal-light)] p-3 text-[var(--teal)]">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Revisao semanal</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Agregacao simples de metas, projetos, habitos e inegociaveis para revisar o sistema antes de voltar ao planejamento.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="space-y-2 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Metas ativas</p>
          <p className="text-3xl font-bold">{portfolio.weeklyReview.goalsCount}</p>
        </Card>
        <Card className="space-y-2 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Projetos ativos</p>
          <p className="text-3xl font-bold">{portfolio.weeklyReview.projectsCount}</p>
        </Card>
        <Card className="space-y-2 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Habitos ativos</p>
          <p className="text-3xl font-bold">{portfolio.weeklyReview.habitsCount}</p>
        </Card>
        <Card className="space-y-2 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Inegociaveis</p>
          <p className="text-3xl font-bold">{portfolio.weeklyReview.inegociaveisCount}</p>
        </Card>
      </div>

      <Card className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">Leitura rapida da semana</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {portfolio.weeklyReview.completedThisWeek} itens concluidos e {portfolio.weeklyReview.overdueOpenCount} tarefas atrasadas em aberto.
            </p>
          </div>
          <p className="text-lg font-semibold text-[var(--teal)]">{completionRatio}%</p>
        </div>
        <ProgressBar value={completionRatio} />
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {links.map((link) => (
          <NavLink key={link.path} to={link.path}>
            <Card className="space-y-2 p-4 transition hover:border-[var(--teal)]">
              <link.icon className="h-4 w-4 text-[var(--teal)]" />
              <p className="font-semibold">{link.label}</p>
              <p className="text-sm text-[var(--text-secondary)]">Abrir a area para revisar e ajustar o portfolio.</p>
            </Card>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
