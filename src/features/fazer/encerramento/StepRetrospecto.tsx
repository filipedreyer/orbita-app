import { Card } from '../../../components/ui/Card';
import type { Item } from '../../../lib/types';

export function StepRetrospecto({ items }: { items: Item[] }) {
  return (
    <Card className="space-y-3">
      <h4 className="text-lg font-semibold">Retrospecto</h4>
      <div className="space-y-2">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              {item.title}
            </div>
          ))
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">Nenhum item concluído hoje.</p>
        )}
      </div>
    </Card>
  );
}
