import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Badge, Button, Card } from '../../components/ui';
import { applyProtectedEssentialFlag, canReceiveProtectedEssential } from '../../lib/entity-domain';
import type { Item } from '../../lib/types';
import { useDataStore } from '../../store';
import { usePlanejarPortfolio } from '../../store/planejar';
import { EntitySheetWrapper } from '../entity/EntitySheetWrapper';

export function InegociaveisPage() {
  const updateItem = useDataStore((state) => state.updateItem);
  const portfolio = usePlanejarPortfolio();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const candidates = portfolio.protectedEssentialCandidates.filter((item) => canReceiveProtectedEssential(item.type)).slice(0, 6);

  async function protectItem(item: Item) {
    if (!canReceiveProtectedEssential(item.type)) return;

    await updateItem(item.id, {
      metadata: applyProtectedEssentialFlag(item.metadata as Record<string, unknown>, 'Protecao aplicada em Planejar.'),
    });
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-[var(--radius-2xl)] bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Essencial protegido</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Condicao aplicada a metas, projetos, tarefas, habitos e rotinas elegiveis. Nao cria entidade nova e nao torna nada automaticamente urgente.
            </p>
          </div>
        </div>
      </Card>

      <Card className="space-y-4 p-4">
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">Itens protegidos</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Leitura atual das entidades canonicas com flag de protecao.</p>
        </div>
        {portfolio.protectedEssentials.length > 0 ? (
          <div className="grid gap-3">
            {portfolio.protectedEssentials.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--text-tertiary)]">{item.type}</p>
                </div>
                <div className="flex gap-2">
                  <Badge label="Essencial protegido" tone="project" />
                  <Button variant="ghost" onClick={() => setSelectedItem(item)}>Abrir</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">Nenhuma entidade canonica protegida ainda.</p>
        )}
      </Card>

      <Card className="space-y-4 p-4">
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">Aplicar protecao</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Escolha itens existentes. A protecao vira metadata, nao entidade.</p>
        </div>
        {candidates.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {candidates.map((item) => (
              <div key={item.id} className="space-y-3 rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--text-tertiary)]">{item.type}</p>
                </div>
                <Button variant="secondary" onClick={() => void protectItem(item)}>
                  Aplicar Essencial protegido
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">Nao ha candidatos canonicos disponiveis agora.</p>
        )}
      </Card>

      <Card className="space-y-4 border-[var(--warning)]/25 bg-[var(--warning)]/10 p-4">
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">Registros legados</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Dados antigos continuam legiveis ate inventario e migracao segura.</p>
        </div>
        {portfolio.inegociaveis.length > 0 ? (
          <div className="grid gap-3">
            {portfolio.inegociaveis.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-2xl)] border border-[var(--warning)]/25 bg-[var(--surface)] px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">Tipo legado preservado como leitura de Essencial protegido.</p>
                </div>
                <Button variant="ghost" onClick={() => setSelectedItem(item)}>Abrir legado</Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">Nenhum registro legado encontrado.</p>
        )}
      </Card>

      {selectedItem ? (
        <EntitySheetWrapper item={selectedItem} visible={!!selectedItem} onClose={() => setSelectedItem(null)} onEdit={() => setSelectedItem(null)} />
      ) : null}
    </div>
  );
}
