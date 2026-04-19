export function SectionHeader({
  label,
  count,
}: {
  label: string;
  count?: number;
}) {
  return (
    <div className="mb-3 mt-6 flex items-center justify-between">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{label}</h3>
      {typeof count === 'number' ? <span className="text-xs font-medium text-[var(--text-tertiary)]">{count}</span> : null}
    </div>
  );
}
