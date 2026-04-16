import { Badge } from './Badge';

export function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return null;

  const labels: Record<string, string> = {
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa',
  };

  const colors: Record<string, string> = {
    alta: 'var(--red)',
    media: 'var(--yellow)',
    baixa: '#2563eb',
  };

  return <Badge label={labels[priority] ?? priority} color={colors[priority] ?? 'var(--text-secondary)'} />;
}
