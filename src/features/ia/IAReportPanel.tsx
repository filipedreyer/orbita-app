import { useEffect, useMemo, useState } from 'react';
import { Button, Card } from '../../components/ui';
import { shiftLocalDate, today } from '../../lib/dates';
import type { Item } from '../../lib/types';
import { useDataStore } from '../../store';
import { deriveHojeDomain } from '../fazer/domain/derived';
import { derivePlanejarPortfolio } from '../planejar/domain/derived';
import { reportHojeWithAI } from './reportHoje';
import { reportPlanejarWithAI } from './reportPlanejar';
import { reportRevisaoWithAI } from './reportRevisao';
import { reportTimelineWithAI } from './reportTimeline';
import type { IAReportBlock, IARouteContext } from './types';

function shiftDay(date: string, days: number) {
  return shiftLocalDate(date, days);
}

function getExecutionLinkState(item: Item, itemsById: Map<string, Item>) {
  return Boolean(
    (item.goal_id && itemsById.has(item.goal_id)) ||
      (item.project_id && itemsById.has(item.project_id)) ||
      item.type === 'habito' ||
      item.type === 'rotina' ||
      item.type === 'inegociavel',
  );
}

function getDaySignal(count: number, operationalHours: number): 'balanced' | 'loaded' | 'overloaded' {
  if (count > operationalHours + 1) return 'overloaded';
  if (count >= operationalHours) return 'loaded';
  return 'balanced';
}

export function IAReportPanel({ context, active }: { context: IARouteContext; active: boolean }) {
  const items = useDataStore((state) => state.items);
  const referenceDate = today();
  const hoje = useMemo(() => deriveHojeDomain(items, referenceDate), [items, referenceDate]);
  const portfolio = useMemo(() => derivePlanejarPortfolio(items, referenceDate), [items, referenceDate]);
  const itemsById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(context.reports[0]?.id ?? null);
  const [reportBlocks, setReportBlocks] = useState<Record<string, { blocks: IAReportBlock[] } | null>>({});

  const executionLinkSummary = useMemo(() => {
    const linkedCount = hoje.focusItems.filter((item) => getExecutionLinkState(item, itemsById)).length;
    return {
      linkedCount,
      standaloneCount: hoje.focusItems.length - linkedCount,
    };
  }, [hoje.focusItems, itemsById]);

  const nearbyDays = useMemo(
    () =>
      Array.from({ length: 3 }, (_, index) => {
        const date = shiftDay(referenceDate, index + 1);
        const scheduledCount = items.filter(
          (item) => item.status === 'active' && item.due_date === date && item.type !== 'evento' && item.type !== 'lembrete',
        ).length;

        return {
          date,
          signal: getDaySignal(scheduledCount, hoje.capacity.operationalHours),
          scheduledCount,
        };
      }),
    [hoje.capacity.operationalHours, items, referenceDate],
  );

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    async function loadReports() {
      const nextEntries = await Promise.all(
        context.reports.map(async (report) => {
          if (report.id === 'reportHoje') {
            const result = await reportHojeWithAI({
              capacity: {
                signal: getDaySignal(hoje.focusItems.length, hoje.capacity.operationalHours),
                focusCount: hoje.focusItems.length,
                overdueCount: hoje.overdueItems.length,
              },
              execution: {
                agoraCount: hoje.focusItems.filter((item) => item.due_date === referenceDate || item.priority === 'alta').length,
                cabeCount: hoje.focusItems.filter((item) => item.due_date !== referenceDate && item.priority !== 'alta').length,
                atencaoCount: hoje.overdueItems.length,
              },
              direction: executionLinkSummary,
            });
            return [report.id, result] as const;
          }

          if (report.id === 'reportTimeline') {
            const result = await reportTimelineWithAI({
              selectedDay: {
                date: referenceDate,
                signal: getDaySignal(hoje.focusItems.length, hoje.capacity.operationalHours),
                itemCount: hoje.focusItems.length,
                operationalHours: hoje.capacity.operationalHours,
              },
              nearbyDays,
              constraints: {
                fixedInegociaveisCount: hoje.fixedInegociaveis.length,
                blockedInegociaveisCount: hoje.blockedInegociaveis.length,
              },
            });
            return [report.id, result] as const;
          }

          if (report.id === 'reportPlanejar') {
            const result = await reportPlanejarWithAI({
              structure: {
                goalsCount: portfolio.goals.length,
                projectsCount: portfolio.projects.length,
                habitsCount: portfolio.habits.length,
                inegociaveisCount: portfolio.inegociaveis.length,
              },
              distribution: {
                goalsWithProjects: portfolio.goals.filter((goal) => (portfolio.projectsByGoal.get(goal.id) ?? []).length > 0).length,
                projectsWithTasks: portfolio.projects.filter((project) => (portfolio.tasksByProject.get(project.id) ?? []).length > 0).length,
                habitsActiveCount: portfolio.habits.length,
              },
              gaps: {
                goalsWithoutProjects: portfolio.goals.filter((goal) => (portfolio.projectsByGoal.get(goal.id) ?? []).length === 0).length,
                projectsWithoutTasks: portfolio.projects.filter((project) => (portfolio.tasksByProject.get(project.id) ?? []).length === 0).length,
              },
            });
            return [report.id, result] as const;
          }

          if (report.id === 'reportRevisao') {
            const result = await reportRevisaoWithAI({
              weekly: {
                completedThisWeek: portfolio.weeklyReview.completedThisWeek,
                overdueOpenCount: portfolio.weeklyReview.overdueOpenCount,
                activeCount: items.filter((item) => item.status === 'active').length,
              },
              portfolio: {
                goalsCount: portfolio.goals.length,
                projectsCount: portfolio.projects.length,
                habitsCount: portfolio.habits.length,
                inegociaveisCount: portfolio.inegociaveis.length,
              },
              balance: executionLinkSummary,
            });
            return [report.id, result] as const;
          }

          return [report.id, null] as const;
        }),
      );

      if (!cancelled) {
        setReportBlocks(Object.fromEntries(nextEntries));
      }
    }

    void loadReports();

    return () => {
      cancelled = true;
    };
  }, [active, context.reports, executionLinkSummary, hoje, items, nearbyDays, portfolio, referenceDate]);

  const activeReport = context.reports.find((report) => report.id === selectedReportId) ?? context.reports[0] ?? null;
  const activeBlocks = activeReport ? reportBlocks[activeReport.id]?.blocks ?? [] : [];

  if (context.reports.length === 0) {
    return (
      <Card className="p-4">
        <p className="text-sm text-[var(--text-secondary)]">Nenhum relatorio contextual disponivel nesta superficie.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-[var(--text)]">{context.routeLabel}</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Relatorios sao leitura interna da Idea e nao executam mudancas.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {context.reports.map((report) => (
          <Button
            key={report.id}
            variant={report.id === activeReport?.id ? 'primary' : 'ghost'}
            onClick={() => setSelectedReportId(report.id)}
          >
            {report.title}
          </Button>
        ))}
      </div>

      {activeReport && activeBlocks.length > 0 ? (
        <div className="space-y-3">
          {activeBlocks.map((block) => (
            <Card key={`${block.type}:${block.title}`} className="space-y-2 p-4">
              <p className="text-sm font-semibold text-[var(--text)]">{block.title}</p>
              <p className="text-sm text-[var(--text-secondary)]">{block.description}</p>
            </Card>
          ))}
        </div>
      ) : activeReport ? (
        <Card className="p-4">
          <p className="text-sm text-[var(--text-secondary)]">Relatorio indisponivel agora.</p>
        </Card>
      ) : null}
    </div>
  );
}

