import { supabase } from '../../lib/supabase';

const RITUAL_READ_TIMEOUT_MS = 7000;
const MIN_RITUAL_READING_LENGTH = 24;

export type RitualCapacitySignal = 'balanced' | 'loaded' | 'overloaded';

export type RitualReadPayload = {
  risk: {
    overdueCount: number;
    revisitCount: number;
    staleCount: number;
  };
  capacity: {
    signal: RitualCapacitySignal;
    agoraCount: number;
  };
  direction: {
    linkedCount: number;
    standaloneCount: number;
  };
};

function isValidReadingResponse(data: unknown): data is { reading: string } {
  if (!data || typeof data !== 'object') return false;
  const record = data as Record<string, unknown>;
  return typeof record.reading === 'string' && record.reading.trim().length >= MIN_RITUAL_READING_LENGTH;
}

export async function readRitualWithAI(payload: RitualReadPayload) {
  const invokePromise = supabase.functions.invoke<{ reading?: string }>('ia-ritual', {
    body: payload,
  });
  const timeoutPromise = new Promise<never>((_, reject) => {
    window.setTimeout(() => reject(new Error('timeout')), RITUAL_READ_TIMEOUT_MS);
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

export { RITUAL_READ_TIMEOUT_MS };
