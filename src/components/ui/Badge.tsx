type BadgeTone = 'healthy' | 'attention' | 'risk' | 'critical' | 'project' | 'task' | 'neutral';

function resolveToneColor(tone: BadgeTone) {
  switch (tone) {
    case 'healthy':
      return { color: 'var(--state-healthy)', bgColor: 'var(--state-healthy-soft)' };
    case 'attention':
      return { color: 'var(--state-attention)', bgColor: 'var(--state-attention-soft)' };
    case 'risk':
      return { color: 'var(--state-risk)', bgColor: 'var(--state-risk-soft)' };
    case 'critical':
      return { color: 'var(--state-critical)', bgColor: 'var(--state-critical-soft)' };
    case 'project':
      return { color: 'var(--accent)', bgColor: 'var(--accent-soft)' };
    case 'task':
      return { color: 'var(--task)', bgColor: 'color-mix(in srgb, var(--task) 14%, transparent)' };
    case 'neutral':
    default:
      return { color: 'var(--text-secondary)', bgColor: 'color-mix(in srgb, var(--text-secondary) 10%, transparent)' };
  }
}

export function Badge({
  label,
  color = 'var(--state-risk)',
  bgColor,
  tone,
}: {
  label: string;
  color?: string;
  bgColor?: string;
  tone?: BadgeTone;
}) {
  const resolved = tone ? resolveToneColor(tone) : null;

  return (
    <span
      className="inline-flex rounded-[var(--radius-md)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
      style={{
        color: resolved?.color ?? color,
        backgroundColor: resolved?.bgColor ?? bgColor ?? `color-mix(in srgb, ${color} 14%, transparent)`,
      }}
    >
      {label}
    </span>
  );
}
