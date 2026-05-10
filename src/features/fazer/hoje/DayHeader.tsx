import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../app/routes';
import { Card } from '../../../components/ui/Card';
import { MetricBox } from '../../../components/ui/MetricBox';
import type { CapacityStatus, DirectionStatusResult } from '../domain/canonical';

export function DayHeader({
  attentionLevel,
  capacity,
  dayItemsCount,
  direction,
  overdueCount,
}: {
  attentionLevel: 'neutral' | 'attention' | 'tension';
  capacity: CapacityStatus;
  dayItemsCount: number;
  direction: DirectionStatusResult;
  operationalHours: number;
  overdueCount: number;
}) {
  const navigate = useNavigate();
  const capacityValue = capacity.committedHours === null ? capacity.completeness : `${capacity.committedHours}h`;

  const tone =
    attentionLevel === 'tension'
      ? 'border-[var(--danger)] bg-[color-mix(in_srgb,var(--danger)_8%,var(--surface))]'
      : attentionLevel === 'attention'
        ? 'border-[var(--warning)] bg-[color-mix(in_srgb,var(--warning)_12%,var(--surface))]'
        : 'border-[var(--accent-border)] bg-[var(--accent-soft)]';

  return (
    <Card className={`space-y-5 p-5 ${tone}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Hoje</p>
          <h3 className="mt-1 text-3xl font-bold text-[var(--text)]">{dayItemsCount} itens no dia</h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {capacity.label}: {capacityValue} mapeado - pendencias atrasadas: {overdueCount}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(routes.fazerAtencao)}
          className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-3 text-[var(--text-secondary)] shadow-[var(--shadow-card)] transition hover:border-[var(--border-strong)] hover:text-[var(--text)]"
          aria-label="Abrir painel de atencao"
        >
          <AlertTriangle className="h-5 w-5" />
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <MetricBox label="Capacidade" value={capacityValue} hint={capacity.description} />
        <MetricBox label="Direcao" value={direction.status} hint={`${direction.linkedCount} ligados - ${direction.standaloneCount} soltos`} />
      </div>
    </Card>
  );
}
