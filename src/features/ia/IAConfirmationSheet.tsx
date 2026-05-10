import { AlertTriangle } from 'lucide-react';
import { BottomSheet, Button, Card } from '../../components/ui';
import type { IAOutputKind } from './types';

const kindLabel: Record<IAOutputKind, string> = {
  leitura: 'Leitura',
  sugestao: 'Sugestao',
  relatorio: 'Relatorio',
  acao_proposta: 'Acao proposta',
};

export function IAConfirmationSheet({
  visible,
  title,
  description,
  outputKind = 'acao_proposta',
  confirmLabel = 'Confirmar',
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  description: string;
  outputKind?: IAOutputKind;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <BottomSheet visible={visible} onClose={onCancel} title="Confirmar IA">
      <div className="space-y-4">
        <Card className="space-y-3 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-[var(--radius-2xl)] bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{kindLabel[outputKind]}</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text)]">{title}</p>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>
            </div>
          </div>
        </Card>

        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={() => void onConfirm()}>{confirmLabel}</Button>
        </div>
      </div>
    </BottomSheet>
  );
}

