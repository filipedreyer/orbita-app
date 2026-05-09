import { invokeAIFunction } from './invoke';

export type AnalyzeTextPayload = {
  text: string;
};

export type AnalyzeTextResponse = {
  suggestions: Array<{
    type: 'tarefa' | 'lembrete' | 'nota';
    title: string;
    confidence: 'low' | 'medium' | 'high';
  }>;
};

type RawAnalyzeTextResponse = {
  suggestions: Array<{
    type: AnalyzeTextResponse['suggestions'][number]['type'] | 'ideia';
    title: string;
    confidence: AnalyzeTextResponse['suggestions'][number]['confidence'];
  }>;
};

const ANALYZE_TEXT_TIMEOUT_MS = 7000;

function isValidSuggestion(value: unknown): value is RawAnalyzeTextResponse['suggestions'][number] {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return (
    ['tarefa', 'lembrete', 'nota', 'ideia'].includes(String(record.type)) &&
    typeof record.title === 'string' &&
    record.title.trim().length > 0 &&
    ['low', 'medium', 'high'].includes(String(record.confidence))
  );
}

function isValidResponse(value: unknown): value is RawAnalyzeTextResponse {
  if (!value || typeof value !== 'object') return false;
  const suggestions = (value as { suggestions?: unknown }).suggestions;
  return Array.isArray(suggestions) && suggestions.every(isValidSuggestion);
}

export async function analyzeTextWithAI(payload: AnalyzeTextPayload): Promise<AnalyzeTextResponse | null> {
  const { data, error } = await invokeAIFunction<RawAnalyzeTextResponse>(
    'ia-analyze-text',
    payload,
    ANALYZE_TEXT_TIMEOUT_MS,
  );

  if (error || !isValidResponse(data)) {
    return null;
  }

  return {
    suggestions: data.suggestions.map((suggestion) => ({
      type: suggestion.type === 'ideia' ? 'nota' : suggestion.type,
      title: suggestion.title.trim(),
      confidence: suggestion.confidence,
    })),
  };
}
