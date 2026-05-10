import { SendHorizontal } from 'lucide-react';
import { Badge, BottomSheet, Button, Card, Input } from '../../components/ui';
import { ContextualIAEntry } from './ContextualIAEntry';
import { IAOutputRenderer } from './IAOutputRenderer';
import { IAReportPanel } from './IAReportPanel';
import { IASuggestion } from './IASuggestion';
import type { IAActionDescriptor, IAChatAction, IAOutputDescriptor, IARouteContext } from './types';

export type IdeaSurfaceMode = 'leitura' | 'sugestoes' | 'relatorios' | 'chat';

const modeLabels: Record<IdeaSurfaceMode, string> = {
  leitura: 'Leitura',
  sugestoes: 'Sugestoes',
  relatorios: 'Relatorios',
  chat: 'Conversa',
};

function buildOverviewOutputs(context: IARouteContext): IAOutputDescriptor[] {
  return [
    {
      id: `${context.contextKey}:reading`,
      kind: 'leitura',
      title: 'Leitura contextual',
      body: context.subtitle,
    },
    {
      id: `${context.contextKey}:suggestions`,
      kind: 'sugestao',
      title: `${context.suggestions.length} sugestao(oes) disponivel(is)`,
      body: 'Sugestoes abrem revisao. Elas nao persistem mudancas sozinhas.',
    },
    {
      id: `${context.contextKey}:reports`,
      kind: 'relatorio',
      title: `${context.reports.length} relatorio(s) contextual(is)`,
      body: 'Relatorios sao leitura interna da Idea e nao executam acoes.',
    },
  ];
}

export function IdeaSurface({
  visible,
  mode,
  onModeChange,
  onClose,
  draftMessage,
  onDraftChange,
  onSend,
  context,
  completedActions,
  onRunAction,
}: {
  visible: boolean;
  mode: IdeaSurfaceMode;
  onModeChange: (mode: IdeaSurfaceMode) => void;
  onClose: () => void;
  draftMessage: string;
  onDraftChange: (value: string) => void;
  onSend: () => void | Promise<void>;
  context: IARouteContext;
  completedActions: Record<string, boolean>;
  onRunAction: (action: IAActionDescriptor | IAChatAction) => void;
}) {
  const overviewOutputs = buildOverviewOutputs(context);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Idea">
      <div className="space-y-4">
        <ContextualIAEntry context={context} />

        <div className="flex flex-wrap gap-2">
          {(Object.keys(modeLabels) as IdeaSurfaceMode[]).map((entry) => (
            <Button key={entry} variant={mode === entry ? 'primary' : 'ghost'} onClick={() => onModeChange(entry)}>
              {modeLabels[entry]}
            </Button>
          ))}
        </div>

        {mode === 'leitura' ? (
          <div className="space-y-3">
            {overviewOutputs.map((output) => (
              <IAOutputRenderer key={output.id} output={output} />
            ))}
          </div>
        ) : null}

        {mode === 'sugestoes' ? (
          <div className="space-y-3">
            {context.suggestions.length > 0 ? (
              context.suggestions.map((suggestion) => (
                <IASuggestion key={suggestion.id} suggestion={suggestion} completedActions={completedActions} onRunAction={onRunAction} />
              ))
            ) : (
              <Card className="p-4">
                <p className="text-sm text-[var(--text-secondary)]">Nenhuma sugestao contextual nesta superficie.</p>
              </Card>
            )}
          </div>
        ) : null}

        {mode === 'relatorios' ? <IAReportPanel context={context} active={visible && mode === 'relatorios'} /> : null}

        {mode === 'chat' ? (
          <div className="space-y-4">
            <Card className="p-4">
              <p className="text-sm font-semibold text-[var(--text)]">Conversa contextual</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">Modo interno da Idea. Respostas podem propor acoes, mas a persistencia exige confirmacao.</p>
            </Card>

            <div className="space-y-3">
              {context.chatMessages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm ${
                      message.role === 'assistant' ? 'bg-[var(--surface-alt)] text-[var(--text)]' : 'bg-[var(--teal-light)] text-[var(--teal)]'
                    }`}
                  >
                    {message.content}
                  </div>

                  {message.response ? <Badge label={modeLabels[message.response.type === 'action' ? 'sugestoes' : message.response.type === 'report' ? 'relatorios' : 'leitura']} tone="project" /> : null}

                  {message.role === 'assistant' && message.response?.actions && message.response.actions.length > 0 ? (
                    <div className="flex flex-wrap gap-2 pl-2">
                      {message.response.actions.map((action) => (
                        <Button
                          key={action.id}
                          variant={completedActions[action.id] ? 'ghost' : 'secondary'}
                          onClick={() => onRunAction(action)}
                          disabled={completedActions[action.id]}
                        >
                          {completedActions[action.id] ? 'Revisado' : action.label}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Perguntar nesta superficie</p>
              <div className="flex gap-2">
                <Input value={draftMessage} onChange={(event) => onDraftChange(event.target.value)} placeholder={`Perguntar sobre ${context.routeLabel.toLowerCase()}...`} />
                <Button size="icon" ariaLabel="Enviar pergunta contextual" onClick={() => void onSend()}>
                  <SendHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </BottomSheet>
  );
}

