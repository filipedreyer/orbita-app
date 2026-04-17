import type { Item } from '../../../lib/types';
import {
  DEFAULT_OPERATIONAL_DAY_HOURS,
  getAttentionLevel,
  getFixedCommitmentHours,
  getInegociavelBlockHours,
  isActiveItem,
  isInegociavelBlock,
  isItemOfDay,
  isOverdueItem,
  isScheduledInegociavel,
  isTodayEventLike,
  isTodayHabitLike,
  isTodayInegociavel,
  isTodayTask,
} from './canonical';
import { normalizeRitualOrder, sortDayItems } from './ordering';

export interface DependencyChain {
  id: string;
  focusItemId: string;
  items: Item[];
}

export interface DependencyTreeNode {
  item: Item;
  children: DependencyTreeNode[];
  isFocusItem: boolean;
}

function getBlockedByIds(item: Item) {
  const metadata = item.metadata as Record<string, unknown>;
  const blockedBy = metadata.blocked_by;
  return Array.isArray(blockedBy) ? blockedBy.filter((value): value is string => typeof value === 'string') : [];
}

function buildDependencyChain(item: Item, itemsById: Map<string, Item>, seen = new Set<string>()): Item[] {
  if (seen.has(item.id)) {
    return [item];
  }

  seen.add(item.id);
  const directDependencies = getBlockedByIds(item);

  if (directDependencies.length === 0) {
    return [item];
  }

  const firstDependency = itemsById.get(directDependencies[0]);
  if (!firstDependency) {
    return [item];
  }

  return [...buildDependencyChain(firstDependency, itemsById, seen), item];
}

function buildDependencyTreeNode(
  item: Item,
  childrenById: Map<string, Item[]>,
  focusItemIds: Set<string>,
  seen = new Set<string>(),
): DependencyTreeNode {
  if (seen.has(item.id)) {
    return {
      item,
      children: [],
      isFocusItem: focusItemIds.has(item.id),
    };
  }

  seen.add(item.id);

  return {
    item,
    isFocusItem: focusItemIds.has(item.id),
    children: (childrenById.get(item.id) ?? []).map((child) =>
      buildDependencyTreeNode(child, childrenById, focusItemIds, new Set(seen)),
    ),
  };
}

function deriveDependencyTimeline(focusItems: Item[], allItems: Item[]) {
  const activeItems = allItems.filter((item) => isActiveItem(item));
  const itemsById = new Map(activeItems.map((item) => [item.id, item]));
  const focusItemIds = new Set(focusItems.map((item) => item.id));
  const relevantIds = new Set<string>();

  function collectRelevant(item: Item) {
    if (relevantIds.has(item.id)) return;
    relevantIds.add(item.id);
    getBlockedByIds(item).forEach((dependencyId) => {
      const dependency = itemsById.get(dependencyId);
      if (dependency) {
        collectRelevant(dependency);
      }
    });
  }

  focusItems.forEach((item) => {
    if (getBlockedByIds(item).length > 0) {
      collectRelevant(item);
    }
  });

  const dependencyItems = [...relevantIds].map((id) => itemsById.get(id)).filter((item): item is Item => !!item);
  const dependencyIds = new Set(dependencyItems.map((item) => item.id));
  const childrenById = new Map<string, Item[]>();

  dependencyItems.forEach((item) => {
    getBlockedByIds(item).forEach((dependencyId) => {
      if (!dependencyIds.has(dependencyId)) return;
      const current = childrenById.get(dependencyId) ?? [];
      childrenById.set(dependencyId, [...current, item]);
    });
  });

  const rootItems = dependencyItems.filter(
    (item) => getBlockedByIds(item).filter((dependencyId) => dependencyIds.has(dependencyId)).length === 0,
  );

  const chains = focusItems
    .filter((item) => getBlockedByIds(item).length > 0)
    .map((item) => {
      const chain = buildDependencyChain(item, itemsById);
      return {
        id: chain.map((entry) => entry.id).join('>'),
        focusItemId: item.id,
        items: chain,
      };
    });

  const uniqueChains = chains.filter((chain, index) => chains.findIndex((entry) => entry.id === chain.id) === index);

  return {
    items: dependencyItems,
    chains: uniqueChains,
    tree: rootItems.map((item) => buildDependencyTreeNode(item, childrenById, focusItemIds)),
  };
}

export function deriveHojeDomain(items: Item[], referenceDate: string, ritualOrder: string[] = []) {
  const rawDayItems = items.filter((item) => isItemOfDay(item, referenceDate));
  const overdueItems = items.filter((item) => isOverdueItem(item, referenceDate));
  const todayTasks = items.filter((item) => isTodayTask(item, referenceDate));
  const todayHabits = items.filter((item) => isTodayHabitLike(item));
  const todayEvents = items.filter((item) => isTodayEventLike(item, referenceDate));
  const activeInegociaveis = items.filter((item) => item.type === 'inegociavel' && isActiveItem(item));
  const fixedInegociaveis = activeInegociaveis.filter((item) => isTodayInegociavel(item));
  const capacityOnlyInegociaveis = activeInegociaveis.filter((item) => !isScheduledInegociavel(item));
  const rawFocusItems = rawDayItems.filter((item) => item.type !== 'evento' && item.type !== 'lembrete');
  const normalizedRitualOrder = normalizeRitualOrder(rawFocusItems, referenceDate, ritualOrder);
  const focusItems = sortDayItems(rawFocusItems, referenceDate, normalizedRitualOrder);
  const completedToday = items.filter((item) => item.status === 'done' && item.completed_at?.startsWith(referenceDate));

  const inegociavelBlockHours = activeInegociaveis.reduce((sum, item) => sum + getInegociavelBlockHours(item), 0);
  const fixedCommitmentHours = items.reduce((sum, item) => sum + getFixedCommitmentHours(item, referenceDate), 0);
  const operationalCapacity = Math.max(0, DEFAULT_OPERATIONAL_DAY_HOURS - inegociavelBlockHours - fixedCommitmentHours);

  const blockedInegociaveis = activeInegociaveis.filter((item) => isInegociavelBlock(item) && !!item.due_date && item.due_date < referenceDate);
  const attentionLevel = getAttentionLevel({
    overdueCount: overdueItems.length,
    dayItemsCount: focusItems.length,
    capacityHours: operationalCapacity,
    blockedInegociaveisCount: blockedInegociaveis.length,
  });

  const urgentItems = overdueItems;
  const cuidadoItems = focusItems.filter(
    (item) =>
      !urgentItems.some((urgent) => urgent.id === item.id) &&
      (item.priority === 'alta' || item.type === 'inegociavel'),
  );
  const radarItems = [...todayEvents, ...capacityOnlyInegociaveis].filter(
    (item, index, collection) =>
      !urgentItems.some((urgent) => urgent.id === item.id) &&
      !cuidadoItems.some((cuidado) => cuidado.id === item.id) &&
      collection.findIndex((entry) => entry.id === item.id) === index,
  );

  return {
    referenceDate,
    normalizedRitualOrder,
    dayItems: focusItems,
    focusItems,
    overdueItems,
    todayTasks,
    todayHabits,
    todayEvents,
    fixedInegociaveis,
    capacityOnlyInegociaveis,
    blockedInegociaveis,
    completedToday,
    attentionZones: {
      urgente: urgentItems,
      cuidado: cuidadoItems,
      radar: radarItems,
    },
    dependencyTimeline: deriveDependencyTimeline(focusItems, items),
    capacity: {
      totalHours: DEFAULT_OPERATIONAL_DAY_HOURS,
      inegociavelBlockHours,
      fixedCommitmentHours,
      operationalHours: operationalCapacity,
      overloadByItems: Math.max(0, focusItems.length - operationalCapacity),
    },
    attentionLevel,
  };
}

export function deriveRitualDomain(items: Item[], referenceDate: string, customOrder: string[] = []) {
  const hoje = deriveHojeDomain(items, referenceDate, customOrder);
  const rankById = new Map(hoje.normalizedRitualOrder.map((id, index) => [id, index]));

  const orderedTodayItems = [...hoje.focusItems].sort((left, right) => {
    const leftRank = rankById.get(left.id) ?? Number.MAX_SAFE_INTEGER;
    const rightRank = rankById.get(right.id) ?? Number.MAX_SAFE_INTEGER;
    return leftRank - rightRank;
  });

  return {
    ...hoje,
    ritualItems: orderedTodayItems,
    pendingItems: hoje.overdueItems,
  };
}

export function deriveEncerramentoDomain(items: Item[], referenceDate: string) {
  const hoje = deriveHojeDomain(items, referenceDate);
  const completedItems = hoje.completedToday;
  const respectedInegociaveis = hoje.fixedInegociaveis.filter(
    (item) => !hoje.blockedInegociaveis.some((blocked) => blocked.id === item.id),
  );

  return {
    referenceDate,
    completedItems,
    completedCount: completedItems.length,
    respectedInegociaveisCount: respectedInegociaveis.length,
    progressSummary: {
      tasksDone: completedItems.filter((item) => item.type === 'tarefa').length,
      habitsMarked: completedItems.filter((item) => item.type === 'habito' || item.type === 'rotina').length,
    },
  };
}
