import { SendHorizontal } from 'lucide-react';
import { Badge, BottomSheet, Button, Card, Input } from '../../components/ui';
import type { IAActionDescriptor, IAChatAction, IARouteContext } from './types';

export function IAChatDrawer({
  visible,
  onClose,
  onOpenReports,
  draftMessage,
  onDraftChange,
  onSend,
  context,
  completedActions,
  onRunAction,
}: {
  visible: boolean;
  onClose: () => void;
  onOpenReports: () => void;
  draftMessage: string;
  onDraftChange: (value: string) => void;
  onSend: () => void | Promise<void>;
  context: IARouteContext;
  completedActions: Record<string, boolean>;
  onRunAction: (action: IAActionDescriptor | IAChatAction) => void;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Chat contextual">
      <div className="space-y-4">
        <Card className="space-y-3 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">{context.routeLabel}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{context.title}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{context.subtitle}</p>
            </div>
            {context.reports.length > 0 ? (
              <Button variant="secondary" onClick={onOpenReports}>
                Ver relatorios
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {context.visibleContext.map((entry) => (
              <Badge key={entry} label={entry} color="var(--teal)" />
            ))}
          </div>
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

              {message.role === 'assistant' && message.response?.actions && message.response.actions.length > 0 ? (
                <div className="flex flex-wrap gap-2 pl-2">
                  {message.response.actions.map((action) => (
                    <Button
                      key={action.id}
                      variant={completedActions[action.id] ? 'ghost' : 'secondary'}
                      onClick={() => onRunAction(action)}
                      disabled={completedActions[action.id]}
                    >
                      {completedActions[action.id] ? 'Preparado' : action.label}
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
    </BottomSheet>
  );
}
