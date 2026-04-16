import type { PropsWithChildren } from 'react';

export function Field({ label, children }: PropsWithChildren<{ label: string }>) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{label}</span>
      {children}
    </label>
  );
}
