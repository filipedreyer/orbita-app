import type { HTMLAttributes, PropsWithChildren } from 'react';
import { clsx } from 'clsx';

export function Card({ children, className, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={clsx('rounded-3xl border border-[var(--border)] bg-white p-5 shadow-[0_10px_30px_rgba(17,17,17,0.04)]', className)}
      {...props}
    >
      {children}
    </div>
  );
}
