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
        'flex w-full items-center gap-3 px-4 py-3 text-left',
        !isLast && 'border-b border-[var(--border)]',
      )}
    >
      {children}
    </Component>
  );
}
