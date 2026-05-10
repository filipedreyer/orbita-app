import { invokeAIFunction } from './invoke';
import type { IAOnboardingResponse, IAOnboardingSuggestion } from './types';

const ONBOARDING_TIMEOUT_MS = 7000;
const MAX_SUGGESTIONS = 5;

export type IAOnboardingStepKey = 'goals' | 'projects' | 'habits' | 'inegociaveis';

export type IAOnboardingPayload = {
  step: IAOnboardingStepKey;
  userInput: string;
  existingStructure?: {
    goals?: Array<{ id: string; title: string }>;
    projects?: Array<{ id: string; title: string; goal_id?: string | null }>;
    habits?: Array<{ id: string; title: string }>;
    inegociaveis?: Array<{ id: string; title: string }>;
  };
};

type RawOnboardingSuggestion = Omit<IAOnboardingSuggestion, 'type'> & {
  type: IAOnboardingSuggestion['type'] | 'inegociavel';
};

type RawOnboardingResponse = {
  suggestions: RawOnboardingSuggestion[];
};

function isValidSuggestion(value: unknown): value is RawOnboardingSuggestion {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  const validType =
    record.type === 'meta' || record.type === 'projeto' || record.type === 'habito' || record.type === 'essencial_protegido' || record.type === 'inegociavel';
  const validDescription =
    record.description === undefined || record.description === null || typeof record.description === 'string';
  const validLinkedTo = record.linkedTo === undefined || record.linkedTo === null || typeof record.linkedTo === 'string';

  return validType && typeof record.title === 'string' && record.title.trim().length > 0 && validDescription && validLinkedTo;
}

function isValidResponse(value: unknown): value is RawOnboardingResponse {
  if (!value || typeof value !== 'object') return false;
  const suggestions = (value as { suggestions?: unknown }).suggestions;
  return Array.isArray(suggestions) && suggestions.length <= MAX_SUGGESTIONS && suggestions.every(isValidSuggestion);
}

export async function runOnboardingWithAI(payload: IAOnboardingPayload): Promise<IAOnboardingResponse | null> {
  const { data, error } = await invokeAIFunction<RawOnboardingResponse>('ia-onboarding', payload, ONBOARDING_TIMEOUT_MS);

  if (error || !isValidResponse(data)) {
    return null;
  }

  return {
    suggestions: data.suggestions.slice(0, MAX_SUGGESTIONS).map((suggestion) => ({
      type: suggestion.type === 'inegociavel' ? 'essencial_protegido' : suggestion.type,
      title: suggestion.title.trim(),
      description: suggestion.description?.trim() || undefined,
      linkedTo: suggestion.linkedTo || undefined,
    })),
  };
}
