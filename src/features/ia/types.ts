export type IAArea = 'fazer' | 'memoria' | 'planejar' | 'global';

export interface IAActionDescriptor {
  id: string;
  label: string;
  intent: 'Criar' | 'Ajustar' | 'Vincular' | 'Reprogramar' | 'Organizar';
  description: string;
}

export interface IASuggestionDescriptor {
  id: string;
  title: string;
  description: string;
  tone?: 'neutral' | 'warning' | 'support';
  actions: IAActionDescriptor[];
}

export interface IAReportDescriptor {
  id: string;
  title: string;
  summary: string;
  highlights: string[];
}

export interface IAChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

export interface IAOnboardingStep {
  id: string;
  title: string;
  description: string;
  done: boolean;
}

export interface IATextAnalysisResult {
  title: string;
  summary: string;
  highlights: string[];
  actions: string[];
}

export interface IARouteContext {
  contextKey: string;
  area: IAArea;
  routeLabel: string;
  title: string;
  subtitle: string;
  visibleContext: string[];
  suggestions: IASuggestionDescriptor[];
  reports: IAReportDescriptor[];
  chatMessages: IAChatMessage[];
  onboardingSteps: IAOnboardingStep[];
}

export interface IAContextValue {
  routeContext: IARouteContext;
  chatOpen: boolean;
  reportOpen: boolean;
  draftMessage: string;
  completedActions: Record<string, boolean>;
  analysisResults: Record<string, IATextAnalysisResult | undefined>;
  setDraftMessage: (value: string) => void;
  openChat: () => void;
  closeChat: () => void;
  openReports: () => void;
  closeReports: () => void;
  sendMessage: () => void;
  triggerAction: (action: IAActionDescriptor) => void;
  analyzeText: (sourceId: string, sourceLabel: string, text: string) => void;
}
