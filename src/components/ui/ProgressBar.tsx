export function ProgressBar({ value }: { value: number }) {
  const width = Math.max(0, Math.min(100, value));

  return (
    <div className="h-2.5 w-full overflow-hidden rounded-[var(--radius-pill)] bg-[var(--surface-alt)]">
      <div className="h-full rounded-[var(--radius-pill)] bg-[var(--accent)] transition-all" style={{ width: `${width}%` }} />
    </div>
  );
}
