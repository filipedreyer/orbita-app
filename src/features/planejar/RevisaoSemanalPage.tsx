import { CalendarClock, Flag, FolderKanban, HeartPulse, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Card, ProgressBar } from '../../components/ui';
import { routes } from '../../app/routes';
import { readSystemReviewWithAI } from '../ia/reviewSystem';
import type { Item } from '../../lib/types';
import { useDataStore } from '../../store';
import { useHojeDomain } from '../../store/fazer';
import { usePlanejarPortfolio } from '../../store/planejar';

const links = [
  { label: 'Metas', path: routes.planejarMetas, icon: Flag },
  { label: 'Projetos', path: routes.planejarProjetos, icon: FolderKanban },
  { label: 'Habitos', path: routes.planejarHabitos, icon: HeartPulse },
  { label: 'Inegociaveis', path: routes.planejarInegociaveis, icon: ShieldCheck },
] as const;

export function RevisaoSemanalPage() {
  const items = useDataStore((state) => state.items);
  const portfolio = usePlanejarPortfolio();
  const hojeDomain = useHojeDomain();
  const [systemReading, setSystemReading] = useState<string | null>(null);
  const completionRatio =
    portfolio.weeklyReview.projectsCount > 0
      ? Math.min(100, Math.round((portfolio.weeklyReview.completedThisWeek / portfolio.weeklyReview.projectsCount) * 100))
      : 0;

  const postponedNeedingRevisit = items.filter((item) => {
    if (item.status === 'done' || item.status === 'archived') return false;
    const metadata = (item.metadata || {}) as Record<string, unknown>;
    return metadata.inbox_postponed === true && metadata.inbox_needs_revisit === true;
  });

  const goalsWithoutExecution = portfolio.goals.filter((goal) => {
    const hasExecution = items.some(
      (item) =>
        item.status === 'active' &&
        item.goal_id === goal.id &&
        (item.type === 'tarefa' || item.type === 'rotina' || item.type === 'habito' || item.type === 'projeto'),
    );
    return !hasExecution;
  });

  const projectsWithoutExecution = portfolio.projects.filter((project) => {
    const hasNextStep = items.some((item) => item.status === 'active' && item.type === 'tarefa' && item.project_id === project.id);
    return !hasNextStep;
  });

  const habitsWithoutExecution = portfolio.habits.filter(
    (habit) => !hojeDomain.focusItems.some((item) => item.id === habit.id),
  );

  const inegociaveisWithoutReflection = portfolio.inegociaveis.filter(
    (item) =>
      !hojeDomain.fixedInegociaveis.some((entry) => entry.id === item.id) &&
      !hojeDomain.capacityOnlyInegociaveis.some((entry) => entry.id === item.id),
  );

  const activeHojeItems = hojeDomain.focusItems;
  const standaloneExecution = activeHojeItems.filter((item) => !item.goal_id && !item.project_id && item.type !== 'habito' && item.type !== 'rotina' && item.type !== 'inegociavel');
  const directionLinkedExecution = activeHojeItems.filter((item) => !standaloneExecution.some((entry) => entry.id === item.id));

  const longInactiveItems = items.filter((item) => {
    if (item.status !== 'active' && item.status !== 'paused') return false;
    if (item.due_date) return false;
    const metadata = (item.metadata || {}) as Record<string, unknown>;
    if (metadata.inbox_needs_revisit === true) return false;
    const ageMs = Date.now() - new Date(item.updated_at || item.created_at).getTime();
    return ageMs > 14 * 24 * 60 * 60 * 1000;
  });

  const attentionItems = [
    ...hojeDomain.overdueItems,
    ...postponedNeedingRevisit,
    ...longInactiveItems,
  ].filter((item, index, collection) => collection.findIndex((entry) => entry.id === item.id) === index);

  const reviewPayload = useMemo(() => ({
    execution: {
      activeCount: activeHojeItems.length,
      completedRecent: portfolio.weeklyReview.completedThisWeek,
      standaloneCount: standaloneExecution.length,
      linkedCount: directionLinkedExecution.length,
    },
    risk: {
      overdueCount: hojeDomain.overdueItems.length,
      staleCount: longInactiveItems.length,
      postponedCount: postponedNeedingRevisit.length,
    },
    direction: {
      goalsWithoutExecution: goalsWithoutExecution.length,
      projectsWithoutSteps: projectsWithoutExecution.length,
      habitsNotReflected: habitsWithoutExecution.length,
    },
  }), [
    activeHojeItems.length,
    directionLinkedExecution.length,
    goalsWithoutExecution.length,
    habitsWithoutExecution.length,
    hojeDomain.overdueItems.length,
    longInactiveItems.length,
    portfolio.weeklyReview.completedThisWeek,
    postponedNeedingRevisit.length,
    projectsWithoutExecution.length,
    standaloneExecution.length,
  ]);

  useEffect(() => {
    let cancelled = false;
    setSystemReading(null);

    async function loadSystemReading() {
      const reading = await readSystemReviewWithAI(reviewPayload);
      if (!cancelled && reading) {
        setSystemReading(reading);
      }
    }

    void loadSystemReading();

    return () => {
      cancelled = true;
    };
  }, [reviewPayload]);

  function renderSimpleList(sectionItems: Item[], emptyLabel: string) {
    if (sectionItems.length === 0) {
      return <p className="text-sm text-[var(--text-secondary)]">{emptyLabel}</p>;
    }

    return (
      <div className="space-y-2">
        {sectionItems.slice(0, 5).map((item) => (
          <div key={item.id} className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            <p className="font-medium text-[var(--text)]">{item.title}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--text-tertiary)]">{item.type}</p>
          </div>
        ))}
        {sectionItems.length > 5 ? (
          <p className="text-xs text-[var(--text-tertiary)]">+ {sectionItems.length - 5} itens adicionais</p>
        ) : null}
      </div>
    );
  }

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

      {systemReading ? (
        <Card className="space-y-3 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Leitura sistêmica de IA</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--text-secondary)]">{systemReading}</p>
            </div>
          </div>
        </Card>
      ) : null}

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
        <Card className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Adiados que precisam voltar</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Itens que saíram da Inbox como adiados, mas ainda carregam necessidade de revisão.</p>
            </div>
            <div className="rounded-[var(--radius-pill)] border border-[var(--warning)]/25 bg-[var(--warning)]/10 px-3 py-1 text-sm font-semibold text-[var(--text)]">
              {postponedNeedingRevisit.length}
            </div>
          </div>
          {renderSimpleList(postponedNeedingRevisit, 'Nenhum adiado pendente de retomada agora.')}
        </Card>

        <Card className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Execução solta em excesso</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Quando a execução sem direção explícita começa a pesar mais do que a execução conectada.</p>
            </div>
            <div className={`rounded-[var(--radius-pill)] border px-3 py-1 text-sm font-semibold ${standaloneExecution.length > directionLinkedExecution.length ? 'border-[var(--warning)]/25 bg-[var(--warning)]/10 text-[var(--text)]' : 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]'}`}>
              {standaloneExecution.length} soltos · {directionLinkedExecution.length} ligados
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            {standaloneExecution.length > directionLinkedExecution.length
              ? 'A execução do dia está mais solta do que conectada à direção.'
              : 'A execução ligada à direção ainda sustenta a maior parte do dia.'}
          </p>
          {renderSimpleList(standaloneExecution, 'Não há execução solta relevante no momento.')}
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-4 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Direção sem execução</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">O portfólio já mostra onde existe direção sem tração concreta em Fazer.</p>
            </div>
            <div className="rounded-[var(--radius-pill)] border border-[var(--warning)]/25 bg-[var(--warning)]/10 px-3 py-1 text-sm font-semibold text-[var(--text)]">
              {goalsWithoutExecution.length + projectsWithoutExecution.length + habitsWithoutExecution.length + inegociaveisWithoutReflection.length}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Metas</p>
              <p className="mt-2 text-2xl font-bold text-[var(--text)]">{goalsWithoutExecution.length}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">sem execução ativa</p>
            </div>
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Projetos</p>
              <p className="mt-2 text-2xl font-bold text-[var(--text)]">{projectsWithoutExecution.length}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">sem próximos passos</p>
            </div>
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Hábitos</p>
              <p className="mt-2 text-2xl font-bold text-[var(--text)]">{habitsWithoutExecution.length}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">sem reflexo em Hoje</p>
            </div>
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Inegociáveis</p>
              <p className="mt-2 text-2xl font-bold text-[var(--text)]">{inegociaveisWithoutReflection.length}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">sem reflexo no dia</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-3 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Itens em atenção</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Riscos já conhecidos pelo sistema: atraso, inércia e adiamentos ainda sem volta.</p>
            </div>
            <div className="rounded-[var(--radius-pill)] border border-[var(--danger)]/25 bg-[var(--danger)]/10 px-3 py-1 text-sm font-semibold text-[var(--text)]">
              {attentionItems.length}
            </div>
          </div>
          {renderSimpleList(attentionItems, 'Nenhum item em atenção destacado agora.')}
        </Card>
      </div>

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
