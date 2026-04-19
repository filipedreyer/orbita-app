export function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3">
      <span className="text-sm text-[var(--text-secondary)]">{label}</span>
      <span className="text-sm font-semibold text-[var(--text)]">{value}</span>
    </div>
  );
}
