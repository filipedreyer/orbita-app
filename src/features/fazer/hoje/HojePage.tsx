import { useEffect, useMemo, useState } from 'react';
import { Plus, Sparkles, X } from 'lucide-react';
import { useActionFeedback } from '../../../components/feedback/ActionFeedbackContext';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { CreateLauncherModal } from '../../capture/CreateLauncherModal';
import { EntitySheetWrapper } from '../../entity/EntitySheetWrapper';
import { IAActionButton } from '../../ia/IAActionButton';
import { IAEntryPoints } from '../../ia/IAEntryPoints';
import { IASuggestCards } from '../../ia/IASuggestCards';
import { IASuggestion } from '../../ia/IASuggestion';
import { buildSuggestDayPayload, suggestDayWithAI } from '../../ia/suggest';
import { useIA } from '../../ia/useIA';
import {
  READ_TODAY_TIMEOUT_MS,
  ReadTodayError,
  buildTodayReadPayload,
  readTodayWithAI,
  type TodayReadCapacity,
  type TodayReadStatus,
} from '../../ia/readToday';
import { shiftLocalDate, today } from '../../../lib/dates';
import { isLegacyInegociavel, isProtectedEssential } from '../../../lib/entity-domain';
import type { Item } from '../../../lib/types';
import { useDataStore } from '../../../store';
import { useHojeDomain, useHojeProjection } from '../../../store/fazer';
import { toAISuggestCapacitySignal } from '../domain/canonical';
import type { IASuggestResult, IASuggestionItem } from '../../ia/types';
import { CompletedSection } from './CompletedSection';
import { DayHeader } from './DayHeader';
import { DayList } from './DayList';
import { ProtectedEssentialCapacityBlock } from './ProtectedEssentialCapacityBlock';
import { ReminderBanner } from './ReminderBanner';

const LONG_INACTIVITY_DAYS = 14;

function isOlderThanDays(timestamp: string, days: number) {
  const ageMs = Date.now() - new Date(timestamp).getTime();
  return ageMs > days * 24 * 60 * 60 * 1000;
}

function getNextDay(date: string) {
  return shiftLocalDate(date, 1);
}

export function HojePage() {
  const projection = useHojeProjection();
  const domain = useHojeDomain();
  const allItems = useDataStore((state) => state.items);
  const completeItem = useDataStore((state) => state.completeItem);
  const checkHabit = useDataStore((state) => state.checkHabit);
  const updateItem = useDataStore((state) => state.updateItem);
  const rescheduleItem = useDataStore((state) => state.rescheduleItem);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [todayReadingOpen, setTodayReadingOpen] = useState(false);
  const [todayReading, setTodayReading] = useState('');
  const [todayReadingStatus, setTodayReadingStatus] = useState<TodayReadStatus>('idle');
  const [todayReadingMessage, setTodayReadingMessage] = useState('');
  const [daySuggestions, setDaySuggestions] = useState<IASuggestResult | null>(null);
  const [dismissedSuggestionIds, setDismissedSuggestionIds] = useState<string[]>([]);
  const { routeContext, completedActions, triggerAction } = useIA();
  const { showFeedback } = useActionFeedback();
  const referenceDate = today();

  const executionZones = useMemo(() => {
    const activeFocusItems = projection.sections.focusItems;
    const immediateTodayItems = activeFocusItems.filter((item) => item.due_date === referenceDate);
    const immediatePriorityItems = activeFocusItems.filter((item) => item.due_date !== referenceDate && item.priority === 'alta');
    const agora = [...immediateTodayItems, ...immediatePriorityItems];
    const agoraIds = new Set(agora.map((item) => item.id));
    const cabeHoje = activeFocusItems.filter((item) => !agoraIds.has(item.id));

    const revisitItems = allItems.filter((item) => {
      if (item.status === 'done' || item.status === 'archived') return false;
      const metadata = (item.metadata || {}) as Record<string, unknown>;
      return metadata.inbox_needs_revisit === true;
    });

    const inactiveItems = allItems.filter((item) => {
      if (item.status !== 'active' && item.status !== 'paused') return false;
      if (item.due_date) return false;
      const metadata = (item.metadata || {}) as Record<string, unknown>;
      if (metadata.inbox_needs_revisit === true) return false;
      return isOlderThanDays(item.updated_at || item.created_at, LONG_INACTIVITY_DAYS);
    });

    const attentionItems = [
      ...domain.overdueItems,
      ...revisitItems,
      ...inactiveItems,
    ].filter((item, index, collection) => collection.findIndex((entry) => entry.id === item.id) === index);

    return {
      agora,
      cabeHoje,
      atencao: attentionItems,
    };
  }, [allItems, domain.overdueItems, projection.sections.focusItems, referenceDate]);

  const capacitySignal = useMemo<{
    tone: TodayReadCapacity;
    label: string;
    description: string;
  }>(() => {
    return {
      tone: toAISuggestCapacitySignal(domain.capacity.signal),
      label: domain.capacity.label,
      description: domain.capacity.description,
    };
  }, [domain.capacity.description, domain.capacity.label, domain.capacity.signal]);

  const agoraSummary = useMemo(() => {
    const dueTodayCount = executionZones.agora.filter((item) => item.due_date === referenceDate).length;
    const highPriorityCount = executionZones.agora.filter((item) => item.due_date !== referenceDate && item.priority === 'alta').length;

    return {
      dueTodayCount,
      highPriorityCount,
    };
  }, [executionZones.agora, referenceDate]);

  const cabeHojeSummary = useMemo(() => {
    const activeWithoutDate = executionZones.cabeHoje.filter((item) => !item.due_date && item.status === 'active').length;
    const revisitPaused = executionZones.cabeHoje.filter((item) => item.status === 'paused').length;

    return {
      activeWithoutDate,
      revisitPaused,
    };
  }, [executionZones.cabeHoje]);

  const executionLinkState = useMemo(() => {
    const byId = new Map(allItems.map((item) => [item.id, item]));

    return (item: Item) => {
      const parts: string[] = [];
      const goal = item.goal_id ? byId.get(item.goal_id) : null;
      const project = item.project_id ? byId.get(item.project_id) : null;

      if (goal) {
        parts.push(`Meta: ${goal.title}`);
      }

      if (project) {
        parts.push(`Projeto: ${project.title}`);
      }

      if (item.type === 'habito') {
        parts.push('Hábito em execução');
      }

      if (item.type === 'rotina') {
        parts.push('Rotina em execução');
      }

      if (isLegacyInegociavel(item.type) || isProtectedEssential(item.metadata as Record<string, unknown>)) {
        const metadata = (item.metadata || {}) as Record<string, unknown>;
        if (metadata.horario_inicio || metadata.horario_fim) {
          parts.push('Essencial protegido com janela explicita');
        } else {
          parts.push('Protege a capacidade sem bloco fixo explícito');
        }
      }

      const linked = parts.length > 0;

      return {
        linked,
        context: linked ? parts.join(' · ') : 'Execução sem vínculo direcional explícito',
      };
    };
  }, [allItems]);

  const linkageSummary = useMemo(() => {
    const activeItems = projection.sections.focusItems;
    const linkedCount = activeItems.filter((item) => executionLinkState(item).linked).length;
    const standaloneCount = activeItems.length - linkedCount;

    return {
      linkedCount,
      standaloneCount,
    };
  }, [executionLinkState, projection.sections.focusItems]);

  const suggestPayload = useMemo(
    () =>
      buildSuggestDayPayload({
        items: projection.sections.focusItems,
        capacitySignal: capacitySignal.tone,
        agoraCount: executionZones.agora.length,
        cabeCount: executionZones.cabeHoje.length,
        referenceDate,
        fixedInegociaveis: domain.fixedInegociaveis,
        capacityOnlyInegociaveis: domain.capacityOnlyInegociaveis,
        blockedInegociaveis: domain.blockedInegociaveis,
        linkedResolver: executionLinkState,
      }),
    [
      capacitySignal.tone,
      domain.blockedInegociaveis,
      domain.capacityOnlyInegociaveis,
      domain.fixedInegociaveis,
      executionLinkState,
      executionZones.agora.length,
      executionZones.cabeHoje.length,
      projection.sections.focusItems,
      referenceDate,
    ],
  );

  const suggestedItemsById = useMemo(
    () => new Map(projection.sections.focusItems.map((item) => [item.id, item])),
    [projection.sections.focusItems],
  );

  const visibleDaySuggestions = useMemo(() => {
    if (!daySuggestions) return null;
    return {
      ...daySuggestions,
      suggestions: daySuggestions.suggestions.filter((suggestion) => !dismissedSuggestionIds.includes(suggestion.itemId)),
    };
  }, [daySuggestions, dismissedSuggestionIds]);

  useEffect(() => {
    let cancelled = false;

    void Promise.resolve().then(() => {
      if (!cancelled) {
        setDaySuggestions(null);
        setDismissedSuggestionIds([]);
      }
    });

    async function loadSuggestions() {
      const result = await suggestDayWithAI(suggestPayload);
      if (!cancelled && result) {
        setDaySuggestions(result);
      }
    }

    void loadSuggestions();

    return () => {
      cancelled = true;
    };
  }, [suggestPayload]);

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
      const nextDate = getNextDay(referenceDate);
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
      showFeedback(`${item.title} destacado para leitura imediata.`);
      return;
    }

    dismissSuggestion(suggestion);
    showFeedback(`${item.title} mantido no plano de hoje.`);
  }

  async function handleComplete(item: Item) {
    if (item.type === 'habito' || item.type === 'rotina') {
      await checkHabit(item.id);
      showFeedback(`${item.title} registrado no dia.`);
      return;
    }

    await completeItem(item.id);
    showFeedback(`${item.title} concluido.`, {
      undoLabel: 'Desfazer',
      onUndo: () => {
        void updateItem(item.id, { status: 'active', completed_at: null });
      },
    });
  }

  async function handleReadToday() {
    setTodayReadingOpen(true);
    setTodayReading('');
    setTodayReadingStatus('loading');
    setTodayReadingMessage(`Lendo o dia... Se passar de ${Math.round(READ_TODAY_TIMEOUT_MS / 1000)}s, a leitura entra em timeout.`);

    try {
      const payload = buildTodayReadPayload({
        agora: executionZones.agora,
        cabe: executionZones.cabeHoje,
        atencao: executionZones.atencao,
        capacity: capacitySignal.tone,
        linked: linkageSummary.linkedCount,
        standalone: linkageSummary.standaloneCount,
        allItems,
      });
      const reading = await readTodayWithAI(payload);
      setTodayReading(reading);
      setTodayReadingStatus('success');
      setTodayReadingMessage('');
    } catch (error) {
      setTodayReading('');
      if (error instanceof ReadTodayError) {
        setTodayReadingStatus(error.code);
        setTodayReadingMessage(error.message);
        return;
      }

      setTodayReadingStatus('failure');
      setTodayReadingMessage('Leitura indisponivel agora. Siga com o dia e tente novamente depois.');
    }
  }

  return (
    <div className="space-y-5">
      <DayHeader {...projection.header} />
      <ReminderBanner reminders={projection.sections.reminders} />
      {routeContext.area === 'fazer' && routeContext.suggestions[0] ? (
        <IASuggestion suggestion={routeContext.suggestions[0]} completedActions={completedActions} onRunAction={triggerAction} />
      ) : null}
      {visibleDaySuggestions && visibleDaySuggestions.suggestions.length > 0 ? (
        <IASuggestCards
          title="Sugestoes do dia"
          summary={visibleDaySuggestions.summary}
          result={visibleDaySuggestions}
          itemsById={suggestedItemsById}
          onApply={handleApplySuggestion}
          onIgnore={handleIgnoreSuggestion}
        />
      ) : null}
      <IAEntryPoints
        compact
        title="Leitura contextual de Hoje"
        description="Abre os drawers contextuais ja preparados para execucao, direcao e risco do dia."
      />
      <ProtectedEssentialCapacityBlock items={projection.sections.inegociaveis} />

      <Card className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Execucao</p>
            <h3 className="mt-1 text-xl font-bold tracking-[-0.02em] text-[var(--text)]">Lista do dia</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={handleReadToday}>
              <Sparkles className="h-4 w-4" />
              E agora?
            </Button>
            {routeContext.area === 'fazer' && routeContext.suggestions[0]?.actions[0] ? (
              <IAActionButton action={routeContext.suggestions[0].actions[0]} completed={!!completedActions[routeContext.suggestions[0].actions[0].id]} onRun={triggerAction} />
            ) : null}
            <Button onClick={() => setCaptureOpen(true)}>
              <Plus className="h-4 w-4" />
              Capturar
            </Button>
          </div>
        </div>

        <div
          className={[
            'rounded-[var(--radius-2xl)] border px-4 py-3 text-sm',
            domain.capacity.signal === 'overloaded'
              ? 'border-[var(--danger)]/25 bg-[var(--danger)]/10 text-[var(--text)]'
              : domain.capacity.signal === 'loaded' || domain.capacity.signal === 'parcial' || domain.capacity.signal === 'incompleto'
                ? 'border-[var(--warning)]/25 bg-[var(--warning)]/10 text-[var(--text)]'
                : 'border-[var(--accent-border)] bg-[var(--accent-soft)]/60 text-[var(--text)]',
          ].join(' ')}
        >
          <p className="font-semibold">{capacitySignal.label}</p>
          <p className="mt-1 text-[var(--text-secondary)]">{capacitySignal.description}</p>
        </div>

        <div
          className={[
            'rounded-[var(--radius-2xl)] border px-4 py-3 text-sm',
            linkageSummary.standaloneCount >= linkageSummary.linkedCount && linkageSummary.standaloneCount > 0
              ? 'border-[var(--warning)]/25 bg-[var(--warning)]/10'
              : 'border-[var(--accent-border)] bg-[var(--surface-alt)]',
          ].join(' ')}
        >
          <p className="font-semibold text-[var(--text)]">Direção x execução</p>
          <p className="mt-1 text-[var(--text-secondary)]">
            {linkageSummary.linkedCount} itens com vínculo direcional visível · {linkageSummary.standaloneCount} em execução sem vínculo explícito
          </p>
        </div>

        <div className="space-y-5">
          <section className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Para fazer agora</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Faixa de execucao imediata: o que vence hoje e o que precisa entrar no agora.</p>
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                {agoraSummary.dueTodayCount} com data de hoje
                {agoraSummary.highPriorityCount > 0 ? ` · ${agoraSummary.highPriorityCount} de alta prioridade sem data de hoje` : ''}
              </p>
            </div>
            <DayList items={executionZones.agora} onOpen={setSelectedItem} onComplete={handleComplete} getExecutionState={executionLinkState} />
          </section>

          <section className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Cabe hoje</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Horizonte de execucao do dia: itens que podem ser puxados hoje sem precisarem entrar no agora.</p>
              <p className="mt-2 text-xs text-[var(--text-tertiary)]">
                {cabeHojeSummary.activeWithoutDate} ativos sem data
                {cabeHojeSummary.revisitPaused > 0 ? ` · ${cabeHojeSummary.revisitPaused} pausados ainda recuperaveis` : ''}
              </p>
            </div>
            <DayList items={executionZones.cabeHoje} onOpen={setSelectedItem} onComplete={handleComplete} getExecutionState={executionLinkState} />
          </section>

          <section className="space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Atencao</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Riscos do dia: atraso, itens adiados da inbox ou sinais de inercia.</p>
            </div>
            <DayList items={executionZones.atencao} onOpen={setSelectedItem} onComplete={handleComplete} getExecutionState={executionLinkState} />
          </section>
        </div>
      </Card>

      <CompletedSection items={projection.sections.completed} />
      <CreateLauncherModal visible={captureOpen} onClose={() => setCaptureOpen(false)} />
      {selectedItem ? (
        <EntitySheetWrapper
          item={selectedItem}
          visible={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={() => setSelectedItem(null)}
        />
      ) : null}
      {todayReadingOpen ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[var(--overlay)] p-4" onClick={() => setTodayReadingOpen(false)}>
          <Card className="w-full max-w-lg space-y-4 p-5 shadow-[var(--shadow-sheet)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Leitura de IA</p>
                <h3 className="mt-1 text-xl font-bold tracking-[-0.02em] text-[var(--text)]">E agora?</h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">Uma leitura curta do estado atual de Hoje, sem alterar nada no sistema.</p>
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:text-[var(--text)]"
                onClick={() => setTodayReadingOpen(false)}
                aria-label="Fechar leitura de IA"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-4 text-sm leading-6 text-[var(--text)]">
              {todayReadingStatus === 'loading' ? todayReadingMessage : null}
              {todayReadingStatus === 'success' ? todayReading : null}
              {todayReadingStatus === 'empty' || todayReadingStatus === 'timeout' || todayReadingStatus === 'failure' ? todayReadingMessage : null}
              {todayReadingStatus === 'idle' ? 'Uma leitura curta do estado atual de Hoje aparecera aqui.' : null}
            </div>

            <div className="flex justify-end gap-2">
              {todayReadingStatus === 'empty' || todayReadingStatus === 'timeout' || todayReadingStatus === 'failure' ? (
                <Button variant="secondary" onClick={handleReadToday}>
                  Tentar novamente
                </Button>
              ) : null}
              <Button variant="ghost" onClick={() => setTodayReadingOpen(false)}>
                Fechar
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
