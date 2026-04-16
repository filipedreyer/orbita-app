import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'default' | 'icon';

interface ButtonProps extends PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  ariaLabel?: string;
  loading?: boolean;
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'default',
  ariaLabel,
  loading = false,
  ...props
}: ButtonProps) {
  return (
    <button
      aria-label={ariaLabel}
      className={clsx(
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' && 'border-[var(--teal)] bg-[var(--teal)] text-white',
        variant === 'secondary' && 'border-[var(--teal-mid)] bg-[var(--teal-light)] text-[var(--teal)]',
        variant === 'ghost' && 'border-[var(--border)] bg-white text-[var(--text-secondary)]',
        size === 'icon' && 'h-11 w-11 px-0 py-0',
        className,
      )}
      {...props}
    >
      {loading ? 'Carregando...' : children}
    </button>
  );
}
