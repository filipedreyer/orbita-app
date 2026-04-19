import type { PropsWithChildren } from 'react';
import { createContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore, useDataStore } from '../../store';
import { IAChatDrawer } from './IAChatDrawer';
import { orchestrateChatMessage } from './chat';
import { IAContextBuilder } from './IAContextBuilder';
import { IAReportDrawer } from './IAReportDrawer';
import { analyzeTextWithAI } from './analyzeText';
import type {
  IAActionDescriptor,
  IAChatAction,
  IAChatMessage,
  IAContextValue,
  IATextAnalysisResult,
  IATextAnalysisSuggestion,
} from './types';

export const IAContext = createContext<IAContextValue | null>(null);

function removeAnalysisEntry(
  current: Record<string, IATextAnalysisResult | undefined>,
  sourceId: string,
): Record<string, IATextAnalysisResult | undefined> {
  const next = { ...current };
  delete next[sourceId];
  return next;
}

function keepRemainingSuggestions(
  current: Record<string, IATextAnalysisResult | undefined>,
  sourceId: string,
  remaining: IATextAnalysisSuggestion[],
): Record<string, IATextAnalysisResult | undefined> {
  if (remaining.length === 0) {
    return removeAnalysisEntry(current, sourceId);
  }

  return {
    ...current,
    [sourceId]: { suggestions: remaining },
  };
}

function appendLocalMessages(
  current: Record<string, IAChatMessage[]>,
  contextKey: string,
  messages: IAChatMessage[],
) {
  return {
    ...current,
    [contextKey]: [...(current[contextKey] ?? []), ...messages],
  };
}

function isChatAction(action: IAActionDescriptor | IAChatAction): action is IAChatAction {
  return ['confirm', 'open', 'review', 'create', 'defer', 'keep', 'highlight', 'link'].includes(
    (action as IAChatAction).intent,
  );
}

export function IAProvider({ children }: PropsWithChildren) {
  const location = useLocation();
  const session = useAuthStore((state) => state.session);
  const items = useDataStore((state) => state.items);
  const inbox = useDataStore((state) => state.inbox);
  const addItem = useDataStore((state) => state.addItem);
  const [chatOpen, setChatOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [draftMessage, setDraftMessage] = useState('');
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});
  const [localMessages, setLocalMessages] = useState<Record<string, IAChatMessage[]>>({});
  const [analysisResults, setAnalysisResults] = useState<Record<string, IATextAnalysisResult | undefined>>({});

  return (
    <IAContextBuilder pathname={location.pathname} items={items} inbox={inbox}>
      {(routeContext) => {
        const contextMessages = [...routeContext.chatMessages, ...(localMessages[routeContext.contextKey] ?? [])];

        const value: IAContextValue = {
          routeContext: {
            ...routeContext,
            chatMessages: contextMessages,
          },
          chatOpen,
          reportOpen,
          draftMessage,
          completedActions,
          analysisResults,
          setDraftMessage,
          openChat: () => setChatOpen(true),
          closeChat: () => setChatOpen(false),
          openReports: () => setReportOpen(true),
          closeReports: () => setReportOpen(false),
          sendMessage: async () => {
            if (!draftMessage.trim()) return;

            const currentDraft = draftMessage.trim();
            const userMessage: IAChatMessage = {
              id: `${routeContext.contextKey}-user-${Date.now()}`,
              role: 'user',
              content: currentDraft,
            };

            setLocalMessages((current) => appendLocalMessages(current, routeContext.contextKey, [userMessage]));
            setDraftMessage('');

            const response = await orchestrateChatMessage(currentDraft, {
              pathname: location.pathname,
              routeContext,
              items,
              inbox,
            });

            const assistantReply: IAChatMessage = {
              id: `${routeContext.contextKey}-assistant-${Date.now()}`,
              role: 'assistant',
              content: response.content,
              response,
            };

            setLocalMessages((current) => appendLocalMessages(current, routeContext.contextKey, [assistantReply]));
          },
          triggerAction: (action: IAActionDescriptor | IAChatAction) => {
            setCompletedActions((current) => ({ ...current, [action.id]: true }));

            if (isChatAction(action)) {
              const assistantReply: IAChatMessage = {
                id: `${routeContext.contextKey}-assistant-action-${Date.now()}`,
                role: 'assistant',
                content: `Proximo passo preparado: ${action.label.toLowerCase()}. Nada foi executado ainda.`,
                response: {
                  type: 'action',
                  content: `Proximo passo preparado: ${action.label.toLowerCase()}. Nada foi executado ainda.`,
                  actions: [],
                },
              };
              setLocalMessages((current) => appendLocalMessages(current, routeContext.contextKey, [assistantReply]));
            }
          },
          analyzeText: async (sourceId: string, _sourceLabel: string, text: string) => {
            const normalizedText = text.trim();
            setAnalysisResults((current) => removeAnalysisEntry(current, sourceId));

            if (!normalizedText) {
              return;
            }

            // TODO: CLAUDE — conectar com Edge Function ia-analyze-text
            // Input esperado: { text }
            // Output esperado: { suggestions: [{ type, title, confidence }] }
            const result = await analyzeTextWithAI({ text: normalizedText });
            if (!result || result.suggestions.length === 0) {
              return;
            }

            setAnalysisResults((current) => ({
              ...current,
              [sourceId]: {
                suggestions: result.suggestions,
              },
            }));
          },
          createFromAnalysis: async (sourceId, suggestion) => {
            const userId = session?.user?.id;
            if (!userId) return;

            const created = await addItem({
              user_id: userId,
              type: suggestion.type,
              title: suggestion.title,
              description: null,
              status: 'active',
              priority: null,
              due_date: null,
              completed_at: null,
              goal_id: null,
              project_id: null,
              tags: [],
              reschedule_count: 0,
              metadata: {},
              image_url: null,
            });

            if (!created) return;

            setAnalysisResults((current) => {
              const currentSuggestions = current[sourceId]?.suggestions ?? [];
              const remaining = currentSuggestions.filter(
                (entry) => !(entry.type === suggestion.type && entry.title === suggestion.title),
              );
              return keepRemainingSuggestions(current, sourceId, remaining);
            });
          },
          ignoreAnalysisSuggestion: (sourceId, suggestionTitle) => {
            setAnalysisResults((current) => {
              const currentSuggestions = current[sourceId]?.suggestions ?? [];
              const remaining = currentSuggestions.filter((entry) => entry.title !== suggestionTitle);
              return keepRemainingSuggestions(current, sourceId, remaining);
            });
          },
        };

        return (
          <IAContext.Provider value={value}>
            {children}
            <IAChatDrawer
              visible={chatOpen}
              onClose={() => setChatOpen(false)}
              onOpenReports={() => setReportOpen(true)}
              draftMessage={draftMessage}
              onDraftChange={setDraftMessage}
              onSend={value.sendMessage}
              context={value.routeContext}
              completedActions={completedActions}
              onRunAction={value.triggerAction}
            />
            <IAReportDrawer visible={reportOpen} onClose={() => setReportOpen(false)} context={value.routeContext} />
          </IAContext.Provider>
        );
      }}
    </IAContextBuilder>
  );
}
