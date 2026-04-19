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

export type IAReportBlockType = 'status' | 'focus' | 'risk';

export interface IAReportBlock {
  type: IAReportBlockType;
  title: string;
  description: string;
}

export interface IAReportResponse {
  blocks: IAReportBlock[];
}

export interface IAChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  response?: IAChatResponse;
}

export type IAChatIntent = 'reading' | 'suggestion' | 'report' | 'action';

export type IAChatActionIntent =
  | 'confirm'
  | 'open'
  | 'review'
  | 'create'
  | 'defer'
  | 'keep'
  | 'highlight'
  | 'link';

export interface IAChatAction {
  id: string;
  label: string;
  intent: IAChatActionIntent;
  payload?: Record<string, unknown>;
}

export interface IAChatResponse {
  type: IAChatIntent;
  content: string;
  actions?: IAChatAction[];
}

export interface IAOnboardingStep {
  id: string;
  title: string;
  description: string;
  done: boolean;
}

export type IAOnboardingSuggestionType = 'meta' | 'projeto' | 'habito' | 'inegociavel';

export interface IAOnboardingSuggestion {
  type: IAOnboardingSuggestionType;
  title: string;
  description?: string;
  linkedTo?: string;
}

export interface IAOnboardingResponse {
  suggestions: IAOnboardingSuggestion[];
}

export interface IAReadingResponse {
  reading: string;
}

export type IASuggestType = 'defer' | 'keep' | 'highlight';

export interface IASuggestionItem {
  type: IASuggestType;
  itemId: string;
  reason: string;
}

export interface IASuggestResult {
  suggestions: IASuggestionItem[];
  summary: string;
}

export interface IATextAnalysisSuggestion {
  type: 'tarefa' | 'lembrete' | 'ideia';
  title: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface IATextAnalysisResult {
  suggestions: IATextAnalysisSuggestion[];
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
  sendMessage: () => Promise<void>;
  triggerAction: (action: IAActionDescriptor | IAChatAction) => void;
  analyzeText: (sourceId: string, sourceLabel: string, text: string) => Promise<void>;
  createFromAnalysis: (sourceId: string, suggestion: IATextAnalysisSuggestion) => Promise<void>;
  ignoreAnalysisSuggestion: (sourceId: string, suggestionTitle: string) => void;
}
