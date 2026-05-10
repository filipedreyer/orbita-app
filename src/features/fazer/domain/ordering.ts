import type { Item } from '../../../lib/types';
import { isLegacyInegociavel } from '../../../lib/entity-domain';
import { isOverdueItem, isScheduledInegociavel } from './canonical';

export const DAY_SUBGROUPS = ['A', 'B', 'C', 'D'] as const;
export type DaySubgroup = (typeof DAY_SUBGROUPS)[number];

function getPlanningHorizon(item: Item) {
  const metadata = item.metadata as Record<string, unknown>;
  const horizon = metadata.horizonte;
  return horizon === 'imediato' || horizon === 'semana' || horizon === 'depois' ? horizon : null;
}

export function hasOperationalCommitment(item: Item) {
  const metadata = item.metadata as Record<string, unknown>;
  return metadata.compromisso_operacional === true;
}

export function isOperationalCommitmentCoherent(item: Item) {
  const horizon = getPlanningHorizon(item);

  // DECISÃO: nesta mini-fase, o horizonte serve apenas como validação leve e transitória
  // para `compromisso_operacional`; isso não define o modelo final de integração.
  return hasOperationalCommitment(item) && horizon === 'imediato';
}

export function getDaySubgroup(item: Item): DaySubgroup {
  // DECISÃO: nesta mini-fase, os subgrupos operacionais são restaurados com a semântica
  // mínima necessária para o fluxo atual de Hoje/Ritual:
  // A = compromissos fixos do dia (evento, lembrete, legado essencial protegido com horario)
  // B = entregas/tarefas datadas
  // C = práticas recorrentes (hábito, rotina)
  // D = tarefas flexíveis sem data
  if (item.type === 'evento' || item.type === 'lembrete' || isRitualLockedItem(item)) {
    return 'A';
  }

  if (item.type === 'tarefa' && item.due_date) {
    return 'B';
  }

  if (item.type === 'habito' || item.type === 'rotina') {
    return 'C';
  }

  return 'D';
}

export function isRitualLockedItem(item: Item) {
  return isLegacyInegociavel(item.type) && isScheduledInegociavel(item);
}

function sortDayItemsAutomatically(items: Item[], referenceDate: string) {
  const priorityRank: Record<string, number> = { alta: 0, media: 1, baixa: 2 };
  const subgroupRank: Record<DaySubgroup, number> = { A: 0, B: 1, C: 2, D: 3 };

  return [...items].sort((left, right) => {
    const leftSubgroup = subgroupRank[getDaySubgroup(left)];
    const rightSubgroup = subgroupRank[getDaySubgroup(right)];
    if (leftSubgroup !== rightSubgroup) return leftSubgroup - rightSubgroup;

    const leftOverdue = isOverdueItem(left, referenceDate) ? 0 : 1;
    const rightOverdue = isOverdueItem(right, referenceDate) ? 0 : 1;
    if (leftOverdue !== rightOverdue) return leftOverdue - rightOverdue;

    const leftCommitted = isOperationalCommitmentCoherent(left) ? 0 : 1;
    const rightCommitted = isOperationalCommitmentCoherent(right) ? 0 : 1;
    if (leftCommitted !== rightCommitted) return leftCommitted - rightCommitted;

    const leftPriority = priorityRank[left.priority ?? ''] ?? 3;
    const rightPriority = priorityRank[right.priority ?? ''] ?? 3;
    if (leftPriority !== rightPriority) return leftPriority - rightPriority;

    return (left.due_date ?? '9999-12-31').localeCompare(right.due_date ?? '9999-12-31');
  });
}

export function normalizeRitualOrder(dayItems: Item[], referenceDate: string, ritualOrder: string[] = []) {
  const autoSortedItems = sortDayItemsAutomatically(dayItems, referenceDate);
  const sortableItems = autoSortedItems.filter((item) => !isRitualLockedItem(item));
  const validIds = new Set(sortableItems.map((item) => item.id));
  const uniqueManualIds = ritualOrder.filter((id, index) => validIds.has(id) && ritualOrder.indexOf(id) === index);
  const remainingIds = sortableItems.filter((item) => !uniqueManualIds.includes(item.id)).map((item) => item.id);

  return [...uniqueManualIds, ...remainingIds];
}

export function sortDayItems(items: Item[], referenceDate: string, ritualOrder: string[] = []) {
  const autoSortedItems = sortDayItemsAutomatically(items, referenceDate);
  const normalizedRitualOrder = normalizeRitualOrder(items, referenceDate, ritualOrder);
  const sortableQueue = normalizedRitualOrder
    .map((id) => autoSortedItems.find((item) => item.id === id))
    .filter((item): item is Item => !!item);

  return autoSortedItems.map((item) => {
    if (isRitualLockedItem(item)) {
      return item;
    }

    return sortableQueue.shift() ?? item;
  });
}
