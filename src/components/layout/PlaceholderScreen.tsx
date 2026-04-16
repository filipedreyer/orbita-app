import type { LucideIcon } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface PlaceholderAction {
  label: string;
  icon: LucideIcon;
  variant?: 'primary' | 'secondary';
}

export function PlaceholderScreen({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions: PlaceholderAction[];
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]">{title}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {actions.map(({ label, icon: Icon, variant = 'primary' }) => (
          <Card key={label} className="space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--teal-light)] text-[var(--teal)]">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{label}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Estrutura inicial renderizada nesta fase.</p>
            </div>
            <Button variant={variant} className="w-full justify-between">
              Abrir em breve
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
