import type { Item } from '../../lib/types';

export function EntitySheetFooter({ item }: { item: Item }) {
  const tags = item.tags.length > 0 ? item.tags.join(', ') : 'Sem tags';

  return (
    <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-4 text-sm text-[var(--text-secondary)]">
      <p className="font-semibold text-[var(--text)]">Vínculos contextuais</p>
      <p className="mt-2">Tags: {tags}</p>
      <p className="mt-1">Goal: {item.goal_id ?? 'Sem vínculo'}</p>
      <p className="mt-1">Projeto: {item.project_id ?? 'Sem vínculo'}</p>
    </div>
  );
}
