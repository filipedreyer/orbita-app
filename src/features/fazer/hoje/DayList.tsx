import type { Item } from '../../../lib/types';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { CardRow } from '../../../components/ui/CardRow';
import { Checkbox } from '../../../components/ui/Checkbox';
import { getProtectedEssentialLabel } from '../domain/canonical';
import { isOperationalCommitmentCoherent } from '../domain/ordering';

export function DayList({
  items,
  onOpen,
  onComplete,
  getExecutionState,
}: {
  items: Item[];
  onOpen: (item: Item) => void;
  onComplete: (item: Item) => void;
  getExecutionState?: (item: Item) => { context: string | null; linked: boolean };
}) {
  if (items.length === 0) {
    return (
      <Card className="space-y-2 p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Lista do dia</p>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">Nenhum item ativo para hoje.</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      {items.map((item, index) => (
        item.type === 'inegociavel' ? (
          <CardRow key={item.id} isLast={index === items.length - 1} onPress={() => onOpen(item)}>
            <div className="inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--accent-soft)] text-[10px] font-bold text-[var(--accent)]">
              F
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-[var(--text)]">{item.title}</p>
                <Badge label={getProtectedEssentialLabel(item) ?? 'Legado'} tone="project" />
                <Badge
                  label={getExecutionState?.(item)?.linked ? 'Direcao visivel' : 'Execucao solta'}
                  tone={getExecutionState?.(item)?.linked ? 'project' : 'attention'}
                />
              </div>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--text-tertiary)]">legado convertido em Essencial protegido</p>
              {getExecutionState?.(item)?.context ? <p className="mt-2 text-xs text-[var(--text-secondary)]">{getExecutionState(item)?.context}</p> : null}
            </div>
          </CardRow>
        ) : (
          <CardRow key={item.id} isLast={index === items.length - 1} onPress={() => onOpen(item)}>
            <Checkbox checked={item.status === 'done'} onToggle={() => onComplete(item)} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-[var(--text)]">{item.title}</p>
                {getProtectedEssentialLabel(item) ? <Badge label="Essencial protegido" tone="project" /> : null}
                {isOperationalCommitmentCoherent(item) ? <Badge label="Assumido" tone="project" /> : null}
                <Badge
                  label={getExecutionState?.(item)?.linked ? 'Direcao visivel' : 'Execucao solta'}
                  tone={getExecutionState?.(item)?.linked ? 'project' : 'attention'}
                />
              </div>
              <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--text-tertiary)]">{item.type}</p>
              {getExecutionState?.(item)?.context ? <p className="mt-2 text-xs text-[var(--text-secondary)]">{getExecutionState(item)?.context}</p> : null}
            </div>
          </CardRow>
        )
      ))}
    </Card>
  );
}
