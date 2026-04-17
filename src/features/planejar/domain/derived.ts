import type { Item } from '../../../lib/types';
import { deriveHojeDomain } from '../../fazer/domain/derived';
import { isActiveItem } from '../../fazer/domain/canonical';
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

export function derivePlanejarPortfolio(items: Item[], referenceDate: string) {
  const activeItems = items.filter(isActiveItem);
  const goals = activeItems.filter((item) => item.type === 'meta');
  const projects = activeItems.filter((item) => item.type === 'projeto');
  const habits = activeItems.filter((item) => item.type === 'habito');
  const inegociaveis = activeItems.filter((item) => item.type === 'inegociavel');

  const projectsByGoal = new Map<string, Item[]>();
  projects.forEach((project) => {
    if (!project.goal_id) return;
    const current = projectsByGoal.get(project.goal_id) ?? [];
    projectsByGoal.set(project.goal_id, [...current, project]);
  });

  const tasksByProject = new Map<string, Item[]>();
  activeItems
    .filter((item) => item.type === 'tarefa' && item.project_id)
    .forEach((task) => {
      if (!task.project_id) return;
      const current = tasksByProject.get(task.project_id) ?? [];
      tasksByProject.set(task.project_id, [...current, task]);
    });

  const weeklyReview = {
    referenceDate,
    goalsCount: goals.length,
    projectsCount: projects.length,
    habitsCount: habits.length,
    inegociaveisCount: inegociaveis.length,
    completedThisWeek: items.filter((item) => item.status === 'done' && !!item.completed_at && item.completed_at.slice(0, 10) >= referenceDate.slice(0, 8) + '01').length,
    overdueOpenCount: items.filter((item) => item.type === 'tarefa' && item.status === 'active' && !!item.due_date && item.due_date < referenceDate).length,
  };

  return {
    referenceDate,
    goals,
    projects,
    habits,
    inegociaveis,
    projectsByGoal,
    tasksByProject,
    weeklyReview,
  };
}
