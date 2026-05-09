import type { CanonicalEntityType } from '../../lib/entity-domain';
import { invokeAIFunction } from './invoke';

const CLASSIFY_INBOX_TIMEOUT_MS = 6000;

export type InboxClassificationSuggestion = {
  suggestedType: Exclude<CanonicalEntityType, 'lista'>;
  suggestedLink: {
    kind: 'project' | 'goal' | 'none';
    label: string | null;
  };
  confidence: 'low' | 'medium' | 'high';
  reason: string;
};

export type InboxClassificationPayload = {
  text: string;
  existingContext: {
    knownProjects: string[];
    knownGoals: string[];
  };
};

const ALLOWED_TYPES = new Set([
  'tarefa',
  'nota',
  'lembrete',
  'meta',
  'projeto',
  'habito',
  'rotina',
  'evento',
]);

export function buildInboxClassificationPayload({
  text,
  knownProjects,
  knownGoals,
}: {
  text: string;
  knownProjects: string[];
  knownGoals: string[];
}): InboxClassificationPayload {
  return {
    text,
    existingContext: {
      knownProjects,
      knownGoals,
    },
  };
}

function isValidSuggestion(data: unknown): data is InboxClassificationSuggestion {
  if (!data || typeof data !== 'object') return false;
  const record = data as Record<string, unknown>;
  const suggestedType = record.suggestedType;
  const suggestedLink = record.suggestedLink;
  const confidence = record.confidence;
  const reason = record.reason;

  if (typeof suggestedType !== 'string' || !ALLOWED_TYPES.has(suggestedType)) return false;
  if (!suggestedLink || typeof suggestedLink !== 'object') return false;
  const linkRecord = suggestedLink as Record<string, unknown>;
  if (!['project', 'goal', 'none'].includes(String(linkRecord.kind))) return false;
  if (!(typeof linkRecord.label === 'string' || linkRecord.label === null)) return false;
  if (!['low', 'medium', 'high'].includes(String(confidence))) return false;
  if (typeof reason !== 'string' || reason.trim().length === 0) return false;

  return true;
}

export async function classifyInboxWithAI(payload: InboxClassificationPayload) {
  const { data, error } = await invokeAIFunction<InboxClassificationSuggestion>(
    'ia-classify-inbox',
    payload,
    CLASSIFY_INBOX_TIMEOUT_MS,
  );

  if (error || !isValidSuggestion(data)) {
    return null;
  }

  return data;
}
