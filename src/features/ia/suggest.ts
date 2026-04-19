import type { Item } from '../../lib/types';
import { invokeAIFunction } from './invoke';
import type { IASuggestResult, IASuggestionItem, IASuggestType } from './types';

const SUGGEST_TIMEOUT_MS = 7000;
const MAX_SUGGESTIONS = 3;

type SuggestDayItem = {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string | null;
  due_date: string | null;
  linked: boolean;
  scheduledToday: boolean;
  overdue: boolean;
};

export type SuggestDayPayload = {
  capacity: {
    signal: 'balanced' | 'loaded' | 'overloaded';
    agoraCount: number;
    cabeCount: number;
  };
  items: SuggestDayItem[];
  inegociaveis: {
    fixedCount: number;
    capacityOnlyCount: number;
    blockedCount: number;
  };
  nearbyDays?: Array<{
    date: string;
    signal: 'balanced' | 'loaded' | 'overloaded';
    scheduledCount: number;
  }>;
};

function isValidSuggestionType(value: unknown): value is IASuggestType {
  return value === 'defer' || value === 'keep' || value === 'highlight';
}

function isValidSuggestion(
  value: unknown,
  validIds: Set<string>,
  seenIds: Set<string>,
): value is IASuggestionItem {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  if (!isValidSuggestionType(record.type)) return false;
  if (typeof record.itemId !== 'string' || !validIds.has(record.itemId) || seenIds.has(record.itemId)) return false;
  if (typeof record.reason !== 'string' || record.reason.trim().length === 0) return false;
  seenIds.add(record.itemId);
  return true;
}

function isValidSuggestResult(value: unknown, validIds: Set<string>): value is IASuggestResult {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  if (typeof record.summary !== 'string' || record.summary.trim().length === 0) return false;
  if (!Array.isArray(record.suggestions)) return false;
  if (record.suggestions.length > MAX_SUGGESTIONS) return false;

  const seenIds = new Set<string>();
  return record.suggestions.every((entry) => isValidSuggestion(entry, validIds, seenIds));
}

export function buildSuggestDayPayload({
  items,
  capacitySignal,
  agoraCount,
  cabeCount,
  referenceDate,
  fixedInegociaveis,
  capacityOnlyInegociaveis,
  blockedInegociaveis,
  linkedResolver,
}: {
  items: Item[];
  capacitySignal: 'balanced' | 'loaded' | 'overloaded';
  agoraCount: number;
  cabeCount: number;
  referenceDate: string;
  fixedInegociaveis: Item[];
  capacityOnlyInegociaveis: Item[];
  blockedInegociaveis: Item[];
  linkedResolver: (item: Item) => { linked: boolean };
}): SuggestDayPayload {
  return {
    capacity: {
      signal: capacitySignal,
      agoraCount,
      cabeCount,
    },
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      status: item.status,
      priority: item.priority,
      due_date: item.due_date ?? null,
      linked: linkedResolver(item).linked,
      scheduledToday: item.due_date === referenceDate,
      overdue: !!item.due_date && item.due_date < referenceDate,
    })),
    inegociaveis: {
      fixedCount: fixedInegociaveis.length,
      capacityOnlyCount: capacityOnlyInegociaveis.length,
      blockedCount: blockedInegociaveis.length,
    },
  };
}

export function extendSuggestDayPayload(
  payload: SuggestDayPayload,
  extension: Pick<SuggestDayPayload, 'nearbyDays'>,
): SuggestDayPayload {
  return {
    ...payload,
    ...extension,
  };
}

export async function suggestDayWithAI(payload: SuggestDayPayload) {
  const { data, error } = await invokeAIFunction<IASuggestResult>('ia-suggest', payload, SUGGEST_TIMEOUT_MS);
  const validIds = new Set(payload.items.map((item) => item.id));

  if (error || !isValidSuggestResult(data, validIds)) {
    return null;
  }

  return {
    summary: data.summary.trim(),
    suggestions: data.suggestions.slice(0, MAX_SUGGESTIONS).map((suggestion) => ({
      type: suggestion.type,
      itemId: suggestion.itemId,
      reason: suggestion.reason.trim(),
    })),
  };
}

export { SUGGEST_TIMEOUT_MS };
