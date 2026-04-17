import { Card } from '../../components/ui';

export function PlanejarPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="space-y-3 p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Placeholder da Fase 4</p>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-sm text-[var(--text-secondary)]">{description}</p>
    </Card>
  );
}
