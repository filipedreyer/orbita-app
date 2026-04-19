import type { HTMLAttributes, PropsWithChildren } from 'react';
import { clsx } from 'clsx';

export function Card({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={clsx('rounded-[var(--radius-3xl)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-card)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}
