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
      className="flex h-6 w-6 items-center justify-center border transition"
      style={{
        borderRadius: circle ? '999px' : '6px',
        borderColor: checked ? accentColor : 'var(--border)',
        backgroundColor: checked ? accentColor : 'transparent',
      }}
    >
      {checked ? <Check className="h-4 w-4 text-white" /> : null}
    </button>
  );
}
