import { CalendarRange, ArrowRightCircle } from 'lucide-react';
import { Button, Card, PriorityBadge } from '../../../components/ui';
import { useDataStore } from '../../../store';
import { usePlanejarProjection } from '../../../store/planejar';
import type { Item } from '../../../lib/types';

function nextMetadata(item: Item, horizonte: 'imediato' | 'semana' | 'depois') {
  return {
    ...(item.metadata as Record<string, unknown>),
    horizonte,
  };
}

export function BacklogPage() {
  const projection = usePlanejarProjection();
  const updateItem = useDataStore((state) => state.updateItem);

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Backlog</p>
            <h3 className="mt-2 text-xl font-bold">Itens fora do horizonte operacional imediato</h3>
          </div>
          <div className="rounded-2xl bg-[var(--bg-soft)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            Capacidade herdada de Fazer: {projection.summary.operationalHours}h livres
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {projection.backlog.map((item) => (
          <Card key={item.id} className="space-y-4 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{item.type}</p>
                <h4 className="mt-2 text-lg font-semibold">{item.title}</h4>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Horizonte atual: <span className="font-semibold text-[var(--text)]">{item.horizon}</span>
                </p>
              </div>
              {item.priority ? <PriorityBadge priority={item.priority} /> : null}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant={item.horizon === 'imediato' ? 'primary' : 'secondary'} onClick={() => void updateItem(item.id, { metadata: nextMetadata(item.rawItem, 'imediato') })}>
                <ArrowRightCircle className="h-4 w-4" />
                Imediato
              </Button>
              <Button variant={item.horizon === 'semana' ? 'primary' : 'ghost'} onClick={() => void updateItem(item.id, { metadata: nextMetadata(item.rawItem, 'semana') })}>
                <CalendarRange className="h-4 w-4" />
                Semana
              </Button>
              <Button variant={item.horizon === 'depois' ? 'primary' : 'ghost'} onClick={() => void updateItem(item.id, { metadata: nextMetadata(item.rawItem, 'depois') })}>
                Depois
              </Button>
            </div>
          </Card>
        ))}

        {projection.backlog.length === 0 ? (
          <Card className="p-6 text-sm text-[var(--text-secondary)]">Nenhum item no backlog. Tudo que e elegivel ja foi puxado para o horizonte imediato.</Card>
        ) : null}
      </div>
    </div>
  );
}
