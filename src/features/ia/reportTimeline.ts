import { invokeAIFunction, isReportResponse } from './invoke';
import type { IAReportResponse } from './types';

const REPORT_TIMELINE_TIMEOUT_MS = 7000;

export type ReportTimelinePayload = {
  selectedDay: {
    date: string;
    signal: 'balanced' | 'loaded' | 'overloaded';
    itemCount: number;
    operationalHours: number;
  };
  nearbyDays: Array<{
    date: string;
    signal: 'balanced' | 'loaded' | 'overloaded';
    scheduledCount: number;
  }>;
  constraints: {
    fixedInegociaveisCount: number;
    blockedInegociaveisCount: number;
  };
};

export async function reportTimelineWithAI(payload: ReportTimelinePayload) {
  const { data, error } = await invokeAIFunction<IAReportResponse>('ia-report-timeline', payload, REPORT_TIMELINE_TIMEOUT_MS);

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

