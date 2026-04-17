import { BottomSheet, Button } from '../../components/ui';
import type { Item } from '../../lib/types';
import { IATextAnalyzer } from '../ia/IATextAnalyzer';

export function NoteEntitySheet({
  item,
  visible,
  onClose,
  onEdit,
}: {
  item: Item;
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Nota">
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold tracking-[-0.03em]">{item.title}</h3>
        </div>

        {item.description ? (
          <>
            <div
              className="space-y-3 text-sm leading-6 text-[var(--text)] [&_h1]:text-3xl [&_h1]:font-bold [&_h2]:text-2xl [&_h2]:font-semibold [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
            <IATextAnalyzer sourceId={`note-sheet:${item.id}`} sourceLabel={item.title} text={item.description} />
          </>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">Nota sem conteudo.</p>
        )}

        <div className="flex gap-2">
          <Button className="flex-1" variant="ghost" onClick={onClose}>
            Fechar
          </Button>
          <Button className="flex-1" onClick={onEdit}>
            Editar
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
