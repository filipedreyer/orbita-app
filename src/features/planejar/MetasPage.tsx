import { Flag, FolderKanban, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Card, DirectionLabel, ProgressBar } from '../../components/ui';
import type { Item } from '../../lib/types';
import { useAuthStore, useDataStore } from '../../store';
import { usePlanejarPortfolio } from '../../store/planejar';
import { EntitySheetWrapper } from '../entity/EntitySheetWrapper';
import { PlanningItemEditorPanel, type PlanningEditorValues } from './PlanningItemEditorPanel';

export function MetasPage() {
  const session = useAuthStore((state) => state.session);
  const addItem = useDataStore((state) => state.addItem);
  const updateItem = useDataStore((state) => state.updateItem);
  const portfolio = usePlanejarPortfolio();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [creating, setCreating] = useState(false);

  const cards = useMemo(
    () =>
      portfolio.goals.map((goal) => {
        const metadata = (goal.metadata as Record<string, unknown>) ?? {};
        const linkedProjects = portfolio.projectsByGoal.get(goal.id) ?? [];
        const doneProjects = linkedProjects.filter((project) => project.status === 'done').length;
        const progress = linkedProjects.length > 0 ? (doneProjects / linkedProjects.length) * 100 : 0;
        return {
          goal,
          linkedProjects,
          direction: (metadata.direction as 'up' | 'stable' | 'down') ?? 'up',
          progress,
        };
      }),
    [portfolio.goals, portfolio.projectsByGoal],
  );

  async function handleSave(values: PlanningEditorValues) {
    if (!session?.user) return;

    if (editingItem) {
      await updateItem(editingItem.id, {
        title: values.title,
        description: values.description,
        priority: values.priority,
        metadata: {
          ...(editingItem.metadata as Record<string, unknown>),
          direction: values.direction,
        },
      });
      return;
    }

    await addItem({
      user_id: session.user.id,
      type: 'meta',
      title: values.title,
      description: values.description,
      status: 'active',
      priority: values.priority,
      due_date: null,
      completed_at: null,
      goal_id: null,
      project_id: null,
      tags: [],
      reschedule_count: 0,
      metadata: {
        direction: values.direction,
      },
      image_url: null,
    });
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold">Metas</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Primeiro nível de Planejar: direção, vínculo com projetos e status simples.</p>
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Nova meta
          </Button>
        </div>
      </Card>

      <div className="grid gap-4">
        {cards.map(({ goal, linkedProjects, direction, progress }) => (
          <Card key={goal.id} className="space-y-4 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-[var(--teal)]" />
                  <p className="text-lg font-semibold">{goal.title}</p>
                </div>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{goal.description || 'Sem descrição ainda.'}</p>
              </div>
              <DirectionLabel direction={direction} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                <span>Status</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <ProgressBar value={progress} />
            </div>

            <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <FolderKanban className="h-4 w-4 text-[var(--teal)]" />
                Projetos vinculados
              </div>
              <div className="mt-3 space-y-2">
                {linkedProjects.length > 0 ? (
                  linkedProjects.map((project) => (
                    <div key={project.id} className="rounded-2xl bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">
                      {project.title}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-white px-4 py-3 text-sm text-[var(--text-secondary)]">Nenhum projeto vinculado ainda.</div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setSelectedItem(goal)}>Abrir</Button>
              <Button variant="ghost" onClick={() => setEditingItem(goal)}>Editar</Button>
            </div>
          </Card>
        ))}

        {cards.length === 0 ? <Card className="p-6 text-sm text-[var(--text-secondary)]">Nenhuma meta criada ainda.</Card> : null}
      </div>

      <PlanningItemEditorPanel
        visible={creating || !!editingItem}
        mode="meta"
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
