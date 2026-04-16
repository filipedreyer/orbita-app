import type { Item } from '../../../lib/types';
import {
  DEFAULT_OPERATIONAL_DAY_HOURS,
  getAttentionLevel,
  getFixedCommitmentHours,
  getInegociavelBlockHours,
  isInegociavelBlock,
  isItemOfDay,
  isOverdueItem,
  isTodayEventLike,
  isTodayHabitLike,
  isTodayInegociavel,
  isTodayTask,
} from './canonical';
import { sortDayItems } from './ordering';

export function deriveHojeDomain(items: Item[], referenceDate: string, ritualOrder: string[] = []) {
  const dayItems = sortDayItems(items.filter((item) => isItemOfDay(item, referenceDate)), referenceDate, ritualOrder);
  const overdueItems = items.filter((item) => isOverdueItem(item, referenceDate));
  const todayTasks = items.filter((item) => isTodayTask(item, referenceDate));
  const todayHabits = items.filter((item) => isTodayHabitLike(item));
  const todayEvents = items.filter((item) => isTodayEventLike(item, referenceDate));
  const inegociaveis = items.filter((item) => isTodayInegociavel(item));
  const completedToday = items.filter((item) => item.status === 'done' && item.completed_at?.startsWith(referenceDate));

  const inegociavelBlockHours = inegociaveis.reduce((sum, item) => sum + getInegociavelBlockHours(item), 0);
  const fixedCommitmentHours = items.reduce((sum, item) => sum + getFixedCommitmentHours(item, referenceDate), 0);
  const operationalCapacity = Math.max(0, DEFAULT_OPERATIONAL_DAY_HOURS - inegociavelBlockHours - fixedCommitmentHours);

  const blockedInegociaveis = inegociaveis.filter((item) => isInegociavelBlock(item) && !!item.due_date && item.due_date < referenceDate);
  const attentionLevel = getAttentionLevel({
    overdueCount: overdueItems.length,
    dayItemsCount: dayItems.length,
    capacityHours: operationalCapacity,
    blockedInegociaveisCount: blockedInegociaveis.length,
  });

  return {
    referenceDate,
    dayItems,
    overdueItems,
    todayTasks,
    todayHabits,
    todayEvents,
    inegociaveis,
    blockedInegociaveis,
    completedToday,
    capacity: {
      totalHours: DEFAULT_OPERATIONAL_DAY_HOURS,
      inegociavelBlockHours,
      fixedCommitmentHours,
      operationalHours: operationalCapacity,
      overloadByItems: Math.max(0, dayItems.length - operationalCapacity),
    },
    attentionLevel,
  };
}

export function deriveRitualDomain(items: Item[], referenceDate: string, customOrder: string[] = []) {
  const hoje = deriveHojeDomain(items, referenceDate, customOrder);
  const rankById = new Map(customOrder.map((id, index) => [id, index]));

  const orderedTodayItems = [...hoje.dayItems].sort((left, right) => {
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
  const respectedInegociaveis = hoje.inegociaveis.filter((item) => !hoje.blockedInegociaveis.some((blocked) => blocked.id === item.id));

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
