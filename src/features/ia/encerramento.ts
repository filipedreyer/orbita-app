import { invokeAIFunction, isReadingResponse } from './invoke';

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

export async function readEncerramentoWithAI(payload: EncerramentoReadPayload) {
  const { data, error } = await invokeAIFunction<{ reading?: string }>(
    'ia-encerramento',
    payload,
    ENCERRAMENTO_READ_TIMEOUT_MS,
  );

  if (error || !isReadingResponse(data, MIN_ENCERRAMENTO_READING_LENGTH)) {
    return null;
  }

  return data.reading.trim();
}

export { ENCERRAMENTO_READ_TIMEOUT_MS };
