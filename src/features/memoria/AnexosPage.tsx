import { Paperclip } from 'lucide-react';
import { Card } from '../../components/ui';
import { useDataStore } from '../../store';

export function AnexosPage() {
  const itemsWithAttachments = useDataStore((state) => state.items.filter((item) => !!item.image_url));

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <Paperclip className="h-5 w-5 text-[var(--teal)]" />
          <h3 className="text-xl font-semibold">Anexos</h3>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {itemsWithAttachments.map((item) => (
          <Card key={item.id} className="space-y-3 p-4">
            <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{item.type}</p>
            <img src={item.image_url ?? ''} alt={item.title} className="h-48 w-full rounded-2xl object-cover" />
          </Card>
        ))}
        {itemsWithAttachments.length === 0 ? <Card className="p-6 text-sm text-[var(--text-secondary)]">Nenhum anexo disponível no momento.</Card> : null}
      </div>
    </div>
  );
}
