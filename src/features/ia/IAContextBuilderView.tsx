import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { InboxItem, Item } from '../../lib/types';
import { buildIAContext } from './IAContextBuilder';
import type { IARouteContext } from './types';

export function IAContextBuilder({
  pathname,
  items,
  inbox,
  children,
}: {
  pathname: string;
  items: Item[];
  inbox: InboxItem[];
  children: (context: IARouteContext) => ReactNode;
}) {
  const context = useMemo(() => buildIAContext({ pathname, items, inbox }), [inbox, items, pathname]);
  return <>{children(context)}</>;
}
