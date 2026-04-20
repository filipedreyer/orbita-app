interface PillOption {
  key: string;
  label: string;
  color?: string;
}

function resolveSemanticPillColor(color?: string) {
  if (!color) return null;

  const normalized = color.trim().toLowerCase();
  if (normalized === 'var(--danger)' || normalized === 'var(--red)' || normalized === 'var(--state-risk)' || normalized === 'var(--state-critical)') return 'var(--state-risk)';
  if (normalized === 'var(--warning)' || normalized === 'var(--yellow)' || normalized === 'var(--state-attention)') return 'var(--state-attention)';
  if (normalized === 'var(--success)' || normalized === 'var(--green)' || normalized === 'var(--state-healthy)') return 'var(--state-healthy)';
  if (normalized === 'var(--accent)' || normalized === 'var(--teal)' || normalized === 'var(--accent-soft)' || normalized === 'var(--teal-light)') return 'var(--accent)';
  if (normalized === 'var(--task)' || normalized === '#2563eb') return 'var(--task)';
  if (normalized === 'var(--text-secondary)' || normalized === 'var(--ink)') return 'var(--text-secondary)';

  return color;
}

export function PillSelector({
  options,
  selected,
  onSelect,
  allowNull,
}: {
  options: PillOption[];
  selected: string | null;
  onSelect: (key: string | null) => void;
  allowNull?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option.key === selected;
        const semanticColor = resolveSemanticPillColor(option.color);
        const activeStyles = semanticColor
          ? { backgroundColor: semanticColor, borderColor: semanticColor, color: '#fff' }
          : undefined;

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onSelect(isActive && allowNull ? null : option.key)}
            className="min-h-9 rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-alt)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--focus-ring)]"
            style={isActive ? activeStyles ?? { backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent-border)', color: 'var(--accent)' } : undefined}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
