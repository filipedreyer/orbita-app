import { SendHorizontal } from 'lucide-react';
import { Badge, BottomSheet, Button, Card, Input } from '../../components/ui';
import type { IAActionDescriptor, IARouteContext } from './types';

export function IAChatDrawer({
  visible,
  onClose,
  onOpenReports,
  draftMessage,
  onDraftChange,
  onSend,
  context,
  completedActions: _completedActions,
  onRunAction: _onRunAction,
}: {
  visible: boolean;
  onClose: () => void;
  onOpenReports: () => void;
  draftMessage: string;
  onDraftChange: (value: string) => void;
  onSend: () => void;
  context: IARouteContext;
  completedActions: Record<string, boolean>;
  onRunAction: (action: IAActionDescriptor) => void;
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
            <Button variant="secondary" onClick={onOpenReports}>
              Ver relatorios
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {context.visibleContext.map((entry) => (
              <Badge key={entry} label={entry} color="var(--teal)" />
            ))}
          </div>
        </Card>

        <div className="space-y-3">
          {/* TODO: CLAUDE — conectar respostas contextuais reais por superficie sem abrir chat generico. */}
          {context.chatMessages.map((message) => (
            <div
              key={message.id}
              className={`rounded-2xl px-4 py-3 text-sm ${
                message.role === 'assistant' ? 'bg-[var(--surface-alt)] text-[var(--text)]' : 'bg-[var(--teal-light)] text-[var(--teal)]'
              }`}
            >
              {message.content}
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Perguntar nesta superficie</p>
          <div className="flex gap-2">
            <Input value={draftMessage} onChange={(event) => onDraftChange(event.target.value)} placeholder={`Perguntar sobre ${context.routeLabel.toLowerCase()}...`} />
            <Button size="icon" ariaLabel="Enviar mock de IA" onClick={onSend}>
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
