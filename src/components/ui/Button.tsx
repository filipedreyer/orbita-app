import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { clsx } from 'clsx';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
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
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-2xl)] border px-4 py-3 text-sm font-semibold transition',
        'focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' &&
          'border-[var(--accent)] bg-[var(--accent)] text-white hover:border-[var(--accent)] hover:brightness-[0.98] active:scale-[0.99]',
        variant === 'secondary' &&
          'border-[var(--accent-border)] bg-[var(--accent-soft)] text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent-soft)_72%,var(--surface))] active:scale-[0.99]',
        variant === 'ghost' &&
          'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-alt)] hover:text-[var(--text)] active:scale-[0.99]',
        variant === 'destructive' &&
          'border-[var(--danger)] bg-[var(--danger)] text-white hover:brightness-[0.98] active:scale-[0.99]',
        size === 'icon' && 'h-11 w-11 px-0 py-0',
        className,
      )}
      {...props}
    >
      {loading ? 'Carregando...' : children}
    </button>
  );
}
