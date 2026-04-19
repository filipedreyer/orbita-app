import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../app/routes';
import { Card } from '../../../components/ui/Card';
import { MetricBox } from '../../../components/ui/MetricBox';

export function DayHeader({
  attentionLevel,
  dayItemsCount,
  operationalHours,
  overdueCount,
}: {
  attentionLevel: 'neutral' | 'attention' | 'tension';
  dayItemsCount: number;
  operationalHours: number;
  overdueCount: number;
}) {
  const navigate = useNavigate();

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
          <h3 className="mt-1 text-3xl font-bold tracking-[-0.04em] text-[var(--text)]">{dayItemsCount} itens em foco</h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Capacidade operacional estimada: {operationalHours}h · pendências atrasadas: {overdueCount}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(routes.fazerAtencao)}
          className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-3 text-[var(--text-secondary)] shadow-[var(--shadow-card)] transition hover:border-[var(--border-strong)] hover:text-[var(--text)]"
        >
          <AlertTriangle className="h-5 w-5" />
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <MetricBox label="Capacidade" value={`${operationalHours}h`} hint="Estimativa operacional do dia." />
        <MetricBox label="Atrasos" value={overdueCount} hint="Itens que ainda pressionam o sistema." />
      </div>
    </Card>
  );
}
