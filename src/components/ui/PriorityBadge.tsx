import { Badge } from './Badge';

export function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return null;

  const labels: Record<string, string> = {
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa',
  };

  const tones: Record<string, 'risk' | 'attention' | 'task'> = {
    alta: 'risk',
    media: 'attention',
    baixa: 'task',
  };

  return <Badge label={labels[priority] ?? priority} tone={tones[priority] ?? 'neutral'} />;
}
