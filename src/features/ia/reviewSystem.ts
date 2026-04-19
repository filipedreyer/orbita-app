import { invokeAIFunction, isReadingResponse } from './invoke';

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

export async function readSystemReviewWithAI(payload: ReviewSystemPayload) {
  const { data, error } = await invokeAIFunction<{ reading?: string }>(
    'ia-review-system',
    payload,
    REVIEW_SYSTEM_TIMEOUT_MS,
  );

  if (error || !isReadingResponse(data, MIN_SYSTEM_READING_LENGTH)) {
    return null;
  }

  return data.reading.trim();
}
