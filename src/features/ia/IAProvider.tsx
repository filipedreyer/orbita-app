import type { PropsWithChildren } from 'react';
import { createContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore, useDataStore } from '../../store';
import { IAChatDrawer } from './IAChatDrawer';
import { IAContextBuilder } from './IAContextBuilder';
import { IAReportDrawer } from './IAReportDrawer';
import { analyzeTextWithAI } from './analyzeText';
import type { IAActionDescriptor, IAContextValue, IAChatMessage, IATextAnalysisResult, IATextAnalysisSuggestion } from './types';

export const IAContext = createContext<IAContextValue | null>(null);

function buildMockReply(area: string, message: string): string {
  if (area === 'fazer') {
    return `Mock de IA: para "${message}", eu priorizaria reduzir atrito no dia antes de adicionar mais carga.`;
  }
  if (area === 'memoria') {
    return `Mock de IA: para "${message}", eu sugeriria classificar, vincular e transformar texto em acao aos poucos.`;
  }
  return `Mock de IA: para "${message}", eu revisaria metas, projetos e protecoes do portfolio antes de qualquer ajuste maior.`;
}

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
          sendMessage: () => {
            if (!draftMessage.trim()) return;

            // TODO: CLAUDE — conectar com Edge Function ia-chat
            // Input esperado: { pathname, contextKey, message, visibleContext }
            // Output esperado: { reply, suggestedActions, reportHints }
            const userMessage: IAChatMessage = {
              id: `${routeContext.contextKey}-user-${Date.now()}`,
              role: 'user',
              content: draftMessage.trim(),
            };
            const assistantReply: IAChatMessage = {
              id: `${routeContext.contextKey}-assistant-${Date.now()}`,
              role: 'assistant',
              content: buildMockReply(routeContext.area, draftMessage.trim()),
            };
            setLocalMessages((current) => appendLocalMessages(current, routeContext.contextKey, [userMessage, assistantReply]));
            setDraftMessage('');
          },
          triggerAction: (action: IAActionDescriptor) => {
            // TODO: CLAUDE — conectar com Edge Function ia-actions
            // Input esperado: { pathname, actionId, intent, contextKey }
            // Output esperado: { applied: boolean, summary: string }
            setCompletedActions((current) => ({ ...current, [action.id]: true }));
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
