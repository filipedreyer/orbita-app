import type { PropsWithChildren, ReactNode } from 'react';

export function AuthShell({ title, subtitle, footer, children }: PropsWithChildren<{ title: string; subtitle: string; footer?: ReactNode }>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_#e8f4f4,_#f8f8f8_50%,_#ffffff)] px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-[var(--border)] bg-white p-8 shadow-[0_24px_80px_rgba(14,107,107,0.12)]">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--teal)]">Órbita PWA</p>
        <h1 className="text-3xl font-bold tracking-[-0.04em] text-[var(--text)]">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{subtitle}</p>
        <div className="mt-8 space-y-4">{children}</div>
        {footer ? <div className="mt-6 text-sm text-[var(--text-secondary)]">{footer}</div> : null}
      </div>
    </div>
  );
}
