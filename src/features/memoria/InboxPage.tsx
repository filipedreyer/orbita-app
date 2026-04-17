import { Edit3, FilePlus2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useActionFeedback } from '../../components/feedback/ActionFeedbackProvider';
import { Button, Card, Input } from '../../components/ui';
import { useAuthStore, useDataStore } from '../../store';
import type { EntityType, InboxItem } from '../../lib/types';

export function InboxPage() {
  const session = useAuthStore((state) => state.session);
  const inbox = useDataStore((state) => state.inbox);
  const addItem = useDataStore((state) => state.addItem);
  const addToInbox = useDataStore((state) => state.addToInbox);
  const dismissInbox = useDataStore((state) => state.dismissInbox);
  const updateInboxItem = useDataStore((state) => state.updateInboxItem);
  const { showFeedback } = useActionFeedback();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftText, setDraftText] = useState('');

  async function handleAccept(item: InboxItem, asType: EntityType = 'nota') {
    if (!session?.user) return;
    const text = editingId === item.id ? draftText.trim() || item.text : item.text;
    await addItem({
      user_id: session.user.id,
      type: asType,
      title: text.slice(0, 80),
      description: `<p>${text}</p>`,
      status: 'active',
      priority: null,
      due_date: null,
      completed_at: null,
      goal_id: null,
      project_id: null,
      tags: [],
      reschedule_count: 0,
      metadata: {},
      image_url: item.image_url,
    });
    await dismissInbox(item.id);
    setEditingId(null);
    setDraftText('');
    showFeedback(`Inbox aceita como ${asType}.`);
  }

  async function handleSaveEdit(item: InboxItem) {
    await updateInboxItem(item.id, { text: draftText.trim() || item.text });
    setEditingId(null);
    setDraftText('');
    showFeedback('Edicao salva na inbox.');
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <h3 className="text-xl font-semibold">Inbox</h3>
        <p className="text-sm text-[var(--text-secondary)]">Triagem simples: editar, aceitar como nota ou descartar.</p>
      </Card>

      <div className="space-y-3">
        {inbox.map((item) => (
          <Card key={item.id} className="space-y-4 p-4">
            {editingId === item.id ? (
              <div className="space-y-3">
                <Input value={draftText} onChange={(event) => setDraftText(event.target.value)} />
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => void handleSaveEdit(item)}>Salvar edicao</Button>
                  <Button variant="ghost" onClick={() => { setEditingId(null); setDraftText(''); }}>Cancelar</Button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-[var(--text)]">{item.text}</p>
                {item.image_url ? <p className="mt-2 text-xs text-[var(--text-secondary)]">Item com anexo de imagem.</p> : null}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => void handleAccept(item, 'nota')}>
                <FilePlus2 className="h-4 w-4" />
                Aceitar
              </Button>
              <Button variant="ghost" onClick={() => { setEditingId(item.id); setDraftText(item.text); }}>
                <Edit3 className="h-4 w-4" />
                Editar
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  void dismissInbox(item.id);
                  showFeedback('Item descartado da inbox.', {
                    undoLabel: 'Desfazer',
                    onUndo: () => {
                      void addToInbox(item.text, item.image_url);
                    },
                  });
                }}
              >
                <Trash2 className="h-4 w-4" />
                Descartar
              </Button>
            </div>
          </Card>
        ))}

        {inbox.length === 0 ? (
          <Card className="p-6 text-sm text-[var(--text-secondary)]">Nenhum item na inbox agora.</Card>
        ) : null}
      </div>
    </div>
  );
}
