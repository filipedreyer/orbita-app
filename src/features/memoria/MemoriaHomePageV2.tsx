import { useMemo, useState } from 'react';
import { BookText } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import type { Item } from '../../lib/types';
import { useDataStore } from '../../store';
import { EntitySheetWrapper } from '../entity/EntitySheetWrapper';

function isDiaryNote(item: Item) {
  const metadata = item.metadata as Record<string, unknown>;
  const tags = Array.isArray(metadata.tags) ? metadata.tags : [];
  return item.type === 'nota' && tags.includes('diario');
}

export function MemoriaHomePageV2() {
  const items = useDataStore((state) => state.items);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const diaryNotes = useMemo(
    () =>
      items
        .filter(isDiaryNote)
        .sort((left, right) => (right.due_date ?? '').localeCompare(left.due_date ?? '')),
    [items],
  );

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Memoria</p>
        <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]">Caixola</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Os registros do encerramento ficam recuperaveis aqui como notas de diario.</p>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <BookText className="h-5 w-5 text-[var(--teal)]" />
          <p className="text-sm font-semibold">Diario</p>
        </div>
        {diaryNotes.length > 0 ? (
          <div className="space-y-2">
            {diaryNotes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItem(item)}
                className="w-full rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-left"
              >
                <p className="text-sm font-medium text-[var(--text)]">{item.title}</p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">{item.description?.slice(0, 120) || 'Registro sem conteudo.'}</p>
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)]">Nenhum diario salvo ainda.</div>
        )}
      </Card>

      {selectedItem ? (
        <EntitySheetWrapper item={selectedItem} visible={!!selectedItem} onClose={() => setSelectedItem(null)} onEdit={() => setSelectedItem(null)} />
      ) : null}
    </div>
  );
}
