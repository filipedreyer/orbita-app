import { Plus, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge, Button, Card } from '../../components/ui';
import type { InegociavelMetadata, Item } from '../../lib/types';
import { useAuthStore, useDataStore } from '../../store';
import { usePlanejarPortfolio } from '../../store/planejar';
import { EntitySheetWrapper } from '../entity/EntitySheetWrapper';
import { PlanningItemEditorPanel, type PlanningEditorValues } from './PlanningItemEditorPanel';

function formatRuleLabel(metadata: InegociavelMetadata) {
  switch (metadata.regra_tipo) {
    case 'bloco_tempo':
      return metadata.horario_inicio && metadata.horario_fim
        ? `Bloco ${metadata.horario_inicio} - ${metadata.horario_fim}`
        : 'Bloco de tempo';
    case 'frequencia':
      return metadata.vezes_por_semana ? `${metadata.vezes_por_semana}x por semana` : 'Frequencia semanal';
    case 'limite':
      return metadata.limite_horas ? `Limite de ${metadata.limite_horas}h` : 'Limite de horas';
    default:
      return 'Regra basica';
  }
}

export function InegociaveisPage() {
  const session = useAuthStore((state) => state.session);
  const addItem = useDataStore((state) => state.addItem);
  const updateItem = useDataStore((state) => state.updateItem);
  const portfolio = usePlanejarPortfolio();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [creating, setCreating] = useState(false);

  const cards = useMemo(
    () =>
      portfolio.inegociaveis.map((item) => {
        const metadata = ((item.metadata as InegociavelMetadata | null) ?? {
          regra_tipo: 'bloco_tempo',
        }) as InegociavelMetadata;

        return {
          item,
          metadata,
          label: formatRuleLabel(metadata),
          hoursPerDay: typeof metadata.horas_por_dia === 'number' ? metadata.horas_por_dia : null,
        };
      }),
    [portfolio.inegociaveis],
  );

  async function handleSave(values: PlanningEditorValues) {
    if (!session?.user) return;

    const metadata: InegociavelMetadata = {
      regra_tipo: values.ruleType,
      horas_por_dia: values.hoursPerDay ? Number(values.hoursPerDay) : undefined,
      horario_inicio: values.startTime || undefined,
      horario_fim: values.endTime || undefined,
    };

    if (editingItem) {
      await updateItem(editingItem.id, {
        title: values.title,
        description: values.description,
        metadata,
      });
      return;
    }

    await addItem({
      user_id: session.user.id,
      type: 'inegociavel',
      title: values.title,
      description: values.description,
      status: 'active',
      priority: null,
      due_date: null,
      completed_at: null,
      goal_id: null,
      project_id: null,
      tags: [],
      reschedule_count: 0,
      metadata,
      image_url: null,
    });
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold">Inegociaveis</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Restricoes estruturais do sistema usando <code>type = &quot;inegociavel&quot;</code> e metadata do modelo atual.
            </p>
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Novo inegociavel
          </Button>
        </div>
      </Card>

      <div className="grid gap-4">
        {cards.map(({ item, metadata, label, hoursPerDay }) => (
          <Card key={item.id} className="space-y-4 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[var(--teal)]" />
                  <p className="text-lg font-semibold">{item.title}</p>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{item.description || 'Sem descricao ainda.'}</p>
              </div>
              <Badge label={label} />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Regra</p>
                <p className="mt-2 text-sm font-semibold capitalize text-[var(--text)]">{metadata.regra_tipo.replace('_', ' ')}</p>
              </div>
              <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Horas / dia</p>
                <p className="mt-2 text-sm font-semibold text-[var(--text)]">{hoursPerDay ? `${hoursPerDay}h` : 'Nao definido'}</p>
              </div>
              <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Janela</p>
                <p className="mt-2 text-sm font-semibold text-[var(--text)]">
                  {metadata.horario_inicio && metadata.horario_fim ? `${metadata.horario_inicio} - ${metadata.horario_fim}` : 'Sem horario fixo'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setSelectedItem(item)}>
                Abrir
              </Button>
              <Button variant="ghost" onClick={() => setEditingItem(item)}>
                Editar
              </Button>
            </div>
          </Card>
        ))}

        {cards.length === 0 ? <Card className="p-6 text-sm text-[var(--text-secondary)]">Nenhum inegociavel criado ainda.</Card> : null}
      </div>

      <PlanningItemEditorPanel
        visible={creating || !!editingItem}
        mode="inegociavel"
        item={editingItem}
        goals={portfolio.goals}
        onClose={() => {
          setCreating(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
      />

      {selectedItem ? (
        <EntitySheetWrapper item={selectedItem} visible={!!selectedItem} onClose={() => setSelectedItem(null)} onEdit={() => setEditingItem(selectedItem)} />
      ) : null}
    </div>
  );
}
