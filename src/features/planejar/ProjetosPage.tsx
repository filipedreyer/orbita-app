import { FolderKanban, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Card, ProgressBar } from '../../components/ui';
import type { Item } from '../../lib/types';
import { useAuthStore, useDataStore } from '../../store';
import { usePlanejarPortfolio } from '../../store/planejar';
import { EntitySheetWrapper } from '../entity/EntitySheetWrapper';
import { PlanningItemEditorPanel, type PlanningEditorValues } from './PlanningItemEditorPanel';

export function ProjetosPage() {
  const session = useAuthStore((state) => state.session);
  const addItem = useDataStore((state) => state.addItem);
  const updateItem = useDataStore((state) => state.updateItem);
  const portfolio = usePlanejarPortfolio();
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [creating, setCreating] = useState(false);

  const cards = useMemo(
    () =>
      portfolio.projects.map((project) => {
        const linkedGoal = portfolio.goals.find((goal) => goal.id === project.goal_id) ?? null;
        const tasks = portfolio.tasksByProject.get(project.id) ?? [];
        const doneTasks = tasks.filter((task) => task.status === 'done').length;
        const progress = tasks.length > 0 ? (doneTasks / tasks.length) * 100 : 0;
        return {
          project,
          linkedGoal,
          tasks,
          progress,
        };
      }),
    [portfolio.goals, portfolio.projects, portfolio.tasksByProject],
  );

  async function handleSave(values: PlanningEditorValues) {
    if (!session?.user) return;

    if (editingItem) {
      await updateItem(editingItem.id, {
        title: values.title,
        description: values.description,
        priority: values.priority,
        goal_id: values.goalId,
      });
      return;
    }

    await addItem({
      user_id: session.user.id,
      type: 'projeto',
      title: values.title,
      description: values.description,
      status: 'active',
      priority: values.priority,
      due_date: null,
      completed_at: null,
      goal_id: values.goalId,
      project_id: null,
      tags: [],
      reschedule_count: 0,
      metadata: {},
      image_url: null,
    });
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold">Projetos</h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Projetos com vínculo simples a metas e progresso mínimo por tarefas associadas.</p>
          </div>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4" />
            Novo projeto
          </Button>
        </div>
      </Card>

      <div className="grid gap-4">
        {cards.map(({ project, linkedGoal, tasks, progress }) => (
          <Card key={project.id} className="space-y-4 p-4">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-[var(--teal)]" />
              <p className="text-lg font-semibold">{project.title}</p>
            </div>
            <p className="text-sm text-[var(--text-secondary)]">{project.description || 'Sem descrição ainda.'}</p>
            <p className="text-sm text-[var(--text-secondary)]">
              Meta vinculada: <span className="font-semibold text-[var(--text)]">{linkedGoal?.title ?? 'Sem meta vinculada'}</span>
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-[var(--text-secondary)]">
                <span>Progresso mínimo</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <ProgressBar value={progress} />
              <p className="text-xs text-[var(--text-tertiary)]">{tasks.length} tarefas associadas</p>
            </div>

            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setSelectedItem(project)}>Abrir</Button>
              <Button variant="ghost" onClick={() => setEditingItem(project)}>Editar</Button>
            </div>
          </Card>
        ))}

        {cards.length === 0 ? <Card className="p-6 text-sm text-[var(--text-secondary)]">Nenhum projeto criado ainda.</Card> : null}
      </div>

      <PlanningItemEditorPanel
        visible={creating || !!editingItem}
        mode="projeto"
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
