import type { CaptureGridAction } from './capture-types';

export function CaptureTypeTile({
  option,
  onSelect,
}: {
  option: CaptureGridAction;
  onSelect: (option: CaptureGridAction) => void;
}) {
  const Icon = option.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(option)}
      className="flex min-h-28 flex-col items-start justify-between rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-3 text-left shadow-[var(--shadow-card)] transition hover:border-[var(--accent-border)] hover:bg-[var(--surface-alt)]"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--accent-soft)] text-[var(--accent)]">
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-[var(--text)]">{option.label}</span>
        <span className="mt-1 block text-xs leading-4 text-[var(--text-secondary)]">{option.description}</span>
      </span>
    </button>
  );
}

