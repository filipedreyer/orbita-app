import { Badge, Button } from '../../components/ui';
import type { Item } from '../../lib/types';
import { useDataStore } from '../../store';
import { hasOperationalCommitment, isOperationalCommitmentCoherent } from '../fazer/domain/ordering';

export function EntitySheetCommitmentFooter({ item }: { item: Item }) {
  const items = useDataStore((state) => state.items);
  const updateItem = useDataStore((state) => state.updateItem);
  const currentItem = items.find((entry) => entry.id === item.id) ?? item;
  const tags = currentItem.tags.length > 0 ? currentItem.tags.join(', ') : 'Sem tags';
  const metadata = (currentItem.metadata as Record<string, unknown>) || {};
  const committed = hasOperationalCommitment(currentItem);
  const coherent = isOperationalCommitmentCoherent(currentItem);

  const toggleCommitment = () => {
    void updateItem(currentItem.id, {
      metadata: {
        ...metadata,
        compromisso_operacional: !committed,
      },
    });
  };

  return (
    <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-4 text-sm text-[var(--text-secondary)]">
      <p className="font-semibold text-[var(--text)]">Vinculos contextuais</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge
          label={committed ? 'Compromisso operacional' : 'Sem compromisso operacional'}
          color={committed ? 'var(--teal)' : 'var(--text-secondary)'}
          bgColor={committed ? 'rgba(22, 163, 74, 0.12)' : 'rgba(100, 116, 139, 0.12)'}
        />
        {committed && !coherent ? <Badge label="Coerencia pendente" color="#9A5B00" bgColor="rgba(245, 158, 11, 0.16)" /> : null}
      </div>
      <p className="mt-2">Tags: {tags}</p>
      <p className="mt-1">Goal: {currentItem.goal_id ?? 'Sem vinculo'}</p>
      <p className="mt-1">Projeto: {currentItem.project_id ?? 'Sem vinculo'}</p>
      <p className="mt-1">Horizonte atual: {String(metadata.horizonte ?? 'nao definido')}</p>
      <div className="mt-3">
        <Button variant={committed ? 'ghost' : 'secondary'} onClick={toggleCommitment}>
          {committed ? 'Remover compromisso operacional' : 'Assumir para execucao'}
        </Button>
      </div>
    </div>
  );
}
