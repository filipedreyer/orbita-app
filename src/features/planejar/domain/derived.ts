import type { Item } from '../../../lib/types';
import { deriveHojeDomain } from '../../fazer/domain/derived';
import {
  BASIC_PRIORITY_RULE,
  compareByBasicPriority,
  getBlockingDependencyIds,
  getPlanningHorizon,
  hasBlockingDependency,
  isBacklogItem,
  isEligibleForPlanning,
  isPlanningCandidate,
  isReadyForFazer,
} from './canonical';

export function derivePlanejarDomain(items: Item[], referenceDate: string) {
  const candidateItems = items.filter(isPlanningCandidate);
  const eligibleItems = candidateItems.filter(isEligibleForPlanning);
  const prioritizedItems = [...eligibleItems].sort((left, right) => compareByBasicPriority(left, right, referenceDate));
  const backlogItems = prioritizedItems.filter((item) => isBacklogItem(item, referenceDate));
  const blockedItems = prioritizedItems.filter((item) => hasBlockingDependency(item, eligibleItems));
  const readyForFazerItems = prioritizedItems.filter((item) => isReadyForFazer(item, eligibleItems, referenceDate));
  const capacity = deriveHojeDomain(items, referenceDate).capacity;

  return {
    referenceDate,
    priorityRule: BASIC_PRIORITY_RULE,
    capacity,
    eligibleItems,
    backlogItems,
    blockedItems,
    readyForFazerItems,
    prioritizedItems,
    horizonBuckets: {
      imediato: prioritizedItems.filter((item) => getPlanningHorizon(item, referenceDate) === 'imediato'),
      semana: prioritizedItems.filter((item) => getPlanningHorizon(item, referenceDate) === 'semana'),
      depois: prioritizedItems.filter((item) => getPlanningHorizon(item, referenceDate) === 'depois'),
    },
    dependencies: prioritizedItems.map((item) => ({
      item,
      blocked: hasBlockingDependency(item, eligibleItems),
      blockedByIds: getBlockingDependencyIds(item),
    })),
  };
}
