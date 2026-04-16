import { Link2, ShieldAlert } from 'lucide-react';
import { Card } from '../../../components/ui';
import { useDataStore } from '../../../store';
import { usePlanejarProjection } from '../../../store/planejar';
import type { Item } from '../../../lib/types';

function nextMetadata(item: Item, blockedBy: string[]) {
  return {
    ...(item.metadata as Record<string, unknown>),
    blocked_by: blockedBy,
  };
}

export function DependenciasPage() {
  const projection = usePlanejarProjection();
  const updateItem = useDataStore((state) => state.updateItem);

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <Link2 className="h-4 w-4" />
          Dependencias bloqueantes
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Um item pronto para Fazer precisa estar no horizonte imediato e sem bloqueio pendente.
        </p>
      </Card>

      <div className="grid gap-4">
        {projection.dependencies.map((item) => (
          <Card key={item.id} className="space-y-4 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{item.type}</p>
                <h4 className="mt-2 text-lg font-semibold">{item.title}</h4>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Horizonte: <span className="font-semibold text-[var(--text)]">{item.horizon}</span>
                </p>
              </div>
              {item.blocked ? (
                <div className="inline-flex items-center gap-2 rounded-2xl bg-[#FFF1F1] px-3 py-2 text-sm font-medium text-[#A53A3A]">
                  <ShieldAlert className="h-4 w-4" />
                  Bloqueado
                </div>
              ) : (
                <div className="rounded-2xl bg-[var(--teal-light)] px-3 py-2 text-sm font-medium text-[var(--teal)]">Sem bloqueio</div>
              )}
            </div>

            <label className="block text-sm text-[var(--text-secondary)]">
              Dependencia principal
              <select
                className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)]"
                value={item.blockedByIds[0] ?? ''}
                onChange={(event) =>
                  void updateItem(item.id, {
                    metadata: nextMetadata(item.rawItem, event.target.value ? [event.target.value] : []),
                  })
                }
              >
                <option value="">Sem dependencia</option>
                {item.dependencyOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.title} ({option.type})
                  </option>
                ))}
              </select>
            </label>
          </Card>
        ))}
      </div>
    </div>
  );
}
