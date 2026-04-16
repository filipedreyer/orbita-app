import { useMemo, useState } from 'react';
import { Moon, Sparkles } from 'lucide-react';
import { PlaceholderScreen } from '../../components/layout/PlaceholderScreen';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { CaptureModal } from '../capture/CaptureModal';
import { EntitySheetWrapper } from '../entity/EntitySheetWrapper';
import { useDataStore } from '../../store';

export function FazerHomePage() {
  const items = useDataStore((state) => state.items);
  const loading = useDataStore((state) => state.loading);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const firstItem = useMemo(() => items[0] ?? null, [items]);

  return (
    <div className="space-y-4">
      <PlaceholderScreen
        eyebrow="Fazer"
        title="Cockpit diário"
        description="Base pronta para Hoje, Timeline, Ritual e Encerramento. Nesta fase o foco é estrutural: rotas, layout, estado e componentes compartilhados."
        actions={[
          { label: 'Ritual', icon: Sparkles },
          { label: 'Encerrar dia', icon: Moon, variant: 'secondary' },
        ]}
      />

      <Card>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Standalone da Fase 2</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Esta área valida a abertura do modal de captura e do sheet preservado sem depender das telas finais.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setCaptureOpen(true)}>Abrir captura</Button>
            <Button variant="secondary" disabled={!firstItem || loading} onClick={() => setSheetOpen(true)}>
              {firstItem ? 'Abrir primeiro item no sheet' : 'Sem item para sheet'}
            </Button>
          </div>
          {!firstItem ? <p className="text-sm text-[var(--text-tertiary)]">Crie um item pela captura para testar o `EntitySheetWrapper`.</p> : null}
        </div>
      </Card>

      <CaptureModal visible={captureOpen} onClose={() => setCaptureOpen(false)} />
      {firstItem ? (
        <EntitySheetWrapper item={firstItem} visible={sheetOpen} onClose={() => setSheetOpen(false)} onEdit={() => setSheetOpen(false)} />
      ) : null}
    </div>
  );
}
