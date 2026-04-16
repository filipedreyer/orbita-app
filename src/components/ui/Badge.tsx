export function Badge({
  label,
  color = 'var(--red)',
  bgColor,
}: {
  label: string;
  color?: string;
  bgColor?: string;
}) {
  return (
    <span
      className="inline-flex rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]"
      style={{ color, backgroundColor: bgColor ?? `${color}20` }}
    >
      {label}
    </span>
  );
}
