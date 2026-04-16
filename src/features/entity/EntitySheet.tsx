/**
 * EntitySheet
 *
 * Portado a partir de `EntityView.tsx` do projeto original como equivalente funcional.
 * O núcleo foi preservado sem alteração de lógica interna; esta adaptação troca apenas
 * primitives, imports e encaixe estrutural para o ambiente web atual.
 */
import { useEffect, useState } from 'react';
import { BottomSheet, Card, CardRow, Checkbox, ProgressBar, PriorityBadge, SectionHeader, Button, PillSelector, StreakIndicator, DirectionLabel } from '../../components/ui';
import { useConfirm } from '../../components/common/ConfirmModal';
import { ImageThumbnail } from '../../components/common/ImageViewer';
import { getGoalProgress } from '../entities/computations';
import { formatDate, isPast, today } from '../../lib/dates';
import type { EntityType, Item } from '../../lib/types';
import { frequencyLabels, typeLabels } from '../../lib/types';
import { useDataStore } from '../../store';

interface Props {
  item: Item;
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function EntitySheet({ item, visible, onClose, onEdit }: Props) {
  const {
    items, subItems, loadSubItems,
    completeItem, archiveItem, deleteItem, cancelItem,
    duplicateItem, promoteItem, rescheduleItem,
    checkHabit, toggleSubItem,
  } = useDataStore();
  const { confirm, ConfirmElement } = useConfirm();
  const [showPromote, setShowPromote] = useState(false);
  const [promoteType, setPromoteType] = useState<string | null>(null);

  const subs = subItems[item.id] || [];
  const td = today();

  useEffect(() => {
    if (visible && item.id) {
      void loadSubItems(item.id);
    }
  }, [visible, item.id, loadSubItems]);

  const goal = item.goal_id ? items.find((entry) => entry.id === item.goal_id) : null;
  const project = item.project_id ? items.find((entry) => entry.id === item.project_id) : null;
  const linkedTasks = items.filter((entry) => (entry.goal_id === item.id || entry.project_id === item.id) && entry.type === 'tarefa');
  const linkedHabits = items.filter((entry) => entry.goal_id === item.id && entry.type === 'habito');
  const meta = item.metadata as Record<string, unknown>;
  const isGoal = item.type === 'meta';
  const isHabit = item.type === 'habito';
  const isRoutine = item.type === 'rotina';
  const isList = item.type === 'lista';
  const isEvent = item.type === 'evento';
  const canComplete = ['tarefa', 'projeto', 'meta', 'evento', 'lembrete'].includes(item.type);
  const goalProg = isGoal ? getGoalProgress(items, item.id) : null;

  const handleComplete = () => {
    confirm({
      title: 'Concluir',
      message: `Marcar "${item.title}" como concluído?`,
      actions: [
        { label: 'Concluir', onPress: () => { void completeItem(item.id); onClose(); }, variant: 'primary' },
        { label: 'Cancelar', onPress: () => {}, variant: 'cancel' },
      ],
    });
  };

  const handleArchive = () => {
    confirm({
      title: 'Arquivar',
      message: 'Mover para o arquivo?',
      actions: [
        { label: 'Arquivar', onPress: () => { void archiveItem(item.id); onClose(); }, variant: 'primary' },
        { label: 'Cancelar', onPress: () => {}, variant: 'cancel' },
      ],
    });
  };

  const handleDelete = () => {
    confirm({
      title: 'Excluir permanentemente',
      message: 'Essa ação não pode ser desfeita.',
      actions: [
        { label: 'Excluir', onPress: () => { void deleteItem(item.id); onClose(); }, variant: 'danger' },
        { label: 'Cancelar', onPress: () => {}, variant: 'cancel' },
      ],
    });
  };

  const handleDuplicate = () => {
    void duplicateItem(item.id);
    onClose();
  };

  const handleCancel = () => {
    void cancelItem(item.id);
    onClose();
  };

  const handleCheckHabit = () => {
    void checkHabit(item.id);
    onClose();
  };

  const handlePromote = () => {
    if (promoteType && promoteType !== item.type) {
      void promoteItem(item.id, promoteType as EntityType);
      setShowPromote(false);
      onClose();
    }
  };

  return (
    <>
      <BottomSheet visible={visible} onClose={onClose} title={typeLabels[item.type]}>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-2 h-2 w-2 rounded-full bg-[var(--teal)]" />
            <div className="flex-1">
              <h3 className="text-2xl font-bold tracking-[-0.03em]">{item.title}</h3>
              {item.priority ? <div className="mt-2"><PriorityBadge priority={item.priority} /></div> : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-[var(--text-secondary)]">
            {item.due_date ? <span className={isPast(item.due_date) ? 'font-semibold text-[var(--red)]' : ''}>{isPast(item.due_date) ? 'Atrasado · ' : ''}{formatDate(item.due_date)}</span> : null}
            {goal ? <span className="text-[var(--teal)]">{goal.title}</span> : null}
            {project ? <span>{project.title}</span> : null}
            {isEvent && meta.time ? <span>{String(meta.time)}</span> : null}
            {isEvent && meta.location ? <span>{String(meta.location)}</span> : null}
            {(isHabit || isRoutine) && meta.frequency ? <span>{frequencyLabels[meta.frequency as keyof typeof frequencyLabels]}</span> : null}
            {item.reschedule_count > 0 ? <span>Reprogramado {item.reschedule_count}x</span> : null}
          </div>

          {item.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2 text-sm font-medium text-[var(--teal)]">
              {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          ) : null}

          {isGoal && goalProg ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <DirectionLabel direction={goalProg.direction} />
                <span className="text-sm font-semibold text-[var(--teal)]">{goalProg.percentage}%</span>
              </div>
              <ProgressBar value={goalProg.percentage} />
              <div className="flex flex-wrap gap-4 text-sm text-[var(--text-secondary)]">
                <span>{goalProg.tasksDone}/{goalProg.tasksTotal} tarefas</span>
                {goalProg.habitsCount > 0 ? <span>{goalProg.habitsCount} hábitos · streak médio {goalProg.avgStreak}d</span> : null}
              </div>
            </div>
          ) : null}

          {isHabit ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-[color:var(--green)]/10">
                  <span className="text-2xl font-bold text-[var(--green)]">{Number(meta.streak) || 0}</span>
                  <span className="text-[10px] font-medium text-[var(--green)]">dias</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Streak atual</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {meta.last_checked === td ? 'Já feito hoje' : 'Ainda não marcado hoje'}
                  </p>
                </div>
              </div>
              {meta.last_checked !== td ? (
                <Button className="mt-4 w-full" onClick={handleCheckHabit}>Marcar hoje</Button>
              ) : null}
            </div>
          ) : null}

          {item.description ? <p className="text-sm leading-6 text-[var(--text)]">{item.description}</p> : null}

          {item.image_url ? <ImageThumbnail uri={item.image_url} size={100} /> : null}

          {subs.length > 0 ? (
            <>
              <SectionHeader label={isList ? 'Itens' : isRoutine ? 'Exercícios' : 'Sub-itens'} count={subs.filter((subItem) => subItem.done).length} />
              {(isList || isRoutine) ? <ProgressBar value={subs.length > 0 ? (subs.filter((subItem) => subItem.done).length / subs.length) * 100 : 0} /> : null}
              <Card>
                {subs.map((subItem, index) => (
                  <CardRow key={subItem.id} isLast={index === subs.length - 1} onPress={() => void toggleSubItem(subItem.id, !subItem.done)}>
                    <Checkbox checked={subItem.done} onToggle={() => void toggleSubItem(subItem.id, !subItem.done)} accentColor={isRoutine ? 'var(--teal)' : 'var(--green)'} />
                    <span className={`flex-1 text-sm ${subItem.done ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text)]'}`}>{subItem.text}</span>
                  </CardRow>
                ))}
              </Card>
            </>
          ) : null}

          {(isGoal || item.type === 'projeto') && linkedTasks.length > 0 ? (
            <>
              <SectionHeader label="Tarefas vinculadas" count={linkedTasks.filter((task) => task.status === 'done').length} />
              <Card>
                {linkedTasks.map((task, index) => (
                  <CardRow key={task.id} isLast={index === linkedTasks.length - 1}>
                    <Checkbox checked={task.status === 'done'} onToggle={() => task.status === 'active' ? void completeItem(task.id) : undefined} />
                    <span className={`flex-1 text-sm ${task.status === 'done' ? 'text-[var(--text-tertiary)] line-through' : 'text-[var(--text)]'}`}>{task.title}</span>
                  </CardRow>
                ))}
              </Card>
            </>
          ) : null}

          {isGoal && linkedHabits.length > 0 ? (
            <>
              <SectionHeader label="Hábitos vinculados" />
              <Card>
                {linkedHabits.map((habit, index) => (
                  <CardRow key={habit.id} isLast={index === linkedHabits.length - 1}>
                    <Checkbox checked={(habit.metadata as Record<string, unknown>)?.last_checked === td} onToggle={() => {}} circle accentColor="var(--green)" />
                    <span className="flex-1 text-sm">{habit.title}</span>
                    <StreakIndicator streak={Number((habit.metadata as Record<string, unknown>)?.streak) || 0} />
                  </CardRow>
                ))}
              </Card>
            </>
          ) : null}

          <div className="space-y-2 pt-2">
            <div className="flex gap-2">
              {canComplete ? <Button className="flex-1" onClick={handleComplete}>Concluir</Button> : null}
              <Button className="flex-1" variant="secondary" onClick={onEdit}>Editar</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="flex-1" variant="ghost" onClick={handleDuplicate}>Duplicar</Button>
              <Button className="flex-1" variant="ghost" onClick={() => setShowPromote(true)}>Promover</Button>
              {item.due_date ? (
                <Button
                  className="flex-1"
                  variant="ghost"
                  onClick={() => {
                    const nextDate = new Date();
                    nextDate.setDate(nextDate.getDate() + 1);
                    void rescheduleItem(item.id, nextDate.toISOString().split('T')[0]);
                    onClose();
                  }}
                >
                  Adiar
                </Button>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="flex-1" variant="secondary" onClick={handleCancel}>Cancelar</Button>
              <Button className="flex-1" variant="secondary" onClick={handleArchive}>Arquivar</Button>
              <Button className="flex-1" variant="ghost" onClick={handleDelete}>Excluir</Button>
            </div>
          </div>

          {showPromote ? (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-4">
              <p className="mb-3 text-sm font-semibold">Promover para:</p>
              <PillSelector
                options={(['tarefa', 'projeto', 'meta', 'habito', 'rotina', 'evento', 'nota', 'ideia', 'lembrete', 'lista'] as const)
                  .filter((type) => type !== item.type)
                  .map((type) => ({ key: type, label: typeLabels[type] }))}
                selected={promoteType}
                onSelect={setPromoteType}
              />
              <div className="mt-3 flex gap-2">
                <Button className="flex-1" variant="secondary" onClick={() => setShowPromote(false)}>Cancelar</Button>
                <Button className="flex-1" onClick={handlePromote}>Promover</Button>
              </div>
            </div>
          ) : null}
        </div>
      </BottomSheet>

      {ConfirmElement}
    </>
  );
}
