import { Card } from './Card';

export function MetricBox({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="space-y-2 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{label}</p>
      <p className="text-2xl font-bold tracking-[-0.02em] text-[var(--text)]">{value}</p>
      {hint ? <p className="text-sm text-[var(--text-secondary)]">{hint}</p> : null}
    </Card>
  );
}
