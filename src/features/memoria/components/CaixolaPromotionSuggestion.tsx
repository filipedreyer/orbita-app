import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Button, Card } from '../../../components/ui';
import type { Item } from '../../../lib/types';
import { IAConfirmationSheet } from '../../ia/IAConfirmationSheet';

export function CaixolaPromotionSuggestion({
  item,
  suggestedTarget,
  onReview,
}: {
  item: Item | null;
  suggestedTarget: string;
  onReview: (item: Item) => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!item) return null;

  return (
    <>
      <Card className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-[var(--radius-2xl)] bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
            <ArrowUpRight className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--text)]">Promocao sugerida</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              "{item.title}" talvez mereca virar {suggestedTarget}. A revisao abre o item, sem converter automaticamente.
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
          Revisar promocao
        </Button>
      </Card>

      <IAConfirmationSheet
        visible={confirmOpen}
        title="Revisar promocao da Caixola"
        description="A IA pode sugerir promocao, mas nenhuma entidade sera criada ou convertida automaticamente."
        outputKind="acao_proposta"
        confirmLabel="Abrir para revisar"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onReview(item);
        }}
      />
    </>
  );
}

