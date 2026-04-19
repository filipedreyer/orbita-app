import { supabase } from '../../lib/supabase';

const ENCERRAMENTO_READ_TIMEOUT_MS = 7000;
const MIN_ENCERRAMENTO_READING_LENGTH = 24;

export type EncerramentoReadPayload = {
  execution: {
    completedCount: number;
    openCount: number;
    respectedInegociaveisCount: number;
  };
  carryover: {
    unfinishedCount: number;
    reconsiderCount: number;
  };
  attention: {
    overdueCount: number;
    revisitCount: number;
  };
};

function isValidReadingResponse(data: unknown): data is { reading: string } {
  if (!data || typeof data !== 'object') return false;
  const record = data as Record<string, unknown>;
  return typeof record.reading === 'string' && record.reading.trim().length >= MIN_ENCERRAMENTO_READING_LENGTH;
}

export async function readEncerramentoWithAI(payload: EncerramentoReadPayload) {
  const invokePromise = supabase.functions.invoke<{ reading?: string }>('ia-encerramento', {
    body: payload,
  });
  const timeoutPromise = new Promise<never>((_, reject) => {
    window.setTimeout(() => reject(new Error('timeout')), ENCERRAMENTO_READ_TIMEOUT_MS);
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

export { ENCERRAMENTO_READ_TIMEOUT_MS };
