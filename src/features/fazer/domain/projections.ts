import type { Item } from '../../../lib/types';
import { deriveHojeDomain } from './derived';

export function projectHojeSections(items: Item[], referenceDate: string, ritualOrder: string[] = []) {
  const domain = deriveHojeDomain(items, referenceDate, ritualOrder);

  return {
    header: {
      attentionLevel: domain.attentionLevel,
      dayItemsCount: domain.dayItems.length,
      operationalHours: domain.capacity.operationalHours,
      overdueCount: domain.overdueItems.length,
    },
    sections: {
      reminders: domain.todayEvents,
      inegociaveis: domain.inegociaveis,
      focusItems: domain.dayItems.filter((item) => item.status === 'active'),
      completed: domain.completedToday,
    },
    attention: {
      level: domain.attentionLevel,
      reasons: [
        domain.overdueItems.length > 0 ? `${domain.overdueItems.length} pendências atrasadas` : null,
        domain.capacity.overloadByItems > 0 ? `sobrecarga de ${domain.capacity.overloadByItems} itens` : null,
        domain.blockedInegociaveis.length > 0 ? `${domain.blockedInegociaveis.length} inegociáveis comprometidos` : null,
      ].filter(Boolean) as string[],
    },
    timeline: {
      capacity: domain.capacity,
      events: domain.todayEvents,
      inegociaveis: domain.inegociaveis,
    },
  };
}
