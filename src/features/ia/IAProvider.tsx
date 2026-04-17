import type { PropsWithChildren } from 'react';
import { createContext, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useDataStore } from '../../store';
import { IAChatDrawer } from './IAChatDrawer';
import { IAContextBuilder } from './IAContextBuilder';
import { IAReportDrawer } from './IAReportDrawer';
import type { IAActionDescriptor, IAContextValue, IAChatMessage, IATextAnalysisResult } from './types';

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

function buildMockAnalysis(text: string, sourceLabel: string): IATextAnalysisResult {
  const hasChecklist = /- |\* |\d+\./.test(text);
  const hasPlanningWords = /meta|projeto|habito|agenda|dia/i.test(text);

  return {
    title: `Leitura mockada de ${sourceLabel}`,
    summary:
      text.length < 40
        ? 'Texto curto: a IA sugere complementar contexto antes de transformar isso em acao.'
        : 'Texto com material suficiente para classificar, vincular ou promover para acao.',
    highlights: [
      hasChecklist ? 'Ha estrutura de lista que pode virar acao ou checklist.' : 'Nao ha checklist explicito; parece mais uma nota livre.',
      hasPlanningWords ? 'O conteudo conversa com planejamento e execucao.' : 'O conteudo parece mais descritivo do que operacional.',
      `${Math.max(1, text.split(/\s+/).filter(Boolean).length)} palavras consideradas na analise mockada.`,
    ],
    actions: hasChecklist ? ['Criar', 'Ajustar', 'Vincular'] : ['Organizar', 'Vincular'],
  };
}

export function IAProvider({ children }: PropsWithChildren) {
  const location = useLocation();
  const items = useDataStore((state) => state.items);
  const inbox = useDataStore((state) => state.inbox);
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
            setLocalMessages((current) => ({
              ...current,
              [routeContext.contextKey]: [...(current[routeContext.contextKey] ?? []), userMessage, assistantReply],
            }));
            setDraftMessage('');
          },
          triggerAction: (action: IAActionDescriptor) => {
            // TODO: CLAUDE — conectar com Edge Function ia-actions
            // Input esperado: { pathname, actionId, intent, contextKey }
            // Output esperado: { applied: boolean, summary: string }
            setCompletedActions((current) => ({ ...current, [action.id]: true }));
          },
          analyzeText: (sourceId: string, sourceLabel: string, text: string) => {
            // TODO: CLAUDE — conectar com Edge Function ia-analyze-text
            // Input esperado: { sourceId, sourceLabel, text, pathname }
            // Output esperado: { summary, highlights, actions }
            setAnalysisResults((current) => ({
              ...current,
              [sourceId]: buildMockAnalysis(text, sourceLabel),
            }));
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
