import { Link2, Sparkles } from 'lucide-react';
import type { Item } from '../../lib/types';

export function EntitySheetHeader({ item }: { item: Item }) {
  return (
    <div className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Contexto</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Wrapper externo para extensões do sheet preservado.</p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-full border border-[var(--border)] p-2 text-[var(--text-secondary)]" aria-hidden="true">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="rounded-full border border-[var(--border)] p-2 text-[var(--text-secondary)]" aria-hidden="true">
            <Link2 className="h-4 w-4" />
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs text-[var(--text-tertiary)]">Tipo atual: {item.type}</p>
    </div>
  );
}
