export function StreakIndicator({ streak }: { streak: number }) {
  return <span className="text-xs font-semibold text-[var(--success)]">{streak}d</span>;
}
