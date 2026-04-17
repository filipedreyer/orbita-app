import { HeartPulse, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Card, StreakIndicator } from '../../components/ui';
import type { Item } from '../../lib/types';
import { useAuthStore, useDataStore } from '../../store';
import { usePlanejarPortfolio } from '../../store/planejar';
import { EntitySheetWrapper } from '../entity/EntitySheetWrapper';
import { PlanningItemEditorPanel, type PlanningEditorValues } from './PlanningItemEditorPanel';

export function HabitosPage() {
  const session = useAuthStore((state) => state.session);
  const addItem = useDataStore((state) => state.addItem);
  const updateItem = useDataStore((state) => state.updateItem);
  const checkHabit = useDataStore((state) => state.checkHabit);
  const portfolio = usePlanejarPortfolio();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [creating, setCreating] = useState(false);

  const cards = useMemo(
    () =>
      portfolio.habits.map((habit) => {
        const metadata = (habit.metadata as Record<string, unknown>) ?? {};
        return {
          habit,
          streak: typeof metadata.streak === 'number' ? metadata.streak : 0,
          frequency: typeof metadata.frequency === 'string' ? metadata.frequency : 'daily',
          consistencyLabel:
            typeof metadata.streak === 'number' && metadata.streak >= 7
              ? 'Consistência alta'
              : typeof metadata.streak === 'number' && metadata.streak >= 3
                ? 'Consistência em formação'
                : 'Consistência inicial',
        };
      }),
    [portfolio.habits],
  );

  async function handleSave(values: PlanningEditorValues) {
    if (!session?.user) return;

    if (editingItem) {
      await updateItem(editingItem.id, {
        title: values.title,
        description: values.description,
        metadata: {
          ...(editingItem.metadata as Record<string, unknown>),
          frequency: values.frequency,
        },
      });
      return;
    }

    await addItem({
      user_id: session.user.id,
      type: 'habito',
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
      metadata: {
        frequency: values.frequency,
        streak: 0,
        last_checked: null,
      },
      image_url: null,
    });
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold">Hábitos</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Registro de execução e leitura simples de consistência.</p>
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Novo hábito
          </Button>
        </div>
      </Card>

      <div className="grid gap-4">
        {cards.map(({ habit, streak, frequency, consistencyLabel }) => (
          <Card key={habit.id} className="space-y-4 p-4">
            <div className="flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-[var(--teal)]" />
              <p className="text-lg font-semibold">{habit.title}</p>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{habit.description || 'Sem descrição ainda.'}</p>

            <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-[var(--surface-alt)] p-4">
              <StreakIndicator streak={streak} />
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">{consistencyLabel}</p>
                <p className="text-xs text-[var(--text-secondary)]">Frequência: {frequency}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => void checkHabit(habit.id)}>Registrar hoje</Button>
              <Button variant="ghost" onClick={() => setSelectedItem(habit)}>Abrir</Button>
              <Button variant="ghost" onClick={() => setEditingItem(habit)}>Editar</Button>
            </div>
          </Card>
        ))}

        {cards.length === 0 ? <Card className="p-6 text-sm text-[var(--text-secondary)]">Nenhum hábito criado ainda.</Card> : null}
      </div>

      <PlanningItemEditorPanel
        visible={creating || !!editingItem}
        mode="habito"
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
