export function DatePickerField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (next: string | null) => void;
}) {
  return (
    <input
      type="date"
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value || null)}
      className="w-full rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text)] outline-none transition focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:ring-[3px] focus:ring-[var(--focus-ring)]"
    />
  );
}
