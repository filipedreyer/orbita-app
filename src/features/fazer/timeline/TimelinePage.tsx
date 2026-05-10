import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useActionFeedback } from '../../../components/feedback/ActionFeedbackContext';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { EntitySheetWrapper } from '../../entity/EntitySheetWrapper';
import { IASuggestCards } from '../../ia/IASuggestCards';
import { buildSuggestDayPayload, extendSuggestDayPayload, suggestDayWithAI } from '../../ia/suggest';
import type { IASuggestResult, IASuggestionItem } from '../../ia/types';
import type { Item } from '../../../lib/types';
import { shiftLocalDate } from '../../../lib/dates';
import { useDataStore } from '../../../store';
import { useHojeDomain, useHojeProjection } from '../../../store/fazer';
import {
  getCapacityStatus,
  getDependencyImpact,
  getTimelineLens,
  toAISuggestCapacitySignal,
  type TimelineLens,
} from '../domain/canonical';
import { ChainList } from './ChainList';
import { ImpactAnalysis } from './ImpactAnalysis';
import { IndentedTree } from './IndentedTree';
import { StickyCard } from './StickyCard';

function getExecutionLinkState(item: Item, itemsById: Map<string, Item>) {
  return Boolean(
    (item.goal_id && itemsById.has(item.goal_id)) ||
      (item.project_id && itemsById.has(item.project_id)) ||
      item.type === 'habito' ||
      item.type === 'rotina' ||
      item.type === 'inegociavel',
  );
}

function shiftDay(date: string, days: number) {
  return shiftLocalDate(date, days);
}

export function TimelinePage() {
  const domain = useHojeDomain();
  const projection = useHojeProjection();
  const allItems = useDataStore((state) => state.items);
  const rescheduleItem = useDataStore((state) => state.rescheduleItem);
  const updateItem = useDataStore((state) => state.updateItem);
  const [mode, setMode] = useState<TimelineLens>(getTimelineLens('calendar'));
  const [dependencyView, setDependencyView] = useState<'chains' | 'tree'>('chains');
  const [selectedChainId, setSelectedChainId] = useState<string | null>(domain.dependencyTimeline.chains[0]?.id ?? null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [timelineSuggestions, setTimelineSuggestions] = useState<IASuggestResult | null>(null);
  const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState<string[]>([]);
  const { showFeedback } = useActionFeedback();

  const effectiveSelectedChainId =
    selectedChainId && domain.dependencyTimeline.chains.some((chain) => chain.id === selectedChainId)
      ? selectedChainId
      : domain.dependencyTimeline.chains[0]?.id ?? null;

  const selectedChain = domain.dependencyTimeline.chains.find((chain) => chain.id === effectiveSelectedChainId) ?? null;
  const highlightedChainIds = useMemo(
    () => new Set(selectedChain ? selectedChain.items.map((item) => item.id) : []),
    [selectedChain],
  );

  const itemsById = useMemo(() => new Map(allItems.map((item) => [item.id, item])), [allItems]);
  const dependencySummary = useMemo(() => {
    const impacts = domain.dependencyTimeline.items.map((item) => getDependencyImpact(item, itemsById));
    return {
      blocking: impacts.filter((impact) => impact === 'blocking').length,
      unknown: impacts.filter((impact) => impact === 'unknown').length,
    };
  }, [domain.dependencyTimeline.items, itemsById]);
  const todayItems = projection.sections.focusItems;
  const calendarItems = useMemo(
    () => allItems.filter((item) => item.status === 'active' && item.due_date === domain.referenceDate),
    [allItems, domain.referenceDate],
  );

  const timelineCapacitySignal = useMemo(
    () => toAISuggestCapacitySignal(projection.timeline.capacity.signal),
    [projection.timeline.capacity.signal],
  );

  const nearbyDays = useMemo(
    () =>
      Array.from({ length: 3 }, (_, index) => {
        const date = shiftDay(domain.referenceDate, index + 1);
        const scheduledItems = allItems.filter((item) => item.status === 'active' && item.due_date === date);
        const capacity = getCapacityStatus(scheduledItems, date, projection.timeline.capacity.totalHours);

        return {
          date,
          signal: toAISuggestCapacitySignal(capacity.signal),
          status: capacity,
          scheduledCount: scheduledItems.length,
        };
      }),
    [allItems, domain.referenceDate, projection.timeline.capacity.totalHours],
  );

  const timelineSuggestPayload = useMemo(() => {
    const basePayload = buildSuggestDayPayload({
      items: todayItems,
      capacitySignal: timelineCapacitySignal,
      agoraCount: todayItems.filter((item) => item.due_date === domain.referenceDate || item.priority === 'alta').length,
      cabeCount: todayItems.filter((item) => item.due_date !== domain.referenceDate && item.priority !== 'alta').length,
      referenceDate: domain.referenceDate,
      fixedInegociaveis: domain.fixedInegociaveis,
      capacityOnlyInegociaveis: domain.capacityOnlyInegociaveis,
      blockedInegociaveis: domain.blockedInegociaveis,
      linkedResolver: (item) => ({ linked: getExecutionLinkState(item, itemsById) }),
    });

    return extendSuggestDayPayload(basePayload, { nearbyDays });
  }, [
    domain.blockedInegociaveis,
    domain.capacityOnlyInegociaveis,
    domain.fixedInegociaveis,
    domain.referenceDate,
    itemsById,
    nearbyDays,
    timelineCapacitySignal,
    todayItems,
  ]);

  const suggestedItemsById = useMemo(() => new Map(todayItems.map((item) => [item.id, item])), [todayItems]);

  const visibleTimelineSuggestions = useMemo(() => {
    if (!timelineSuggestions) return null;
    return {
      ...timelineSuggestions,
      suggestions: timelineSuggestions.suggestions.filter((suggestion) => !dismissedSuggestionIds.includes(suggestion.itemId)),
    };
  }, [dismissedSuggestionIds, timelineSuggestions]);

  const timelineNeedsReplanning = projection.timeline.capacity.signal === 'loaded' || projection.timeline.capacity.signal === 'overloaded';

  useEffect(() => {
    if (!timelineNeedsReplanning) {
      void Promise.resolve().then(() => {
        setTimelineSuggestions(null);
        setDismissedSuggestionIds([]);
      });
      return;
    }

    let cancelled = false;
    void Promise.resolve().then(() => {
      if (!cancelled) {
        setTimelineSuggestions(null);
        setDismissedSuggestionIds([]);
      }
    });

    async function loadTimelineSuggestions() {
      const result = await suggestDayWithAI(timelineSuggestPayload);
      if (!cancelled && result) {
        setTimelineSuggestions(result);
      }
    }

    void loadTimelineSuggestions();

    return () => {
      cancelled = true;
    };
  }, [timelineNeedsReplanning, timelineSuggestPayload]);

  function dismissSuggestion(suggestion: IASuggestionItem) {
    setDismissedSuggestionIds((current) => (current.includes(suggestion.itemId) ? current : [...current, suggestion.itemId]));
  }

  function handleIgnoreSuggestion(suggestion: IASuggestionItem) {
    dismissSuggestion(suggestion);
  }

  function findNearestViableDay() {
    return nearbyDays.find((day) => day.signal === 'balanced')?.date ?? nearbyDays.find((day) => day.signal === 'loaded')?.date ?? shiftDay(domain.referenceDate, 1);
  }

  async function handleApplySuggestion(suggestion: IASuggestionItem) {
    const item = suggestedItemsById.get(suggestion.itemId);
    if (!item) return;

    if (suggestion.type === 'defer') {
      const targetDate = findNearestViableDay();
      if (!window.confirm(`Mover "${item.title}" para ${targetDate}?`)) {
        return;
      }

      const previousDueDate = item.due_date;
      const previousRescheduleCount = item.reschedule_count;
      await rescheduleItem(item.id, targetDate);
      dismissSuggestion(suggestion);
      showFeedback(`${item.title} movido para ${targetDate}.`, {
        undoLabel: 'Desfazer',
        onUndo: () => {
          void updateItem(item.id, {
            due_date: previousDueDate,
            reschedule_count: previousRescheduleCount,
          });
        },
      });
      return;
    }

    if (suggestion.type === 'highlight') {
      setSelectedItem(item);
      dismissSuggestion(suggestion);
      showFeedback(`${item.title} destacado para replanejamento curto.`);
      return;
    }

    dismissSuggestion(suggestion);
    showFeedback(`${item.title} mantido no dia visivel da timeline.`);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={mode === 'calendar' ? 'primary' : 'secondary'} onClick={() => setMode('calendar')}>
          Calendario
        </Button>
        <Button variant={mode === 'capacity' ? 'primary' : 'secondary'} onClick={() => setMode('capacity')}>
          Capacidade
        </Button>
        <Button variant={mode === 'dependencies' ? 'primary' : 'secondary'} onClick={() => setMode('dependencies')}>
          Dependencias
        </Button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {mode === 'calendar' ? (
          <motion.div key="calendar" className="space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
            <Card className="space-y-4 p-4">
              <div>
                <h3 className="text-lg font-semibold">Calendario</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Visao temporal do dia. Capacidade e Dependencias sao lentes sobre a mesma timeline, nao navegacoes paralelas.
                </p>
              </div>
              <div className="space-y-2">
                {calendarItems.length > 0 ? (
                  calendarItems.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="w-full rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-left text-sm transition hover:border-[var(--border-strong)]"
                    >
                      <p className="font-semibold text-[var(--text)]">{item.title}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--text-tertiary)]">{item.type}</p>
                    </button>
                  ))
                ) : (
                  <p className="rounded-[var(--radius-2xl)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                    Nenhum item com data marcada para hoje.
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        ) : mode === 'capacity' ? (
          <motion.div key="capacity" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
            <Card className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Capacidade do dia</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{projection.timeline.capacity.description}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
                  <p className="text-xs text-[var(--text-tertiary)]">Janela disponivel</p>
                  <p className="mt-2 text-2xl font-bold">{projection.timeline.capacity.totalHours}h</p>
                </div>
                <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
                  <p className="text-xs text-[var(--text-tertiary)]">Carga mapeada</p>
                  <p className="mt-2 text-2xl font-bold">{projection.timeline.capacity.committedHours === null ? projection.timeline.capacity.completeness : `${projection.timeline.capacity.committedHours}h`}</p>
                </div>
                <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
                  <p className="text-xs text-[var(--text-tertiary)]">Itens incompletos</p>
                  <p className="mt-2 text-2xl font-bold">{projection.timeline.capacity.incompleteItems}</p>
                </div>
                <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
                  <p className="text-xs text-[var(--text-tertiary)]">Estado</p>
                  <p className="mt-2 text-2xl font-bold">{projection.timeline.capacity.completeness}</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {nearbyDays.map((day) => (
                  <div key={day.date} className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-4">
                    <p className="text-xs text-[var(--text-tertiary)]">{day.date}</p>
                    <p className="mt-2 font-semibold text-[var(--text)]">{day.status.label}</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{day.scheduledCount} itens com data</p>
                  </div>
                ))}
              </div>
              {timelineNeedsReplanning && visibleTimelineSuggestions && visibleTimelineSuggestions.suggestions.length > 0 ? (
                <IASuggestCards
                  title="Replanejamento curto"
                  summary={visibleTimelineSuggestions.summary}
                  result={visibleTimelineSuggestions}
                  itemsById={suggestedItemsById}
                  onApply={handleApplySuggestion}
                  onIgnore={handleIgnoreSuggestion}
                />
              ) : null}
            </Card>
          </motion.div>
        ) : (
          <motion.div key="dependencies" className="space-y-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
            <Card className="space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">Dependencias</h3>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">
                    Leitura de impacto qualificado. Vinculo com meta ou projeto orienta Direcao, mas nao vira dependencia.
                  </p>
                  <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                    {dependencySummary.blocking} bloqueantes - {dependencySummary.unknown} incompletas
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant={dependencyView === 'chains' ? 'primary' : 'secondary'} onClick={() => setDependencyView('chains')}>
                    Cadeias
                  </Button>
                  <Button variant={dependencyView === 'tree' ? 'primary' : 'secondary'} onClick={() => setDependencyView('tree')}>
                    Arvore
                  </Button>
                </div>
              </div>
            </Card>

            <AnimatePresence mode="wait" initial={false}>
              {dependencyView === 'chains' ? (
                <motion.div key="chains" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.18 }}>
                  <ChainList chains={domain.dependencyTimeline.chains} selectedChainId={effectiveSelectedChainId} onSelect={setSelectedChainId} />
                </motion.div>
              ) : (
                <motion.div key="tree" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.18 }}>
                  <IndentedTree tree={domain.dependencyTimeline.tree} highlightedChainIds={highlightedChainIds} />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid gap-4 lg:grid-cols-2">
              <StickyCard />
              <ImpactAnalysis />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {selectedItem ? (
        <EntitySheetWrapper
          item={selectedItem}
          visible={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={() => setSelectedItem(null)}
        />
      ) : null}
    </div>
  );
}
