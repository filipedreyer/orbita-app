import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{label}</span> : null}
      <input
        className={`w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--text-tertiary)] focus:border-[var(--teal)] focus:bg-white ${className ?? ''}`}
        {...props}
      />
    </label>
  );
}
