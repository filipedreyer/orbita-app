import type { PropsWithChildren } from 'react';
import { clsx } from 'clsx';

export function CardRow({
  children,
  onPress,
  isLast,
}: PropsWithChildren<{ onPress?: () => void; isLast?: boolean }>) {
  const Component = onPress ? 'button' : 'div';

  return (
    <Component
      type={onPress ? 'button' : undefined}
      onClick={onPress}
      className={clsx(
        'flex w-full items-center gap-3 rounded-[var(--radius-xl)] px-4 py-3 text-left transition',
        onPress && 'hover:bg-[var(--surface-alt)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--focus-ring)]',
        !isLast && 'border-b border-[var(--border)]',
      )}
    >
      {children}
    </Component>
  );
}
