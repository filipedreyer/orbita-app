import { Badge, Card } from '../../components/ui';
import type { IAActionDescriptor, IASuggestionDescriptor } from './types';
import { IAActionButton } from './IAActionButton';

const toneColor = {
  neutral: 'var(--teal)',
  warning: 'var(--amber, #b45309)',
  support: 'var(--green, #15803d)',
} as const;

export function IASuggestion({
  suggestion,
  completedActions,
  onRunAction,
}: {
  suggestion: IASuggestionDescriptor;
  completedActions: Record<string, boolean>;
  onRunAction: (action: IAActionDescriptor) => void;
}) {
  return (
    <Card className="space-y-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">{suggestion.title}</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{suggestion.description}</p>
        </div>
        <Badge label="IA mock" color={toneColor[suggestion.tone ?? 'neutral']} />
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestion.actions.map((action) => (
          <IAActionButton key={action.id} action={action} completed={!!completedActions[action.id]} onRun={onRunAction} />
        ))}
      </div>
    </Card>
  );
}
