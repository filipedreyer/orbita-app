import { Check } from 'lucide-react';

export function Checkbox({
  checked,
  onToggle,
  circle,
  accentColor = 'var(--teal)',
}: {
  checked: boolean;
  onToggle: () => void;
  circle?: boolean;
  accentColor?: string;
}) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className="flex h-6 w-6 items-center justify-center border shadow-[inset_0_1px_0_rgba(255,255,255,0.24)] transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--focus-ring)]"
      style={{
        borderRadius: circle ? 'var(--radius-pill)' : 'var(--radius-md)',
        borderColor: checked ? accentColor : 'var(--border)',
        backgroundColor: checked ? accentColor : 'var(--surface)',
      }}
    >
      {checked ? <Check className="h-4 w-4 text-white" /> : null}
    </button>
  );
}
