import { Check, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui';
import type { IAActionDescriptor } from './types';

export function IAActionButton({
  action,
  completed,
  onRun,
}: {
  action: IAActionDescriptor;
  completed: boolean;
  onRun: (action: IAActionDescriptor) => void;
}) {
  return (
    <Button variant={completed ? 'secondary' : 'primary'} onClick={() => onRun(action)}>
      {completed ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      {completed ? 'Feito ✓' : action.label}
    </Button>
  );
}
