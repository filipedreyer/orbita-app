import { invokeAIFunction, isReportResponse } from './invoke';
import type { IAReportResponse } from './types';

const REPORT_HOJE_TIMEOUT_MS = 7000;

export type ReportHojePayload = {
  capacity: {
    signal: 'balanced' | 'loaded' | 'overloaded';
    focusCount: number;
    overdueCount: number;
  };
  execution: {
    agoraCount: number;
    cabeCount: number;
    atencaoCount: number;
  };
  direction: {
    linkedCount: number;
    standaloneCount: number;
  };
};

export async function reportHojeWithAI(payload: ReportHojePayload) {
  const { data, error } = await invokeAIFunction<IAReportResponse>('ia-report-hoje', payload, REPORT_HOJE_TIMEOUT_MS);

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

