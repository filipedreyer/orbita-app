import { useEffect, useState } from 'react';
import { Archive } from 'lucide-react';
import { Card } from '../../components/ui';
import type { Item } from '../../lib/types';
import { useAuthStore } from '../../store';
import * as itemsService from '../../services/items';
import { getPlainText } from './memory-helpers';

export function ArquivadosPage() {
  const session = useAuthStore((state) => state.session);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    if (!session?.user) return;
    void itemsService.fetchArchivedItems(session.user.id).then(setItems).catch(() => setItems([]));
  }, [session]);

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <Archive className="h-5 w-5 text-[var(--teal)]" />
          <h3 className="text-xl font-semibold">Arquivados</h3>
        </div>
      </Card>

      <div className="space-y-3">
        {items.map((item) => (
          <Card key={item.id} className="space-y-2 p-4">
            <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{item.type}</p>
            <p className="text-sm text-[var(--text-secondary)]">{getPlainText(item.description).slice(0, 180) || 'Sem conteúdo textual.'}</p>
          </Card>
        ))}
        {items.length === 0 ? <Card className="p-6 text-sm text-[var(--text-secondary)]">Nenhum item arquivado encontrado.</Card> : null}
      </div>
    </div>
  );
}
