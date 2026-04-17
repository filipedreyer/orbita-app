import { useMemo, useState } from 'react';
import { Layers3 } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import type { Item } from '../../lib/types';
import { useAuthStore, useDataStore } from '../../store';
import { NoteEditorPanel } from './components/NoteEditorPanel';
import { getPlainText, isTemplateNote } from './memory-helpers';

export function TemplatesPage() {
  const session = useAuthStore((state) => state.session);
  const addItem = useDataStore((state) => state.addItem);
  const updateItem = useDataStore((state) => state.updateItem);
  const templates = useDataStore((state) => state.items.filter(isTemplateNote));
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [creating, setCreating] = useState(false);

  const sortedTemplates = useMemo(
    () => [...templates].sort((left, right) => left.title.localeCompare(right.title, 'pt-BR')),
    [templates],
  );

  async function handleSave(payload: { title: string; content: string }) {
    if (!session?.user) return;

    if (editingItem) {
      await updateItem(editingItem.id, {
        title: payload.title,
        description: payload.content,
      });
      return;
    }

    await addItem({
      user_id: session.user.id,
      type: 'nota',
      title: payload.title,
      description: payload.content,
      status: 'active',
      priority: null,
      due_date: null,
      completed_at: null,
      goal_id: null,
      project_id: null,
      tags: ['template'],
      reschedule_count: 0,
      metadata: { tags: ['template'] },
      image_url: null,
    });
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Layers3 className="h-5 w-5 text-[var(--teal)]" />
            <h3 className="text-xl font-semibold">Templates</h3>
          </div>
          <Button onClick={() => setCreating(true)}>Novo template</Button>
        </div>
      </Card>

      <div className="space-y-3">
        {sortedTemplates.map((item) => (
          <Card key={item.id} className="space-y-3 p-4">
            <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
            <p className="text-sm text-[var(--text-secondary)]">{getPlainText(item.description).slice(0, 180) || 'Template sem conteúdo.'}</p>
            <Button variant="ghost" onClick={() => setEditingItem(item)}>Editar</Button>
          </Card>
        ))}
        {sortedTemplates.length === 0 ? <Card className="p-6 text-sm text-[var(--text-secondary)]">Nenhum template criado ainda.</Card> : null}
      </div>

      <NoteEditorPanel
        visible={creating || !!editingItem}
        eyebrow={editingItem ? 'Editar template' : 'Novo template'}
        title={editingItem?.title ?? ''}
        content={editingItem?.description ?? '<p></p>'}
        onClose={() => {
          setCreating(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
      />
    </div>
  );
}
