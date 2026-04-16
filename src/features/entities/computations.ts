import type { Item } from '../../lib/types';
import { isPast } from '../../lib/dates';

export function getGoalDirection(items: Item[], goalId: string): 'up' | 'stable' | 'down' {
  const tasks = items.filter((item) => item.goal_id === goalId && item.type === 'tarefa' && item.status === 'active');
  const overdue = tasks.filter((item) => isPast(item.due_date)).length;
  const habits = items.filter((item) => item.goal_id === goalId && item.type === 'habito' && item.status === 'active');
  const lowStreak = habits.filter((habit) => (Number((habit.metadata as Record<string, unknown>)?.streak) || 0) < 3).length;

  if (overdue > 1 || lowStreak > habits.length / 2) return 'down';
  if (overdue === 0 && lowStreak === 0) return 'up';
  return 'stable';
}

export function getGoalProgress(items: Item[], goalId: string) {
  const tasks = items.filter((item) => item.goal_id === goalId && item.type === 'tarefa');
  const habits = items.filter((item) => item.goal_id === goalId && item.type === 'habito' && item.status === 'active');

  const tasksDone = tasks.filter((item) => item.status === 'done').length;
  const tasksTotal = tasks.length;
  const avgStreak = habits.length > 0
    ? habits.reduce((sum, habit) => sum + (Number((habit.metadata as Record<string, unknown>)?.streak) || 0), 0) / habits.length
    : 0;

  const taskProgress = tasksTotal > 0 ? (tasksDone / tasksTotal) * 100 : 0;
  const percentage = habits.length > 0
    ? Math.round(taskProgress * 0.6 + Math.min(avgStreak / 14, 1) * 100 * 0.4)
    : Math.round(taskProgress);

  return {
    percentage,
    direction: getGoalDirection(items, goalId),
    tasksTotal,
    tasksDone,
    habitsCount: habits.length,
    avgStreak: Math.round(avgStreak),
  };
}
