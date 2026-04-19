import { supabase } from '../../lib/supabase';
import type { IATextAnalysisSuggestion } from './types';

export type AnalyzeTextPayload = {
  text: string;
};

export type AnalyzeTextResponse = {
  suggestions: IATextAnalysisSuggestion[];
};

const ANALYZE_TEXT_TIMEOUT_MS = 7000;

function isValidSuggestion(value: unknown): value is IATextAnalysisSuggestion {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    ['tarefa', 'lembrete', 'ideia'].includes(String(record.type)) &&
    typeof record.title === 'string' &&
    record.title.trim().length > 0 &&
    ['low', 'medium', 'high'].includes(String(record.confidence))
  );
}

function isValidResponse(value: unknown): value is AnalyzeTextResponse {
  if (!value || typeof value !== 'object') return false;
  const suggestions = (value as { suggestions?: unknown }).suggestions;
  return Array.isArray(suggestions) && suggestions.every(isValidSuggestion);
}

export async function analyzeTextWithAI(payload: AnalyzeTextPayload): Promise<AnalyzeTextResponse | null> {
  const invokePromise = supabase.functions.invoke<AnalyzeTextResponse>('ia-analyze-text', {
    body: payload,
  });
  const timeoutPromise = new Promise<never>((_, reject) => {
    window.setTimeout(() => reject(new Error('timeout')), ANALYZE_TEXT_TIMEOUT_MS);
  });

  let data: AnalyzeTextResponse | null = null;
  let error: unknown = null;

  try {
    const result = await Promise.race([invokePromise, timeoutPromise]);
    data = result.data ?? null;
    error = result.error;
  } catch {
    return null;
  }

  if (error || !isValidResponse(data)) {
    return null;
  }

  return {
    suggestions: data.suggestions.map((suggestion) => ({
      type: suggestion.type,
      title: suggestion.title.trim(),
      confidence: suggestion.confidence,
    })),
  };
}
