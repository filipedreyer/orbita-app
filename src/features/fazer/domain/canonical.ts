import type { InegociavelMetadata, Item } from '../../../lib/types';

import type { EntityType } from '../../../lib/types';

export const DAY_ENTITY_TYPES: readonly EntityType[] = ['tarefa', 'habito', 'rotina', 'evento', 'lembrete', 'inegociavel'];
export const ATTENTION_LEVELS = ['neutral', 'attention', 'tension'] as const;

// DECISÃO: usar 16h como janela operacional diária até existir configuração persistida por usuário.
export const DEFAULT_OPERATIONAL_DAY_HOURS = 16;

// DECISÃO: eventos e lembretes do dia contam como 1h de compromisso fixo até existir duração real no modelo.
export const DEFAULT_FIXED_COMMITMENT_HOURS = 1;

export function isActiveItem(item: Item) {
  return item.status === 'active';
}

export function isDayRelevantType(item: Item) {
  return DAY_ENTITY_TYPES.includes(item.type);
}

export function isOverdueItem(item: Item, referenceDate: string) {
  return item.type === 'tarefa' && isActiveItem(item) && !!item.due_date && item.due_date < referenceDate;
}

export function isTodayEventLike(item: Item, referenceDate: string) {
  return (item.type === 'evento' || item.type === 'lembrete') && isActiveItem(item) && item.due_date === referenceDate;
}

export function isTodayHabitLike(item: Item) {
  return (item.type === 'habito' || item.type === 'rotina') && isActiveItem(item);
}

export function isTodayTask(item: Item, referenceDate: string) {
  return item.type === 'tarefa' && isActiveItem(item) && (!item.due_date || item.due_date <= referenceDate);
}

export function isTodayInegociavel(item: Item) {
  return item.type === 'inegociavel' && isActiveItem(item);
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
  return item.type === 'inegociavel' ? (item.metadata as InegociavelMetadata) : null;
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

export function getFixedCommitmentHours(item: Item, referenceDate: string) {
  return isTodayEventLike(item, referenceDate) ? DEFAULT_FIXED_COMMITMENT_HOURS : 0;
}

export function getAttentionLevel(input: {
  overdueCount: number;
  dayItemsCount: number;
  capacityHours: number;
  blockedInegociaveisCount: number;
}) {
  const overload = input.dayItemsCount > input.capacityHours;
  const severeOverload = input.dayItemsCount > input.capacityHours * 1.3;

  if (input.blockedInegociaveisCount > 0 || input.overdueCount > 5 || severeOverload) {
    return 'tension' as const;
  }

  if (input.overdueCount > 0 || overload) {
    return 'attention' as const;
  }

  return 'neutral' as const;
}
