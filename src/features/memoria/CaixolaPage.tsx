import { BookPlus, BookText, FilePenLine } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Card, Input } from '../../components/ui';
import type { Item } from '../../lib/types';
import { useAuthStore, useDataStore } from '../../store';
import { EntitySheetWrapper } from '../entity/EntitySheetWrapper';
import { CaixolaClusterSuggestion } from './components/CaixolaClusterSuggestion';
import { CaixolaPromotionSuggestion } from './components/CaixolaPromotionSuggestion';
import { NoteEditorPanel } from './components/NoteEditorPanel';
import { getItemTags, getPlainText, isDiaryNote, isTemplateNote } from './memory-helpers';

export function CaixolaPage() {
  const session = useAuthStore((state) => state.session);
  const items = useDataStore((state) => state.items);
  const addItem = useDataStore((state) => state.addItem);
  const updateItem = useDataStore((state) => state.updateItem);
  const [filter, setFilter] = useState<'all' | 'diario' | 'template'>('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editorState, setEditorState] = useState<{ mode: 'new' | 'edit'; item: Item | null } | null>(null);

  const notes = useMemo(() => {
    return items
      .filter((item) => item.type === 'nota')
      .filter((item) => {
        if (filter === 'diario') return isDiaryNote(item);
        if (filter === 'template') return isTemplateNote(item);
        return true;
      })
      .filter((item) => `${item.title} ${getPlainText(item.description)}`.toLowerCase().includes(search.toLowerCase()))
      .sort((left, right) => (right.due_date ?? right.updated_at).localeCompare(left.due_date ?? left.updated_at));
  }, [filter, items, search]);

  const incubatingNotes = useMemo(
    () => notes.filter((item) => !item.due_date && item.status === 'active'),
    [notes],
  );

  const clusterSuggestion = useMemo(() => {
    const byTag = new Map<string, Item[]>();

    for (const item of incubatingNotes) {
      for (const tag of getItemTags(item)) {
        const current = byTag.get(tag) ?? [];
        byTag.set(tag, [...current, item]);
      }
    }

    return [...byTag.entries()].find(([, entries]) => entries.length >= 2) ?? null;
  }, [incubatingNotes]);

  const promotionSuggestion = useMemo(() => {
    return incubatingNotes.find((item) => {
      const text = `${item.title} ${getPlainText(item.description)}`.toLowerCase();
      return text.includes('todo') || text.includes('fazer') || text.includes('lembrete') || text.includes('?');
    }) ?? incubatingNotes[0] ?? null;
  }, [incubatingNotes]);

  async function handleSave(payload: { title: string; content: string }) {
    if (!session?.user) return;

    if (editorState?.mode === 'edit' && editorState.item) {
      await updateItem(editorState.item.id, {
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
      tags: [],
      reschedule_count: 0,
      metadata: {},
      image_url: null,
    });
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold">Caixola</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Incubacao e recuperacao de notas, materiais soltos, screenshots e lembretes ainda sem forma.</p>
          </div>
          <Button onClick={() => setEditorState({ mode: 'new', item: null })}>
            <BookPlus className="h-4 w-4" />
            Nova nota
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant={filter === 'all' ? 'primary' : 'ghost'} onClick={() => setFilter('all')}>Tudo</Button>
          <Button variant={filter === 'diario' ? 'primary' : 'ghost'} onClick={() => setFilter('diario')}>Diário</Button>
          <Button variant={filter === 'template' ? 'primary' : 'ghost'} onClick={() => setFilter('template')}>Templates</Button>
        </div>
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por título ou conteúdo..." />
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {clusterSuggestion ? (
          <CaixolaClusterSuggestion
            clusterLabel={clusterSuggestion[0]}
            items={clusterSuggestion[1]}
            onReview={() => setSearch(clusterSuggestion[0])}
          />
        ) : null}
        <CaixolaPromotionSuggestion
          item={promotionSuggestion}
          suggestedTarget="tarefa, lembrete ou nota estruturada"
          onReview={(item) => setSelectedItem(item)}
        />
      </div>

      <div className="space-y-3">
        {notes.map((item) => (
          <Card key={item.id} className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
                <p className="mt-2 text-xs text-[var(--text-secondary)]">{getPlainText(item.description).slice(0, 180) || 'Nota sem conteúdo.'}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setSelectedItem(item)}>
                  <BookText className="h-4 w-4" />
                  Abrir
                </Button>
                <Button variant="ghost" onClick={() => setEditorState({ mode: 'edit', item })}>
                  <FilePenLine className="h-4 w-4" />
                  Editar
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {notes.length === 0 ? <Card className="p-6 text-sm text-[var(--text-secondary)]">Nenhuma nota encontrada para o filtro atual.</Card> : null}
      </div>

      <NoteEditorPanel
        visible={!!editorState}
        eyebrow={editorState?.mode === 'edit' ? 'Editar nota' : 'Nova nota'}
        title={editorState?.item?.title ?? ''}
        content={editorState?.item?.description ?? '<p></p>'}
        onClose={() => setEditorState(null)}
        onSave={handleSave}
      />

      {selectedItem ? (
        <EntitySheetWrapper item={selectedItem} visible={!!selectedItem} onClose={() => setSelectedItem(null)} onEdit={() => setEditorState({ mode: 'edit', item: selectedItem })} />
      ) : null}
    </div>
  );
}
