import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../app/routes';
import { Card } from '../../../components/ui/Card';

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
      ? 'border-[var(--red)] bg-[color:var(--red)]/5'
      : attentionLevel === 'attention'
        ? 'border-[var(--yellow)] bg-[color:var(--yellow)]/10'
        : 'border-[var(--teal-mid)] bg-[var(--teal-light)]';

  return (
    <Card className={`space-y-3 ${tone}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Hoje</p>
          <h3 className="mt-1 text-2xl font-bold tracking-[-0.03em]">{dayItemsCount} itens em foco</h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Capacidade operacional estimada: {operationalHours}h · pendências atrasadas: {overdueCount}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(routes.fazerAtencao)}
          className="rounded-2xl border border-[var(--border)] bg-white p-3 text-[var(--text-secondary)]"
        >
          <AlertTriangle className="h-5 w-5" />
        </button>
      </div>
    </Card>
  );
}
