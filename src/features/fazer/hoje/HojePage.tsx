import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useActionFeedback } from '../../../components/feedback/ActionFeedbackProvider';
import { Button } from '../../../components/ui/Button';
import { CaptureModal } from '../../capture/CaptureModal';
import { EntitySheetWrapper } from '../../entity/EntitySheetWrapper';
import { IAActionButton } from '../../ia/IAActionButton';
import { IASuggestion } from '../../ia/IASuggestion';
import { useIA } from '../../ia/useIA';
import { today } from '../../../lib/dates';
import type { Item } from '../../../lib/types';
import { useDataStore } from '../../../store';
import { useHojeProjection } from '../../../store/fazer';
import { CompletedSection } from './CompletedSection';
import { DayHeader } from './DayHeader';
import { DayList } from './DayList';
import { InegociavelCapacityBlock } from './InegociavelCapacityBlock';
import { ReminderBanner } from './ReminderBanner';

export function HojePage() {
  const projection = useHojeProjection();
  const completeItem = useDataStore((state) => state.completeItem);
  const checkHabit = useDataStore((state) => state.checkHabit);
  const updateItem = useDataStore((state) => state.updateItem);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const { routeContext, completedActions, triggerAction } = useIA();
  const { showFeedback } = useActionFeedback();

  async function handleComplete(item: Item) {
    if (item.type === 'habito' || item.type === 'rotina') {
      await checkHabit(item.id);
      showFeedback(`${item.title} registrado no dia.`);
      return;
    }

    await completeItem(item.id);
    showFeedback(`${item.title} concluido.`, {
      undoLabel: 'Desfazer',
      onUndo: () => {
        void updateItem(item.id, { status: 'active', completed_at: null });
      },
    });
  }

  return (
    <div className="space-y-4">
      <DayHeader {...projection.header} />
      <ReminderBanner reminders={projection.sections.reminders} />
      {routeContext.area === 'fazer' && routeContext.suggestions[0] ? (
        <IASuggestion suggestion={routeContext.suggestions[0]} completedActions={completedActions} onRunAction={triggerAction} />
      ) : null}
      <InegociavelCapacityBlock items={projection.sections.inegociaveis} />

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Lista do dia</h3>
        <div className="flex gap-2">
          {routeContext.area === 'fazer' && routeContext.suggestions[0]?.actions[0] ? (
            <IAActionButton action={routeContext.suggestions[0].actions[0]} completed={!!completedActions[routeContext.suggestions[0].actions[0].id]} onRun={triggerAction} />
          ) : null}
          <Button onClick={() => setCaptureOpen(true)}>
            <Plus className="h-4 w-4" />
            Capturar
          </Button>
        </div>
      </div>

      <DayList items={projection.sections.focusItems} onOpen={setSelectedItem} onComplete={handleComplete} />
      <CompletedSection items={projection.sections.completed} />

      <CaptureModal visible={captureOpen} onClose={() => setCaptureOpen(false)} initialType="tarefa" />
      {selectedItem ? (
        <EntitySheetWrapper
          item={selectedItem}
          visible={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={() => setSelectedItem(null)}
        />
      ) : null}

      <p className="text-xs text-[var(--text-tertiary)]">Referencia do dominio canonico: {today()}</p>
    </div>
  );
}
