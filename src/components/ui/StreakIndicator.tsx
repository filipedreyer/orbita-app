export function StreakIndicator({ streak }: { streak: number }) {
  return <span className="text-xs font-semibold text-[var(--green)]">{streak}d</span>;
}
