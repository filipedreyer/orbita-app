import { useEffect, useMemo, useState } from 'react';
import { DragOverlay, DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { GripVertical, Lock, MoveUpRight, Sparkles, TriangleAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../app/routes';
import { useActionFeedback } from '../../../components/feedback/ActionFeedbackProvider';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { CardRow } from '../../../components/ui/CardRow';
import { EntitySheetWrapper } from '../../entity/EntitySheetWrapper';
import { IASuggestCards } from '../../ia/IASuggestCards';
import { readRitualWithAI, type RitualReadPayload } from '../../ia/ritual';
import { buildSuggestDayPayload, suggestDayWithAI } from '../../ia/suggest';
import type { IASuggestResult, IASuggestionItem } from '../../ia/types';
import type { Item } from '../../../lib/types';
import { shiftLocalDate } from '../../../lib/dates';
import { useDataStore } from '../../../store';
import { useHojeProjection, useRitualDomain } from '../../../store/fazer';
import { isRitualLockedItem } from '../domain/ordering';

const LONG_INACTIVITY_DAYS = 14;

function isOlderThanDays(timestamp: string, days: number) {
  const ageMs = Date.now() - new Date(timestamp).getTime();
  return ageMs > days * 24 * 60 * 60 * 1000;
}

function getNextDay(date: string) {
  return shiftLocalDate(date, 1);
}

function getExecutionLinkState(item: Item, itemsById: Map<string, Item>) {
  const goal = item.goal_id ? itemsById.get(item.goal_id) : null;
  const project = item.project_id ? itemsById.get(item.project_id) : null;
  const linked = Boolean(goal || project || item.type === 'habito' || item.type === 'rotina' || item.type === 'inegociavel');

  if (goal) return { linked, context: `Meta: ${goal.title}` };
  if (project) return { linked, context: `Projeto: ${project.title}` };
  if (item.type === 'habito') return { linked, context: 'Habito refletido na execucao' };
  if (item.type === 'rotina') return { linked, context: 'Rotina refletida na execucao' };
  if (item.type === 'inegociavel') return { linked, context: 'Inegociavel protegendo a capacidade do dia' };

  return { linked: false, context: 'Execucao sem vinculo direcional explicito' };
}

function SortableRitualRow({ item, isLast }: { item: Item; isLast: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
      }}
    >
      <CardRow isLast={isLast}>
        <div className={`flex-1 transition ${isDragging ? 'translate-x-1' : ''}`}>
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-xs text-[var(--text-secondary)]">{item.type}</p>
        </div>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border bg-[var(--surface)] text-[var(--text-secondary)] transition ${
            isDragging ? 'border-[var(--accent)] shadow-[var(--shadow-card)]' : 'border-[var(--border)]'
          }`}
          aria-label={`Reordenar ${item.title}`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </CardRow>
    </div>
  );
}

function renderSimpleList(items: Item[], emptyLabel: string) {
  if (items.length === 0) {
    return <p className="text-sm text-[var(--text-secondary)]">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {items.slice(0, 4).map((item) => (
        <div key={item.id} className="rounded-[var(--radius-2xl)] bg-[var(--surface-alt)] px-4 py-3">
          <p className="text-sm font-medium text-[var(--text)]">{item.title}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--text-tertiary)]">{item.type}</p>
        </div>
      ))}
      {items.length > 4 ? <p className="text-xs text-[var(--text-tertiary)]">+ {items.length - 4} itens adicionais</p> : null}
    </div>
  );
}

export function RitualPageV2() {
  const navigate = useNavigate();
  const domain = useRitualDomain();
  const projection = useHojeProjection();
  const items = useDataStore((state) => state.items);
  const ritualOrder = useDataStore((state) => state.ritualOrder);
  const setRitualOrder = useDataStore((state) => state.setRitualOrder);
  const rescheduleItem = useDataStore((state) => state.rescheduleItem);
  const updateItem = useDataStore((state) => state.updateItem);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [showOrdering, setShowOrdering] = useState(false);
  const [ritualReading, setRitualReading] = useState<string | null>(null);
  const [capacitySuggestions, setCapacitySuggestions] = useState<IASuggestResult | null>(null);
  const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState<string[]>([]);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const { showFeedback } = useActionFeedback();

  useEffect(() => {
    const current = ritualOrder.join('|');
    const normalized = domain.normalizedRitualOrder.join('|');

    if (normalized.length > 0 && current !== normalized) {
      setRitualOrder(domain.normalizedRitualOrder);
    }
  }, [domain.normalizedRitualOrder, ritualOrder, setRitualOrder]);

  const executionZones = useMemo(() => {
    const activeFocusItems = projection.sections.focusItems;
    const immediateTodayItems = activeFocusItems.filter((item) => item.due_date === domain.referenceDate);
    const immediatePriorityItems = activeFocusItems.filter((item) => item.due_date !== domain.referenceDate && item.priority === 'alta');
    const agora = [...immediateTodayItems, ...immediatePriorityItems];
    const agoraIds = new Set(agora.map((item) => item.id));
    const cabeHoje = activeFocusItems.filter((item) => !agoraIds.has(item.id));

    const revisitItems = items.filter((item) => {
      if (item.status === 'done' || item.status === 'archived') return false;
      const metadata = (item.metadata || {}) as Record<string, unknown>;
      return metadata.inbox_needs_revisit === true;
    });

    const inactiveItems = items.filter((item) => {
      if (item.status !== 'active' && item.status !== 'paused') return false;
      if (item.due_date) return false;
      const metadata = (item.metadata || {}) as Record<string, unknown>;
      if (metadata.inbox_needs_revisit === true) return false;
      return isOlderThanDays(item.updated_at || item.created_at, LONG_INACTIVITY_DAYS);
    });

    const atencao = [...domain.overdueItems, ...revisitItems, ...inactiveItems].filter(
      (item, index, collection) => collection.findIndex((entry) => entry.id === item.id) === index,
    );

    return { agora, cabeHoje, atencao, revisitItems };
  }, [domain.overdueItems, domain.referenceDate, items, projection.sections.focusItems]);

  const capacitySignal = useMemo<{
    label: string;
    description: string;
    tone: 'balanced' | 'loaded' | 'overloaded';
  }>(() => {
    const count = executionZones.agora.length;

    if (count <= 3) {
      return {
        label: 'Equilibrado',
        description: 'O bloco de execucao imediata parece caber no ritmo do dia.',
        tone: 'balanced',
      };
    }

    if (count <= 5) {
      return {
        label: 'Carregado',
        description: 'Ha pressao real no agora. Vale proteger foco antes de adicionar mais frentes.',
        tone: 'loaded',
      };
    }

    return {
      label: 'Sobrecarregado',
      description: 'Itens demais disputando execucao imediata. O dia pede reducao de friccao.',
      tone: 'overloaded',
    };
  }, [executionZones.agora.length]);

  const ritualCapacitySignal = useMemo<RitualReadPayload['capacity']['signal']>(() => {
    if (capacitySignal.tone === 'overloaded') return 'overloaded';
    if (capacitySignal.tone === 'loaded') return 'loaded';
    return 'balanced';
  }, [capacitySignal.tone]);

  const directionSummary = useMemo(() => {
    const itemsById = new Map(items.map((item) => [item.id, item]));
    const linkedCount = projection.sections.focusItems.filter((item) => getExecutionLinkState(item, itemsById).linked).length;
    const standaloneCount = projection.sections.focusItems.length - linkedCount;

    return { linkedCount, standaloneCount };
  }, [items, projection.sections.focusItems]);

  const staleCount = useMemo(() => {
    return executionZones.atencao.filter((item) => {
      if (domain.overdueItems.some((entry) => entry.id === item.id)) return false;
      if (executionZones.revisitItems.some((entry) => entry.id === item.id)) return false;
      return true;
    }).length;
  }, [domain.overdueItems, executionZones.atencao, executionZones.revisitItems]);

  const ritualPayload = useMemo<RitualReadPayload>(
    () => ({
      risk: {
        overdueCount: domain.overdueItems.length,
        revisitCount: executionZones.revisitItems.length,
        staleCount,
      },
      capacity: {
        signal: ritualCapacitySignal,
        agoraCount: executionZones.agora.length,
      },
      direction: {
        linkedCount: directionSummary.linkedCount,
        standaloneCount: directionSummary.standaloneCount,
      },
    }),
    [
      directionSummary.linkedCount,
      directionSummary.standaloneCount,
      domain.overdueItems.length,
      executionZones.agora.length,
      executionZones.revisitItems.length,
      ritualCapacitySignal,
      staleCount,
    ],
  );

  const suggestPayload = useMemo(
    () =>
      buildSuggestDayPayload({
        items: projection.sections.focusItems,
        capacitySignal: capacitySignal.tone,
        agoraCount: executionZones.agora.length,
        cabeCount: executionZones.cabeHoje.length,
        referenceDate: domain.referenceDate,
        fixedInegociaveis: domain.fixedInegociaveis,
        capacityOnlyInegociaveis: domain.capacityOnlyInegociaveis,
        blockedInegociaveis: domain.blockedInegociaveis,
        linkedResolver: (item) => getExecutionLinkState(item, new Map(items.map((entry) => [entry.id, entry]))),
      }),
    [
      capacitySignal.tone,
      domain.blockedInegociaveis,
      domain.capacityOnlyInegociaveis,
      domain.fixedInegociaveis,
      domain.referenceDate,
      executionZones.agora.length,
      executionZones.cabeHoje.length,
      items,
      projection.sections.focusItems,
    ],
  );

  const suggestedItemsById = useMemo(
    () => new Map(projection.sections.focusItems.map((item) => [item.id, item])),
    [projection.sections.focusItems],
  );

  const visibleCapacitySuggestions = useMemo(() => {
    if (!capacitySuggestions) return null;
    return {
      ...capacitySuggestions,
      suggestions: capacitySuggestions.suggestions.filter((suggestion) => !dismissedSuggestionIds.includes(suggestion.itemId)),
    };
  }, [capacitySuggestions, dismissedSuggestionIds]);

  useEffect(() => {
    let cancelled = false;
    setRitualReading(null);

    async function loadRitualReading() {
      const reading = await readRitualWithAI(ritualPayload);
      if (!cancelled && reading) {
        setRitualReading(reading);
      }
    }

    void loadRitualReading();

    return () => {
      cancelled = true;
    };
  }, [ritualPayload]);

  useEffect(() => {
    let cancelled = false;
    setCapacitySuggestions(null);
    setDismissedSuggestionIds([]);

    async function loadCapacitySuggestions() {
      const result = await suggestDayWithAI(suggestPayload);
      if (!cancelled && result) {
        setCapacitySuggestions(result);
      }
    }

    void loadCapacitySuggestions();

    return () => {
      cancelled = true;
    };
  }, [suggestPayload]);

  const orderedItems = useMemo(() => {
    const rank = new Map(ritualOrder.map((id, index) => [id, index]));
    return [...domain.ritualItems].sort((left, right) => (rank.get(left.id) ?? 999) - (rank.get(right.id) ?? 999));
  }, [domain.ritualItems, ritualOrder]);

  const lockedItems = orderedItems.filter((item) => isRitualLockedItem(item));
  const sortableItems = orderedItems.filter((item) => !isRitualLockedItem(item));
  const sortableIds = sortableItems.map((item) => item.id);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveItemId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = sortableIds.indexOf(String(active.id));
    const newIndex = sortableIds.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const nextSortableIds = arrayMove(sortableIds, oldIndex, newIndex);
    setRitualOrder([...lockedItems.map((item) => item.id), ...nextSortableIds]);
  }

  const activeItem = sortableItems.find((item) => item.id === activeItemId) ?? null;

  function dismissSuggestion(suggestion: IASuggestionItem) {
    setDismissedSuggestionIds((current) => (current.includes(suggestion.itemId) ? current : [...current, suggestion.itemId]));
  }

  function handleIgnoreSuggestion(suggestion: IASuggestionItem) {
    dismissSuggestion(suggestion);
  }

  async function handleApplySuggestion(suggestion: IASuggestionItem) {
    const item = suggestedItemsById.get(suggestion.itemId);
    if (!item) return;

    if (suggestion.type === 'defer') {
      const previousDueDate = item.due_date;
      const previousRescheduleCount = item.reschedule_count;
      const nextDate = getNextDay(domain.referenceDate);
      await rescheduleItem(item.id, nextDate);
      dismissSuggestion(suggestion);
      showFeedback(`${item.title} adiado para ${nextDate}.`, {
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
      showFeedback(`${item.title} destacado para leitura antes de entrar em Hoje.`);
      return;
    }

    dismissSuggestion(suggestion);
    showFeedback(`${item.title} mantido como parte valida do desenho do dia.`);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Ritual de abertura</p>
        <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em]">Abrir o dia com clareza</h3>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
          Esta abertura nao pede respostas nem checklists. Ela so enquadra o dia antes da execucao: o que merece atencao, se o desenho de hoje cabe e se o foco segue conectado a direcao.
        </p>
      </div>

      <Card className="space-y-3 p-4">
        <p className="text-sm font-semibold text-[var(--text)]">Antes de entrar em Hoje</p>
        <p className="text-sm text-[var(--text-secondary)]">
          Leia estes tres sinais como uma moldura breve do dia. O objetivo aqui nao e executar nem revisar tudo, e comecar com nocao de risco, ritmo e alinhamento.
        </p>
      </Card>

      {ritualReading ? (
        <Card className="space-y-3 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Leitura de abertura</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--text-secondary)]">{ritualReading}</p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Risco</p>
              <h4 className="mt-2 text-lg font-semibold text-[var(--text)]">O que pede atencao antes de comecar</h4>
            </div>
            <div className="rounded-[var(--radius-pill)] border border-[var(--danger)]/25 bg-[var(--danger)]/10 px-3 py-1 text-sm font-semibold text-[var(--text)]">
              {executionZones.atencao.length}
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            {domain.overdueItems.length} em atraso - {executionZones.revisitItems.length} adiados precisando voltar
          </p>
          {renderSimpleList(executionZones.atencao, 'Nenhum risco destacado agora.')}
        </Card>

        <Card className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Capacidade</p>
              <h4 className="mt-2 text-lg font-semibold text-[var(--text)]">Como o dia esta desenhado</h4>
            </div>
            <div
              className={[
                'rounded-[var(--radius-pill)] border px-3 py-1 text-sm font-semibold',
                capacitySignal.tone === 'overloaded'
                  ? 'border-[var(--danger)]/25 bg-[var(--danger)]/10 text-[var(--text)]'
                  : capacitySignal.tone === 'loaded'
                    ? 'border-[var(--warning)]/25 bg-[var(--warning)]/10 text-[var(--text)]'
                    : 'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)]',
              ].join(' ')}
            >
              {capacitySignal.label}
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">{capacitySignal.description}</p>
          <div className="rounded-[var(--radius-2xl)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            Para fazer agora: <span className="font-semibold text-[var(--text)]">{executionZones.agora.length}</span>
            <br />
            Cabe hoje: <span className="font-semibold text-[var(--text)]">{executionZones.cabeHoje.length}</span>
          </div>
          {visibleCapacitySuggestions && visibleCapacitySuggestions.suggestions.length > 0 ? (
            <IASuggestCards
              title="Intervencoes pequenas para destravar o dia"
              summary={visibleCapacitySuggestions.summary}
              result={visibleCapacitySuggestions}
              itemsById={suggestedItemsById}
              onApply={handleApplySuggestion}
              onIgnore={handleIgnoreSuggestion}
            />
          ) : null}
        </Card>

        <Card className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Direcao</p>
              <h4 className="mt-2 text-lg font-semibold text-[var(--text)]">Para onde o dia esta apontando</h4>
            </div>
            <div className="rounded-[var(--radius-pill)] border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-1 text-sm font-semibold text-[var(--accent)]">
              {directionSummary.linkedCount}
            </div>
          </div>
          <p className="text-sm text-[var(--text-secondary)]">
            {directionSummary.linkedCount} itens ligados a direcao - {directionSummary.standaloneCount} em execucao solta
          </p>
          <div className="rounded-[var(--radius-2xl)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            {directionSummary.standaloneCount > directionSummary.linkedCount
              ? 'O dia esta mais solto do que conectado ao que Planejar aponta.'
              : 'A maior parte da execucao ainda conversa com a direcao do sistema.'}
          </div>
        </Card>
      </div>

      <Card className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">Passagem para a execucao</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Se a leitura estiver suficiente, siga para Hoje. Se precisar, ajuste a ordem manual antes de comecar.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" onClick={() => setShowOrdering((current) => !current)}>
              {showOrdering ? 'Ocultar ordem' : 'Ajustar ordem'}
            </Button>
            <Button onClick={() => navigate(routes.fazerHoje)}>
              <MoveUpRight className="h-4 w-4" />
              Ir para o dia
            </Button>
          </div>
        </div>
      </Card>

      {showOrdering ? (
        <Card className="space-y-4 p-4">
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">Ordem manual do ritual</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Ajuste fino opcional antes da execucao. Itens fixos continuam protegidos e a ordem segue refletida em Hoje.
            </p>
          </div>

          {lockedItems.length > 0 ? (
            <Card className="space-y-0 p-0">
              {lockedItems.map((item, index) => (
                <CardRow key={item.id} isLast={index === lockedItems.length - 1}>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-[var(--text-secondary)]">Bloco fixo - {item.type}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-2xl bg-[var(--surface-alt)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)]">
                    <Lock className="h-3.5 w-3.5" />
                    Fixo
                  </div>
                </CardRow>
              ))}
            </Card>
          ) : null}

          {sortableItems.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={(event) => setActiveItemId(String(event.active.id))}
              onDragCancel={() => setActiveItemId(null)}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                <Card className={activeItem ? 'p-0 ring-2 ring-[var(--accent)]/20 transition' : 'p-0 transition'}>
                  {sortableItems.map((item, index) => (
                    <SortableRitualRow key={item.id} item={item} isLast={index === sortableItems.length - 1} />
                  ))}
                </Card>
              </SortableContext>
              <DragOverlay dropAnimation={{ duration: 180, easing: 'ease-out' }}>
                {activeItem ? (
                  <motion.div initial={{ scale: 0.98, opacity: 0.92 }} animate={{ scale: 1.02, opacity: 1 }} className="rounded-3xl shadow-2xl">
                    <Card className="min-w-[320px] border-[var(--accent)] bg-[var(--surface)]">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-4 w-4 text-[var(--accent)]" />
                        <div>
                          <p className="text-sm font-medium">{activeItem.title}</p>
                          <p className="text-xs text-[var(--text-secondary)]">{activeItem.type}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <div className="rounded-[var(--radius-2xl)] border border-dashed border-[var(--border)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              Nao ha itens moviveis na ordem do ritual hoje.
            </div>
          )}

          <div className="rounded-[var(--radius-2xl)] border border-[var(--warning)]/20 bg-[var(--warning)]/10 px-4 py-3 text-sm text-[var(--text-secondary)]">
            <div className="flex items-start gap-2">
              <TriangleAlert className="mt-0.5 h-4 w-4 text-[var(--warning)]" />
              <p>Este ajuste continua opcional. O Ritual enquadra o inicio do dia; Hoje segue como superficie de execucao e Revisao continua sendo a camada de recalibracao mais ampla.</p>
            </div>
          </div>
        </Card>
      ) : null}

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
