import { ArrowRight, ArrowDown, ArrowUp } from 'lucide-react';

export function DirectionLabel({ direction }: { direction: 'up' | 'stable' | 'down' }) {
  const config = {
    up: { icon: ArrowUp, label: 'Aproximando', color: 'var(--state-healthy)' },
    stable: { icon: ArrowRight, label: 'Estavel', color: 'var(--state-attention)' },
    down: { icon: ArrowDown, label: 'Afastando', color: 'var(--state-risk)' },
  }[direction];

  const Icon = config.icon;

  return (
    <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: config.color }}>
      <Icon className="h-4 w-4" />
      <span>{config.label}</span>
    </div>
  );
}
