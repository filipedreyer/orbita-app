import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore, useDataStore } from '../../store';
import { IAConfirmationSheet } from './IAConfirmationSheet';
import { IAContext } from './IAContext';
import { IAContextBuilder } from './IAContextBuilder';
import { IdeaSurface, type IdeaSurfaceMode } from './IdeaSurface';
import { analyzeTextWithAI } from './analyzeText';
import { orchestrateChatMessage } from './chat';
import type {
  IAActionDescriptor,
  IAChatAction,
  IAChatMessage,
  IAContextValue,
  IATextAnalysisResult,
  IATextAnalysisSuggestion,
} from './types';

type PendingIAAction = IAActionDescriptor | IAChatAction;

interface PendingAnalysisCreation {
  sourceId: string;
  suggestion: IATextAnalysisSuggestion;
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
  const [ideaOpen, setIdeaOpen] = useState(false);
  const [ideaMode, setIdeaMode] = useState<IdeaSurfaceMode>('leitura');
  const [draftMessage, setDraftMessage] = useState('');
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});
  const [localMessages, setLocalMessages] = useState<Record<string, IAChatMessage[]>>({});
  const [analysisResults, setAnalysisResults] = useState<Record<string, IATextAnalysisResult | undefined>>({});
  const [pendingAction, setPendingAction] = useState<PendingIAAction | null>(null);
  const [pendingAnalysisCreation, setPendingAnalysisCreation] = useState<PendingAnalysisCreation | null>(null);

  return (
    <IAContextBuilder pathname={location.pathname} items={items} inbox={inbox}>
      {(routeContext) => {
        const contextMessages = [...routeContext.chatMessages, ...(localMessages[routeContext.contextKey] ?? [])];

        async function confirmAnalysisCreation() {
          if (!pendingAnalysisCreation) return;

          const userId = session?.user?.id;
          if (!userId) return;

          const { sourceId, suggestion } = pendingAnalysisCreation;
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

          setPendingAnalysisCreation(null);
        }

        function confirmPendingAction() {
          if (!pendingAction) return;

          setCompletedActions((current) => ({ ...current, [pendingAction.id]: true }));

          if (isChatAction(pendingAction)) {
            const assistantReply: IAChatMessage = {
              id: `${routeContext.contextKey}-assistant-action-${Date.now()}`,
              role: 'assistant',
              content: `Acao revisada: ${pendingAction.label.toLowerCase()}. Nada foi persistido automaticamente.`,
              response: {
                type: 'action',
                content: `Acao revisada: ${pendingAction.label.toLowerCase()}. Nada foi persistido automaticamente.`,
                actions: [],
              },
            };
            setLocalMessages((current) => appendLocalMessages(current, routeContext.contextKey, [assistantReply]));
          }

          setPendingAction(null);
        }

        const value: IAContextValue = {
          routeContext: {
            ...routeContext,
            chatMessages: contextMessages,
          },
          ideaOpen,
          chatOpen: ideaOpen && ideaMode === 'chat',
          reportOpen: ideaOpen && ideaMode === 'relatorios',
          draftMessage,
          completedActions,
          analysisResults,
          setDraftMessage,
          openIdea: () => {
            setIdeaMode('leitura');
            setIdeaOpen(true);
          },
          closeIdea: () => setIdeaOpen(false),
          openChat: () => {
            setIdeaMode('chat');
            setIdeaOpen(true);
          },
          closeChat: () => setIdeaOpen(false),
          openReports: () => {
            setIdeaMode('relatorios');
            setIdeaOpen(true);
          },
          closeReports: () => setIdeaOpen(false),
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
            setPendingAction(action);
          },
          analyzeText: async (sourceId: string, _sourceLabel: string, text: string) => {
            const normalizedText = text.trim();
            setAnalysisResults((current) => removeAnalysisEntry(current, sourceId));

            if (!normalizedText) {
              return;
            }

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
            setPendingAnalysisCreation({ sourceId, suggestion });
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
            <IdeaSurface
              visible={ideaOpen}
              mode={ideaMode}
              onModeChange={setIdeaMode}
              onClose={() => setIdeaOpen(false)}
              draftMessage={draftMessage}
              onDraftChange={setDraftMessage}
              onSend={value.sendMessage}
              context={value.routeContext}
              completedActions={completedActions}
              onRunAction={value.triggerAction}
            />
            <IAConfirmationSheet
              visible={!!pendingAction}
              title={pendingAction?.label ?? 'Acao proposta'}
              description={pendingAction ? 'A IA preparou esta acao como proposta. Confirme apenas se esta intencao fizer sentido; nenhuma alteracao sera persistida automaticamente por este passo.' : ''}
              outputKind="acao_proposta"
              confirmLabel="Confirmar revisao"
              onCancel={() => setPendingAction(null)}
              onConfirm={confirmPendingAction}
            />
            <IAConfirmationSheet
              visible={!!pendingAnalysisCreation}
              title={pendingAnalysisCreation?.suggestion.title ?? 'Criar item'}
              description={pendingAnalysisCreation ? `Criar um item do tipo ${pendingAnalysisCreation.suggestion.type} a partir da analise de IA?` : ''}
              outputKind="acao_proposta"
              confirmLabel="Criar com confirmacao"
              onCancel={() => setPendingAnalysisCreation(null)}
              onConfirm={confirmAnalysisCreation}
            />
          </IAContext.Provider>
        );
      }}
    </IAContextBuilder>
  );
}
