import { isLegacyInegociavel, isProtectedEssential } from '../../../lib/entity-domain';
import type { InegociavelMetadata, Item } from '../../../lib/types';

import type { EntityType } from '../../../lib/types';

export const DAY_ENTITY_TYPES: readonly EntityType[] = ['tarefa', 'habito', 'rotina', 'evento', 'lembrete'];
export const ATTENTION_LEVELS = ['neutral', 'attention', 'tension'] as const;
export const TIMELINE_LENSES = ['calendar', 'capacity', 'dependencies'] as const;

export type TimelineLens = (typeof TIMELINE_LENSES)[number];
export type CapacityCompleteness = 'unknown' | 'incompleto' | 'parcial' | 'computavel';
export type CapacitySignal = 'unknown' | 'incompleto' | 'parcial' | 'balanced' | 'loaded' | 'overloaded';
export type DirectionStatus = 'unknown' | 'incompleto' | 'orientado' | 'solto';
export type DependencyImpact = 'none' | 'unknown' | 'blocking' | 'waiting';

export interface CapacityStatus {
  completeness: CapacityCompleteness;
  signal: CapacitySignal;
  committedHours: number | null;
  availableHours: number;
  computableItems: number;
  incompleteItems: number;
  unknownItems: number;
  label: string;
  description: string;
}

export interface DirectionStatusResult {
  status: DirectionStatus;
  linkedCount: number;
  standaloneCount: number;
  protectedEssentialCount: number;
  label: string;
  description: string;
}

// DECISÃO: usar 16h como janela operacional diária até existir configuração persistida por usuário.
export const DEFAULT_OPERATIONAL_DAY_HOURS = 16;

// DECISÃO: eventos e lembretes do dia contam como 1h de compromisso fixo até existir duração real no modelo.
export function isActiveItem(item: Item) {
  return item.status === 'active';
}

function getExplicitPlanningHorizon(item: Item) {
  const metadata = item.metadata as Record<string, unknown>;
  const horizon = metadata.horizonte;
  return horizon === 'imediato' || horizon === 'semana' || horizon === 'depois' ? horizon : null;
}

export function isDayRelevantType(item: Item) {
  return DAY_ENTITY_TYPES.includes(item.type);
}

export function isOverdueItem(item: Item, referenceDate: string) {
  return item.type === 'tarefa' && isActiveItem(item) && !!item.due_date && item.due_date < referenceDate;
}

export function isTodayEventLike(item: Item, referenceDate: string) {
  const planningHorizon = getExplicitPlanningHorizon(item);
  if (planningHorizon && planningHorizon !== 'imediato') return false;

  return (
    (item.type === 'evento' || item.type === 'lembrete') &&
    isActiveItem(item) &&
    (planningHorizon === 'imediato' || item.due_date === referenceDate)
  );
}

export function isTodayHabitLike(item: Item) {
  const planningHorizon = getExplicitPlanningHorizon(item);
  if (planningHorizon && planningHorizon !== 'imediato') return false;

  return (item.type === 'habito' || item.type === 'rotina') && isActiveItem(item);
}

export function isTodayTask(item: Item, referenceDate: string) {
  const planningHorizon = getExplicitPlanningHorizon(item);
  if (planningHorizon && planningHorizon !== 'imediato') return false;

  return item.type === 'tarefa' && isActiveItem(item) && (planningHorizon === 'imediato' || !item.due_date || item.due_date <= referenceDate);
}

export function isTodayInegociavel(item: Item) {
  const planningHorizon = getExplicitPlanningHorizon(item);
  if (planningHorizon && planningHorizon !== 'imediato') return false;

  return isLegacyInegociavel(item.type) && isActiveItem(item) && isScheduledInegociavel(item);
}

export function isItemOfDay(item: Item, referenceDate: string) {
  return (
    isTodayTask(item, referenceDate) ||
    isTodayHabitLike(item) ||
    isTodayEventLike(item, referenceDate) ||
    isTodayInegociavel(item)
  );
}

export function getInegociavelMetadata(item: Item): InegociavelMetadata | null {
  return isLegacyInegociavel(item.type) ? (item.metadata as InegociavelMetadata) : null;
}

export function isScheduledInegociavel(item: Item) {
  const metadata = getInegociavelMetadata(item);
  return !!metadata && (!!metadata.horario_inicio || !!metadata.horario_fim);
}

export function isInegociavelBlock(item: Item) {
  const metadata = getInegociavelMetadata(item);
  return !!metadata && metadata.regra_tipo === 'bloco_tempo';
}

export function getInegociavelBlockHours(item: Item) {
  const metadata = getInegociavelMetadata(item);
  if (!metadata || metadata.regra_tipo !== 'bloco_tempo') return 0;
  return metadata.horas_por_dia ?? 0;
}

export function getProtectedEssentialLabel(item: Item) {
  return isLegacyInegociavel(item.type) || isProtectedEssential(item.metadata as Record<string, unknown>)
    ? 'Essencial protegido'
    : null;
}

export function getFixedCommitmentHours(item: Item, referenceDate: string) {
  if (!isTodayEventLike(item, referenceDate)) return 0;
  return getExplicitCapacityHours(item) ?? 0;
}

export function getTimelineLens(value: unknown): TimelineLens {
  return TIMELINE_LENSES.includes(value as TimelineLens) ? (value as TimelineLens) : 'calendar';
}

function getNumberMetadata(metadata: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      return value;
    }
  }

  return null;
}

function parseTimeToMinutes(value: unknown) {
  if (typeof value !== 'string') return null;
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return hours * 60 + minutes;
}

function getWindowHours(metadata: Record<string, unknown>) {
  const start = parseTimeToMinutes(metadata.horario_inicio ?? metadata.start_time ?? metadata.time_start);
  const end = parseTimeToMinutes(metadata.horario_fim ?? metadata.end_time ?? metadata.time_end);
  if (start === null || end === null || end <= start) return null;
  return (end - start) / 60;
}

export function getExplicitCapacityHours(item: Item) {
  const metadata = (item.metadata || {}) as Record<string, unknown>;
  const explicitHours = getNumberMetadata(metadata, [
    'duration_hours',
    'duracao_horas',
    'estimated_hours',
    'estimate_hours',
    'effort_hours',
    'esforco_horas',
  ]);

  if (explicitHours !== null) return explicitHours;

  const windowHours = getWindowHours(metadata);
  if (windowHours !== null) return windowHours;

  if (isLegacyInegociavel(item.type)) {
    return getInegociavelBlockHours(item) || null;
  }

  return null;
}

function isCapacityRelevantItem(item: Item, referenceDate: string) {
  if (!isActiveItem(item)) return false;
  if (item.type === 'lembrete') return false;
  if (isTodayEventLike(item, referenceDate)) return true;
  if (isTodayTask(item, referenceDate)) return true;
  if (isTodayHabitLike(item)) return true;
  if (isLegacyInegociavel(item.type)) return isScheduledInegociavel(item);
  return false;
}

export function isCapacityComputable(items: Item[], referenceDate: string) {
  const relevantItems = items.filter((item) => isCapacityRelevantItem(item, referenceDate));
  return relevantItems.length > 0 && relevantItems.every((item) => getExplicitCapacityHours(item) !== null);
}

export function getCapacityStatus(items: Item[], referenceDate: string, availableHours = DEFAULT_OPERATIONAL_DAY_HOURS): CapacityStatus {
  const relevantItems = items.filter((item) => isCapacityRelevantItem(item, referenceDate));
  const computableItems = relevantItems.filter((item) => getExplicitCapacityHours(item) !== null);
  const incompleteItems = relevantItems.filter((item) => getExplicitCapacityHours(item) === null);
  const committedHours = computableItems.reduce((sum, item) => sum + (getExplicitCapacityHours(item) ?? 0), 0);

  if (relevantItems.length === 0) {
    return {
      completeness: 'unknown',
      signal: 'unknown',
      committedHours: null,
      availableHours,
      computableItems: 0,
      incompleteItems: 0,
      unknownItems: 0,
      label: 'Capacidade desconhecida',
      description: 'Nao ha itens temporais suficientes para estimar carga do dia.',
    };
  }

  if (computableItems.length === 0) {
    return {
      completeness: 'incompleto',
      signal: 'incompleto',
      committedHours: null,
      availableHours,
      computableItems: 0,
      incompleteItems: incompleteItems.length,
      unknownItems: incompleteItems.length,
      label: 'Capacidade incompleta',
      description: 'Itens do dia ainda nao tem duracao, janela ou esforco explicito.',
    };
  }

  if (incompleteItems.length > 0) {
    return {
      completeness: 'parcial',
      signal: 'parcial',
      committedHours,
      availableHours,
      computableItems: computableItems.length,
      incompleteItems: incompleteItems.length,
      unknownItems: incompleteItems.length,
      label: 'Capacidade parcial',
      description: 'A estimativa usa apenas itens com duracao, janela ou esforco explicito.',
    };
  }

  const loadRatio = availableHours > 0 ? committedHours / availableHours : 1;
  const signal = loadRatio > 1 ? 'overloaded' : loadRatio >= 0.75 ? 'loaded' : 'balanced';
  const label =
    signal === 'overloaded'
      ? 'Capacidade sobrecarregada'
      : signal === 'loaded'
        ? 'Capacidade carregada'
        : 'Capacidade equilibrada';

  return {
    completeness: 'computavel',
    signal,
    committedHours,
    availableHours,
    computableItems: computableItems.length,
    incompleteItems: 0,
    unknownItems: 0,
    label,
    description: 'Estimativa baseada em duracao, janela ou esforco explicito.',
  };
}

export function toAISuggestCapacitySignal(signal: CapacitySignal): 'balanced' | 'loaded' | 'overloaded' {
  if (signal === 'overloaded') return 'overloaded';
  if (signal === 'loaded' || signal === 'parcial') return 'loaded';
  return 'balanced';
}

export function getDirectionStatus(items: Item[]): DirectionStatusResult {
  const activeExecutionItems = items.filter((item) => isActiveItem(item) && item.type !== 'evento' && item.type !== 'lembrete');
  const protectedEssentialCount = activeExecutionItems.filter((item) => isProtectedEssential(item.metadata as Record<string, unknown>) || isLegacyInegociavel(item.type)).length;
  const linkedCount = activeExecutionItems.filter((item) => Boolean(item.goal_id || item.project_id)).length;
  const standaloneCount = activeExecutionItems.length - linkedCount;

  if (activeExecutionItems.length === 0) {
    return {
      status: 'unknown',
      linkedCount,
      standaloneCount,
      protectedEssentialCount,
      label: 'Direcao desconhecida',
      description: 'Nao ha execucao ativa suficiente para ler orientacao do dia.',
    };
  }

  if (linkedCount === 0 && protectedEssentialCount === 0) {
    return {
      status: 'incompleto',
      linkedCount,
      standaloneCount,
      protectedEssentialCount,
      label: 'Direcao incompleta',
      description: 'A execucao existe, mas ainda nao mostra vinculo com metas, projetos ou essencial protegido.',
    };
  }

  if (standaloneCount > linkedCount + protectedEssentialCount) {
    return {
      status: 'solto',
      linkedCount,
      standaloneCount,
      protectedEssentialCount,
      label: 'Direcao solta',
      description: 'Parte relevante do dia esta sem vinculo explicito com a direcao do sistema.',
    };
  }

  return {
    status: 'orientado',
    linkedCount,
    standaloneCount,
    protectedEssentialCount,
    label: 'Direcao orientada',
    description: 'A execucao conversa com metas, projetos ou essencial protegido sem virar score.',
  };
}

export function getDependencyImpact(item: Item, itemsById: Map<string, Item>): DependencyImpact {
  const metadata = (item.metadata || {}) as Record<string, unknown>;
  const blockedBy = metadata.blocked_by;
  if (!Array.isArray(blockedBy) || blockedBy.length === 0) return 'none';

  const dependencyItems = blockedBy
    .filter((value): value is string => typeof value === 'string')
    .map((id) => itemsById.get(id));

  if (dependencyItems.some((dependency) => !dependency)) return 'unknown';
  return dependencyItems.some((dependency) => dependency && dependency.status !== 'done' && dependency.status !== 'cancelled')
    ? 'blocking'
    : 'waiting';
}

export function getAttentionLevel(input: {
  overdueCount: number;
  capacityStatus: CapacityStatus;
  blockedInegociaveisCount: number;
}) {
  const overload = input.capacityStatus.signal === 'overloaded';

  if (input.overdueCount > 5 || overload) {
    return 'tension' as const;
  }

  if (input.overdueCount > 0 || input.capacityStatus.signal === 'loaded') {
    return 'attention' as const;
  }

  return 'neutral' as const;
}
