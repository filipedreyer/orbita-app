import { invokeAIFunction, isReportResponse } from './invoke';
import type { IAReportResponse } from './types';

const REPORT_PLANEJAR_TIMEOUT_MS = 7000;

export type ReportPlanejarPayload = {
  structure: {
    goalsCount: number;
    projectsCount: number;
    habitsCount: number;
    inegociaveisCount: number;
  };
  distribution: {
    goalsWithProjects: number;
    projectsWithTasks: number;
    habitsActiveCount: number;
  };
  gaps: {
    goalsWithoutProjects: number;
    projectsWithoutTasks: number;
  };
};

export async function reportPlanejarWithAI(payload: ReportPlanejarPayload) {
  const { data, error } = await invokeAIFunction<IAReportResponse>('ia-report-planejar', payload, REPORT_PLANEJAR_TIMEOUT_MS);

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

