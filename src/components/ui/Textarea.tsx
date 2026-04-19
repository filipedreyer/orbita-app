import type { TextareaHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{label}</span> : null}
      <textarea
        className={clsx(
          'min-h-24 w-full rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text)] outline-none transition',
          'placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] focus:bg-[var(--surface)] focus:ring-[3px] focus:ring-[var(--focus-ring)]',
          'aria-[invalid=true]:border-[var(--danger)] aria-[invalid=true]:bg-[var(--surface)] aria-[invalid=true]:ring-[3px] aria-[invalid=true]:ring-[var(--focus-ring-danger)]',
          'disabled:cursor-not-allowed disabled:border-[var(--border)] disabled:bg-[var(--surface-disabled)] disabled:text-[var(--text-tertiary)]',
          className,
        )}
        {...props}
      />
    </label>
  );
}
