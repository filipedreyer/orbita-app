import type { Item } from '../../../lib/types';
import { Card } from '../../../components/ui/Card';

export function InegociavelCapacityBlock({ items }: { items: Item[] }) {
  if (items.length === 0) return null;

  return (
    <Card className="space-y-3 border-[var(--teal-mid)] bg-[var(--teal-light)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--teal)]">Inegociaveis sem horario</p>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="rounded-2xl bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text)]">{item.title}</span>
            <p className="mt-1 text-xs text-[var(--text-secondary)]">Impacta capacidade, mas nao entra como item arrastavel no dia.</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
