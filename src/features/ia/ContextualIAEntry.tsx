import { Badge, Card } from '../../components/ui';
import type { IARouteContext } from './types';

export function ContextualIAEntry({ context }: { context: IARouteContext }) {
  return (
    <Card className="space-y-3 p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Idea</p>
        <p className="mt-1 text-sm font-semibold text-[var(--text)]">{context.routeLabel}</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{context.title}</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{context.subtitle}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {context.visibleContext.map((entry) => (
          <Badge key={entry} label={entry} tone="project" />
        ))}
      </div>
    </Card>
  );
}

