export function Badge({
  label,
  color = 'var(--danger)',
  bgColor,
}: {
  label: string;
  color?: string;
  bgColor?: string;
}) {
  return (
    <span
      className="inline-flex rounded-[var(--radius-md)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
      style={{ color, backgroundColor: bgColor ?? `color-mix(in srgb, ${color} 14%, transparent)` }}
    >
      {label}
    </span>
  );
}
