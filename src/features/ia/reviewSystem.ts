import { supabase } from '../../lib/supabase';

const REVIEW_SYSTEM_TIMEOUT_MS = 7000;
const MIN_SYSTEM_READING_LENGTH = 24;

export type ReviewSystemPayload = {
  execution: {
    activeCount: number;
    completedRecent: number;
    standaloneCount: number;
    linkedCount: number;
  };
  risk: {
    overdueCount: number;
    staleCount: number;
    postponedCount: number;
  };
  direction: {
    goalsWithoutExecution: number;
    projectsWithoutSteps: number;
    habitsNotReflected: number;
  };
};

function isValidReadingResponse(data: unknown): data is { reading: string } {
  if (!data || typeof data !== 'object') return false;
  const record = data as Record<string, unknown>;
  return typeof record.reading === 'string' && record.reading.trim().length >= MIN_SYSTEM_READING_LENGTH;
}

export async function readSystemReviewWithAI(payload: ReviewSystemPayload) {
  const invokePromise = supabase.functions.invoke<{ reading?: string }>('ia-review-system', {
    body: payload,
  });
  const timeoutPromise = new Promise<never>((_, reject) => {
    window.setTimeout(() => reject(new Error('timeout')), REVIEW_SYSTEM_TIMEOUT_MS);
  });

  let data: { reading?: string } | null = null;
  let error: unknown = null;

  try {
    const result = await Promise.race([invokePromise, timeoutPromise]);
    data = result.data ?? null;
    error = result.error;
  } catch {
    return null;
  }

  if (error || !isValidReadingResponse(data)) {
    return null;
  }

  return data.reading.trim();
}
