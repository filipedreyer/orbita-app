import { CheckCheck, Clock3, FilePlus2, Inbox, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui';
import type { InboxItem } from '../../../lib/types';

export function InboxTriageActions({
  item,
  canLeaveInbox,
  submitting,
  onKeep,
  onConvert,
  onComplete,
  onPostpone,
  onDiscard,
  onCancel,
}: {
  item: InboxItem;
  canLeaveInbox: boolean;
  submitting: boolean;
  onKeep: (item: InboxItem) => void;
  onConvert: (item: InboxItem) => void;
  onComplete: (item: InboxItem) => void;
  onPostpone: (item: InboxItem) => void;
  onDiscard: (item: InboxItem) => void;
  onCancel: () => void;
}) {
  function handleDiscard() {
    const label = item.text.trim() || 'captura sem texto';
    if (!window.confirm(`Descartar "${label}" da Inbox? Esta acao remove a captura da triagem.`)) {
      return;
    }

    onDiscard(item);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={() => onKeep(item)} disabled={submitting}>
        <Inbox className="h-4 w-4" />
        Manter na Inbox
      </Button>
      <Button onClick={() => onConvert(item)} disabled={!canLeaveInbox || submitting}>
        <FilePlus2 className="h-4 w-4" />
        Converter
      </Button>
      <Button variant="secondary" onClick={() => onComplete(item)} disabled={!canLeaveInbox || submitting}>
        <CheckCheck className="h-4 w-4" />
        Concluir
      </Button>
      <Button variant="ghost" onClick={() => onPostpone(item)} disabled={!canLeaveInbox || submitting}>
        <Clock3 className="h-4 w-4" />
        Adiar
      </Button>
      <Button variant="destructive" onClick={handleDiscard} disabled={submitting}>
        <Trash2 className="h-4 w-4" />
        Descartar
      </Button>
      <Button variant="ghost" onClick={onCancel} disabled={submitting}>
        Cancelar
      </Button>
    </div>
  );
}

