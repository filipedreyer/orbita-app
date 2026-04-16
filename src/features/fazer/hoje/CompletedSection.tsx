import type { Item } from '../../../lib/types';
import { Card } from '../../../components/ui/Card';

export function CompletedSection({ items }: { items: Item[] }) {
  if (items.length === 0) return null;

  return (
    <Card className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Concluídos hoje</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-tertiary)] line-through">
            {item.title}
          </div>
        ))}
      </div>
    </Card>
  );
}
