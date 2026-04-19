import { invokeAIFunction, isReportResponse } from './invoke';
import type { IAReportResponse } from './types';

const REPORT_REVISAO_TIMEOUT_MS = 7000;

export type ReportRevisaoPayload = {
  weekly: {
    completedThisWeek: number;
    overdueOpenCount: number;
    activeCount: number;
  };
  portfolio: {
    goalsCount: number;
    projectsCount: number;
    habitsCount: number;
    inegociaveisCount: number;
  };
  balance: {
    linkedCount: number;
    standaloneCount: number;
  };
};

export async function reportRevisaoWithAI(payload: ReportRevisaoPayload) {
  const { data, error } = await invokeAIFunction<IAReportResponse>('ia-report-revisao', payload, REPORT_REVISAO_TIMEOUT_MS);

  if (error || !isReportResponse(data)) {
    return null;
  }

  return {
    blocks: data.blocks.slice(0, 3).map((block) => ({
      type: block.type,
      title: block.title.trim(),
      description: block.description.trim(),
    })),
  };
}
