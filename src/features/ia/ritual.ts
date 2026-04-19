import { invokeAIFunction, isReadingResponse } from './invoke';

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

export async function readRitualWithAI(payload: RitualReadPayload) {
  const { data, error } = await invokeAIFunction<{ reading?: string }>('ia-ritual', payload, RITUAL_READ_TIMEOUT_MS);

  if (error || !isReadingResponse(data, MIN_RITUAL_READING_LENGTH)) {
    return null;
  }

  return data.reading.trim();
}

export { RITUAL_READ_TIMEOUT_MS };
