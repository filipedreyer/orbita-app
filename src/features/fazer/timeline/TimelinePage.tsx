import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useActionFeedback } from '../../../components/feedback/ActionFeedbackProvider';
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

function getDaySignal(count: number, operationalHours: number): 'balanced' | 'loaded' | 'overloaded' {
  if (count > operationalHours + 1) return 'overloaded';
  if (count >= operationalHours) return 'loaded';
  return 'balanced';
}

export function TimelinePage() {
  const domain = useHojeDomain();
  const projection = useHojeProjection();
  const allItems = useDataStore((state) => state.items);
  const rescheduleItem = useDataStore((state) => state.rescheduleItem);
  const updateItem = useDataStore((state) => state.updateItem);
  const [mode, setMode] = useState<'capacity' | 'dependencies'>('capacity');
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
  const todayItems = projection.sections.focusItems;

  const timelineCapacitySignal = useMemo(
    () => getDaySignal(todayItems.length, projection.timeline.capacity.operationalHours),
    [projection.timeline.capacity.operationalHours, todayItems.length],
  );

  const nearbyDays = useMemo(
    () =>
      Array.from({ length: 3 }, (_, index) => {
        const date = shiftDay(domain.referenceDate, index + 1);
        const scheduledCount = allItems.filter(
          (item) => item.status === 'active' && item.due_date === date && item.type !== 'evento' && item.type !== 'lembrete',
        ).length;

        return {
          date,
          signal: getDaySignal(scheduledCount, projection.timeline.capacity.operationalHours),
          scheduledCount,
        };
      }),
    [allItems, domain.referenceDate, projection.timeline.capacity.operationalHours],
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

  const timelineNeedsReplanning = timelineCapacitySignal !== 'balanced' || projection.timeline.capacity.overloadByItems > 0;

  useEffect(() => {
    if (!timelineNeedsReplanning) {
      setTimelineSuggestions(null);
      setDismissedSuggestionIds([]);
      return;
    }

    let cancelled = false;
    setTimelineSuggestions(null);
    setDismissedSuggestionIds([]);

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
        <Button variant={mode === 'capacity' ? 'primary' : 'secondary'} onClick={() => setMode('capacity')}>
          Capacidade
        </Button>
        <Button variant={mode === 'dependencies' ? 'primary' : 'secondary'} onClick={() => setMode('dependencies')}>
          Dependencias
        </Button>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {mode === 'capacity' ? (
          <motion.div key="capacity" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.18 }}>
            <Card className="space-y-4">
              <h3 className="text-lg font-semibold">Capacidade do dia</h3>
              <div className="grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
                  <p className="text-xs text-[var(--text-tertiary)]">Horas totais</p>
                  <p className="mt-2 text-2xl font-bold">{projection.timeline.capacity.totalHours}h</p>
                </div>
                <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
                  <p className="text-xs text-[var(--text-tertiary)]">Blocos inegociaveis</p>
                  <p className="mt-2 text-2xl font-bold">{projection.timeline.capacity.inegociavelBlockHours}h</p>
                </div>
                <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
                  <p className="text-xs text-[var(--text-tertiary)]">Compromissos fixos</p>
                  <p className="mt-2 text-2xl font-bold">{projection.timeline.capacity.fixedCommitmentHours}h</p>
                </div>
                <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
                  <p className="text-xs text-[var(--text-tertiary)]">Capacidade operacional</p>
                  <p className="mt-2 text-2xl font-bold">{projection.timeline.capacity.operationalHours}h</p>
                </div>
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
                    Onda 1 funcional: lista de cadeias e arvore indentada simples sobre a mesma derivacao do dia.
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
