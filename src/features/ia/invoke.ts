import { supabase } from '../../lib/supabase';
import type { IAReadingResponse } from './types';

type AIInvokeBody = string | FormData | Record<string, unknown>;

export async function invokeAIFunction<TResponse>(functionName: string, body: AIInvokeBody, timeoutMs: number) {
  const invokePromise = supabase.functions.invoke<TResponse>(functionName, { body });
  const timeoutPromise = new Promise<never>((_, reject) => {
    window.setTimeout(() => reject(new Error('timeout')), timeoutMs);
  });

  try {
    const result = await Promise.race([invokePromise, timeoutPromise]);
    return {
      data: result.data ?? null,
      error: result.error ?? null,
    };
  } catch {
    return {
      data: null,
      error: new Error('timeout'),
    };
  }
}

export function isReadingResponse(data: unknown, minLength: number): data is IAReadingResponse {
  if (!data || typeof data !== 'object') return false;
  const record = data as Record<string, unknown>;
  return typeof record.reading === 'string' && record.reading.trim().length >= minLength;
}
