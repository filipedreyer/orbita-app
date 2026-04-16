import type { Item } from '../../../lib/types';
import { derivePlanejarDomain } from './derived';
import { getPlanningHorizon } from './canonical';

function mapItem(item: Item, referenceDate: string) {
  return {
    id: item.id,
    title: item.title,
    type: item.type,
    priority: item.priority,
    dueDate: item.due_date,
    horizon: getPlanningHorizon(item, referenceDate),
    rawItem: item,
  };
}

export function projectPlanejarView(items: Item[], referenceDate: string) {
  const domain = derivePlanejarDomain(items, referenceDate);

  return {
    summary: {
      eligibleCount: domain.eligibleItems.length,
      backlogCount: domain.backlogItems.length,
      blockedCount: domain.blockedItems.length,
      readyCount: domain.readyForFazerItems.length,
      operationalHours: domain.capacity.operationalHours,
      overloadByItems: domain.capacity.overloadByItems,
      priorityRule: domain.priorityRule,
    },
    backlog: domain.backlogItems.map((item) => mapItem(item, referenceDate)),
    priorities: domain.prioritizedItems.map((item) => ({
      ...mapItem(item, referenceDate),
      overdue: !!item.due_date && item.due_date < referenceDate,
    })),
    dependencies: domain.dependencies.map((entry) => ({
      ...mapItem(entry.item, referenceDate),
      blocked: entry.blocked,
      blockedByIds: entry.blockedByIds,
      dependencyOptions: domain.eligibleItems
        .filter((candidate) => candidate.id !== entry.item.id)
        .map((candidate) => ({
          id: candidate.id,
          title: candidate.title,
          type: candidate.type,
        })),
    })),
    ready: domain.readyForFazerItems.map((item) => mapItem(item, referenceDate)),
    horizons: {
      imediato: domain.horizonBuckets.imediato.map((item) => mapItem(item, referenceDate)),
      semana: domain.horizonBuckets.semana.map((item) => mapItem(item, referenceDate)),
      depois: domain.horizonBuckets.depois.map((item) => mapItem(item, referenceDate)),
    },
  };
}
