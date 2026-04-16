import type { Item } from '../../../lib/types';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { CardRow } from '../../../components/ui/CardRow';
import { Checkbox } from '../../../components/ui/Checkbox';
import { isOperationalCommitmentCoherent } from '../domain/ordering';

export function DayList({
  items,
  onOpen,
  onComplete,
}: {
  items: Item[];
  onOpen: (item: Item) => void;
  onComplete: (item: Item) => void;
}) {
  if (items.length === 0) {
    return (
      <Card>
        <p className="text-sm text-[var(--text-secondary)]">Nenhum item ativo para hoje.</p>
      </Card>
    );
  }

  return (
    <Card>
      {items.map((item, index) => (
        <CardRow key={item.id} isLast={index === items.length - 1} onPress={() => onOpen(item)}>
          <Checkbox checked={item.status === 'done'} onToggle={() => onComplete(item)} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-[var(--text)]">{item.title}</p>
              {isOperationalCommitmentCoherent(item) ? <Badge label="Assumido" color="var(--teal)" bgColor="rgba(22, 163, 74, 0.12)" /> : null}
            </div>
            <p className="text-xs text-[var(--text-secondary)]">{item.type}</p>
          </div>
        </CardRow>
      ))}
    </Card>
  );
}
