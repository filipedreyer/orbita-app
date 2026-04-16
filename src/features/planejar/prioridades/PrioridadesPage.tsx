import { AlertTriangle, ArrowDownUp } from 'lucide-react';
import { Button, Card, PriorityBadge } from '../../../components/ui';
import { useDataStore } from '../../../store';
import { usePlanejarProjection } from '../../../store/planejar';
import type { Item, PriorityLevel } from '../../../lib/types';

function nextMetadata(item: Item) {
  return {
    ...(item.metadata as Record<string, unknown>),
  };
}

export function PrioridadesPage() {
  const projection = usePlanejarProjection();
  const updateItem = useDataStore((state) => state.updateItem);

  const setPriority = (item: Item, priority: PriorityLevel | null) => {
    void updateItem(item.id, {
      priority,
      metadata: nextMetadata(item),
    });
  };

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <ArrowDownUp className="h-4 w-4" />
          Prioridade basica
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Ordem deterministica desta fase: <span className="font-semibold text-[var(--text)]">{projection.summary.priorityRule}</span>
        </p>
      </Card>

      <div className="grid gap-4">
        {projection.priorities.map((item) => (
          <Card key={item.id} className="space-y-4 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{item.type}</p>
                <h4 className="mt-2 text-lg font-semibold">{item.title}</h4>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Horizonte: <span className="font-semibold text-[var(--text)]">{item.horizon}</span>
                  {item.dueDate ? ` · Prazo ${item.dueDate}` : ''}
                </p>
              </div>
              {item.priority ? <PriorityBadge priority={item.priority} /> : <span className="text-sm text-[var(--text-tertiary)]">Sem prioridade</span>}
            </div>

            {item.overdue ? (
              <div className="flex items-center gap-2 rounded-2xl bg-[#FFF4E8] px-3 py-2 text-sm font-medium text-[#9A5B00]">
                <AlertTriangle className="h-4 w-4" />
                Atrasado. Isso sobe o item dentro da ordem, mas nao substitui elegibilidade.
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button variant={item.priority === 'alta' ? 'primary' : 'secondary'} onClick={() => setPriority(item.rawItem, 'alta')}>
                Alta
              </Button>
              <Button variant={item.priority === 'media' ? 'primary' : 'ghost'} onClick={() => setPriority(item.rawItem, 'media')}>
                Media
              </Button>
              <Button variant={item.priority === 'baixa' ? 'primary' : 'ghost'} onClick={() => setPriority(item.rawItem, 'baixa')}>
                Baixa
              </Button>
              <Button variant={!item.priority ? 'primary' : 'ghost'} onClick={() => setPriority(item.rawItem, null)}>
                Sem prioridade
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
