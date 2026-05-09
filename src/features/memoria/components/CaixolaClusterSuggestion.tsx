import { useState } from 'react';
import { Shapes } from 'lucide-react';
import { Button, Card } from '../../../components/ui';
import type { Item } from '../../../lib/types';
import { IAConfirmationSheet } from '../../ia/IAConfirmationSheet';

export function CaixolaClusterSuggestion({
  clusterLabel,
  items,
  onReview,
}: {
  clusterLabel: string;
  items: Item[];
  onReview: () => void;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (items.length < 2) return null;

  return (
    <>
      <Card className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-[var(--radius-2xl)] bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
            <Shapes className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-[var(--text)]">Agrupamento sugerido</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {items.length} itens parecem proximos em {clusterLabel}. Revisar nao altera dados.
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
          Revisar agrupamento
        </Button>
      </Card>

      <IAConfirmationSheet
        visible={confirmOpen}
        title="Revisar agrupamento da Caixola"
        description="A IA pode sugerir proximidade, mas o agrupamento nao sera aplicado automaticamente."
        outputKind="sugestao"
        confirmLabel="Revisar"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onReview();
        }}
      />
    </>
  );
}

