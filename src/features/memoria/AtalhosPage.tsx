import { Link2 } from 'lucide-react';
import { Card } from '../../components/ui';
import { useDataStore } from '../../store';
import { getPlainText, isShortcutItem } from './memory-helpers';

export function AtalhosPage() {
  const shortcutItems = useDataStore((state) => state.items.filter(isShortcutItem));

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <Link2 className="h-5 w-5 text-[var(--teal)]" />
          <h3 className="text-xl font-semibold">Atalhos</h3>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">Itens marcados para reuso ou acesso rápido.</p>
      </Card>

      <div className="space-y-3">
        {shortcutItems.map((item) => (
          <Card key={item.id} className="space-y-2 p-4">
            <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{item.type}</p>
            <p className="text-sm text-[var(--text-secondary)]">{getPlainText(item.description).slice(0, 160) || 'Sem descrição.'}</p>
          </Card>
        ))}
        {shortcutItems.length === 0 ? <Card className="p-6 text-sm text-[var(--text-secondary)]">Nenhum atalho marcado ainda. Use a tag "atalho" para criar seus primeiros acessos rápidos.</Card> : null}
      </div>
    </div>
  );
}
