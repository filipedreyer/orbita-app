import type { EntityType, Item, PriorityLevel } from '../../../lib/types';
import { isActiveItem, isDayRelevantType, isOverdueItem } from '../../fazer/domain/canonical';

export const PLANNING_ENTITY_TYPES: readonly EntityType[] = [
  'tarefa',
  'projeto',
  'meta',
  'habito',
  'rotina',
  'evento',
  'lembrete',
  'lista',
  'ideia',
  'inegociavel',
];

export const PLANNING_HORIZONS = ['imediato', 'semana', 'depois'] as const;

export type PlanningHorizon = (typeof PLANNING_HORIZONS)[number];

export interface PlanningMetadata {
  horizonte?: PlanningHorizon;
  blocked_by?: string[];
}

// Regra nomeada e deterministica desta fase:
// prioridade explicita > atraso > prazo mais cedo > item mais antigo > titulo > id.
export const BASIC_PRIORITY_RULE = 'prioridade-explicita > atraso > prazo > antiguidade > titulo > id';

const PRIORITY_RANK: Record<PriorityLevel, number> = {
  alta: 0,
  media: 1,
  baixa: 2,
};

function addDays(referenceDate: string, days: number) {
  const date = new Date(`${referenceDate}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getPlanningMetadata(item: Item): PlanningMetadata {
  const metadata = item.metadata as Record<string, unknown>;
  const horizonte = metadata.horizonte;
  const blockedBy = metadata.blocked_by;

  return {
    horizonte: horizonte === 'imediato' || horizonte === 'semana' || horizonte === 'depois' ? horizonte : undefined,
    blocked_by: Array.isArray(blockedBy) ? blockedBy.filter((value): value is string => typeof value === 'string') : undefined,
  };
}

export function isPlanningCandidate(item: Item) {
  return isActiveItem(item) && PLANNING_ENTITY_TYPES.includes(item.type);
}

export function getPlanningHorizon(item: Item, referenceDate: string): PlanningHorizon {
  const metadata = getPlanningMetadata(item);
  if (metadata.horizonte) return metadata.horizonte;

  if (item.due_date && item.due_date <= referenceDate) {
    return 'imediato';
  }

  if (item.due_date && item.due_date <= addDays(referenceDate, 7)) {
    return 'semana';
  }

  return 'depois';
}

export function hasBlockingDependency(item: Item, allItems: Item[]) {
  const metadata = getPlanningMetadata(item);
  const blockedBy = metadata.blocked_by ?? [];

  if (blockedBy.length === 0) return false;

  return blockedBy.some((dependencyId) => {
    const dependency = allItems.find((candidate) => candidate.id === dependencyId);
    if (!dependency) return true;
    return dependency.status !== 'done' && dependency.status !== 'cancelled';
  });
}

export function getBlockingDependencyIds(item: Item) {
  return getPlanningMetadata(item).blocked_by ?? [];
}

export function isEligibleForPlanning(item: Item) {
  return isPlanningCandidate(item);
}

export function isBacklogItem(item: Item, referenceDate: string) {
  return isEligibleForPlanning(item) && getPlanningHorizon(item, referenceDate) !== 'imediato';
}

export function isReadyForFazer(item: Item, allItems: Item[], referenceDate: string) {
  return (
    isEligibleForPlanning(item) &&
    isDayRelevantType(item) &&
    getPlanningHorizon(item, referenceDate) === 'imediato' &&
    !hasBlockingDependency(item, allItems)
  );
}

export function compareByBasicPriority(left: Item, right: Item, referenceDate: string) {
  const leftPriority = left.priority ? PRIORITY_RANK[left.priority] : 3;
  const rightPriority = right.priority ? PRIORITY_RANK[right.priority] : 3;
  if (leftPriority !== rightPriority) return leftPriority - rightPriority;

  const leftOverdue = isOverdueItem(left, referenceDate) ? 0 : 1;
  const rightOverdue = isOverdueItem(right, referenceDate) ? 0 : 1;
  if (leftOverdue !== rightOverdue) return leftOverdue - rightOverdue;

  const leftDueDate = left.due_date ?? '9999-12-31';
  const rightDueDate = right.due_date ?? '9999-12-31';
  if (leftDueDate !== rightDueDate) return leftDueDate.localeCompare(rightDueDate);

  if (left.created_at !== right.created_at) return left.created_at.localeCompare(right.created_at);

  const titleRank = left.title.localeCompare(right.title, 'pt-BR');
  if (titleRank !== 0) return titleRank;

  return left.id.localeCompare(right.id);
}
