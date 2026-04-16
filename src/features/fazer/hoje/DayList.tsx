import type { Item } from '../../../lib/types';
import { Card } from '../../../components/ui/Card';
import { CardRow } from '../../../components/ui/CardRow';
import { Checkbox } from '../../../components/ui/Checkbox';

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
            <p className="text-sm font-medium text-[var(--text)]">{item.title}</p>
            <p className="text-xs text-[var(--text-secondary)]">{item.type}</p>
          </div>
        </CardRow>
      ))}
    </Card>
  );
}
