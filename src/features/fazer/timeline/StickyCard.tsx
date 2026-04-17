import { Card } from '../../../components/ui/Card';

export function StickyCard() {
  return (
    <Card className="space-y-2 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Placeholder</p>
      <h4 className="text-base font-semibold">StickyCard</h4>
      <p className="text-sm text-[var(--text-secondary)]">TODO: consolidar o card contextual fixo da Onda 2 das dependencias.</p>
    </Card>
  );
}
