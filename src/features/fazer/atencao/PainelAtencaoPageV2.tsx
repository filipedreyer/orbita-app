import { useState } from 'react';
import { AlertTriangle, Eye, ShieldAlert } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { EntitySheetWrapper } from '../../entity/EntitySheetWrapper';
import type { Item } from '../../../lib/types';
import { useHojeProjection } from '../../../store/fazer';

export function PainelAtencaoPageV2() {
  const projection = useHojeProjection();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const zones = [
    { key: 'urgente', label: 'Urgente', items: projection.attention.zones.urgente, color: '#B42318' },
    { key: 'cuidado', label: 'Cuidado', items: projection.attention.zones.cuidado, color: '#9A5B00' },
    { key: 'radar', label: 'Radar', items: projection.attention.zones.radar, color: 'var(--teal)' },
  ] as const;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Painel de Atencao</p>
        <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em]">Sinais do sistema</h3>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-[var(--teal)]" />
          <p className="text-sm font-semibold capitalize">{projection.attention.level}</p>
        </div>
        <div className="space-y-2">
          {projection.attention.reasons.length > 0 ? (
            projection.attention.reasons.map((reason) => (
              <div key={reason} className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                {reason}
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)]">Nenhum sinal critico no momento.</div>
          )}
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-[var(--yellow)]" />
          <p className="text-sm font-semibold">Leitura atual</p>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Este painel ja usa regras canonicas de atraso, capacidade e pressao do dia definidas no dominio de Fazer.
        </p>
      </Card>

      {zones.map((zone) => (
        <Card key={zone.key} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold" style={{ color: zone.color }}>
              {zone.label}
            </p>
            <span className="text-xs text-[var(--text-secondary)]">{zone.items.length} itens</span>
          </div>
          {zone.items.length > 0 ? (
            <div className="space-y-2">
              {zone.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className="flex w-full items-center justify-between rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{item.title}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{item.type}</p>
                  </div>
                  <Eye className="h-4 w-4 text-[var(--text-secondary)]" />
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)]">Nenhum item nesta zona.</div>
          )}
        </Card>
      ))}

      {selectedItem ? (
        <EntitySheetWrapper item={selectedItem} visible={!!selectedItem} onClose={() => setSelectedItem(null)} onEdit={() => setSelectedItem(null)} />
      ) : null}
    </div>
  );
}
