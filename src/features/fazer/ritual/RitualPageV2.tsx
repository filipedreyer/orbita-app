import { useEffect, useMemo, useState } from 'react';
import { DragOverlay, DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion } from 'framer-motion';
import { GripVertical, Lock } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { CardRow } from '../../../components/ui/CardRow';
import type { Item } from '../../../lib/types';
import { useDataStore } from '../../../store';
import { useRitualDomain } from '../../../store/fazer';
import { isRitualLockedItem } from '../domain/ordering';

const steps = ['boas-vindas', 'pendencias', 'capacidade', 'ordenacao', 'fechamento'] as const;

function SortableRitualRow({ item, isLast }: { item: Item; isLast: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.45 : 1,
      }}
    >
      <CardRow isLast={isLast}>
        <div className={`flex-1 transition ${isDragging ? 'translate-x-1' : ''}`}>
          <p className="text-sm font-medium">{item.title}</p>
          <p className="text-xs text-[var(--text-secondary)]">{item.type}</p>
        </div>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl border bg-white text-[var(--text-secondary)] transition ${
            isDragging ? 'border-[var(--teal)] shadow-lg' : 'border-[var(--border)]'
          }`}
          aria-label={`Reordenar ${item.title}`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </CardRow>
    </div>
  );
}

export function RitualPageV2() {
  const domain = useRitualDomain();
  const { completeItem, rescheduleItem, setRitualOrder } = useDataStore();
  const ritualOrder = useDataStore((state) => state.ritualOrder);
  const [stepIndex, setStepIndex] = useState(0);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    const current = ritualOrder.join('|');
    const normalized = domain.normalizedRitualOrder.join('|');

    if (normalized.length > 0 && current !== normalized) {
      setRitualOrder(domain.normalizedRitualOrder);
    }
  }, [domain.normalizedRitualOrder, ritualOrder, setRitualOrder]);

  const orderedItems = useMemo(() => {
    const rank = new Map(ritualOrder.map((id, index) => [id, index]));
    return [...domain.ritualItems].sort((left, right) => (rank.get(left.id) ?? 999) - (rank.get(right.id) ?? 999));
  }, [domain.ritualItems, ritualOrder]);
  const lockedItems = orderedItems.filter((item) => isRitualLockedItem(item));
  const sortableItems = orderedItems.filter((item) => !isRitualLockedItem(item));

  const currentStep = steps[stepIndex];

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveItemId(null);
    if (!over || active.id === over.id) return;

    const oldIndex = ritualOrder.indexOf(String(active.id));
    const newIndex = ritualOrder.indexOf(String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    setRitualOrder(arrayMove(ritualOrder, oldIndex, newIndex));
  }

  const activeItem = sortableItems.find((item) => item.id === activeItemId) ?? null;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Ritual do dia</p>
        <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em]">Revisao guiada</h3>
      </div>

      <Card className="space-y-3">
        <p className="text-sm text-[var(--text-secondary)]">Etapa {stepIndex + 1} de {steps.length}</p>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="space-y-3"
          >
            {currentStep === 'boas-vindas' ? (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold">Bom dia</h4>
                <p className="text-sm text-[var(--text-secondary)]">
                  Voce tem {domain.pendingItems.length} pendencias, {domain.ritualItems.length} itens do dia e {domain.capacity.operationalHours}h de capacidade operacional estimada.
                </p>
              </div>
            ) : null}

            {currentStep === 'pendencias' ? (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold">Pendencias</h4>
                {domain.pendingItems.length > 0 ? (
                  <div className="space-y-2">
                    {domain.pendingItems.map((item) => (
                      <motion.div key={item.id} layout>
                        <Card className="space-y-3">
                          <div>
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-sm text-[var(--text-secondary)]">{item.type}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="secondary" onClick={() => completeItem(item.id)}>Concluir</Button>
                            <Button
                              variant="ghost"
                              onClick={() => {
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                void rescheduleItem(item.id, tomorrow.toISOString().slice(0, 10));
                              }}
                            >
                              Adiar para amanha
                            </Button>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-secondary)]">Nenhuma pendencia aberta para revisar.</p>
                )}
              </div>
            ) : null}

            {currentStep === 'capacidade' ? (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold">Capacidade</h4>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl bg-[var(--surface-alt)] p-4 text-sm text-[var(--text-secondary)]">
                    Total do dia: <span className="font-semibold text-[var(--text)]">{domain.capacity.totalHours}h</span>
                  </div>
                  <div className="rounded-2xl bg-[var(--surface-alt)] p-4 text-sm text-[var(--text-secondary)]">
                    Inegociaveis: <span className="font-semibold text-[var(--text)]">{domain.capacity.inegociavelBlockHours}h</span>
                  </div>
                  <div className="rounded-2xl bg-[var(--surface-alt)] p-4 text-sm text-[var(--text-secondary)]">
                    Operacional: <span className="font-semibold text-[var(--text)]">{domain.capacity.operationalHours}h</span>
                  </div>
                </div>
              </div>
            ) : null}

            {currentStep === 'ordenacao' ? (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold">Ordenacao do dia</h4>
                {lockedItems.length > 0 ? (
                  <Card>
                    {lockedItems.map((item, index) => (
                      <CardRow key={item.id} isLast={index === lockedItems.length - 1}>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-[var(--text-secondary)]">Bloco fixo · {item.type}</p>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-[var(--surface-alt)] px-3 py-2 text-xs font-semibold text-[var(--text-secondary)]">
                          <Lock className="h-3.5 w-3.5" />
                          Fixo
                        </div>
                      </CardRow>
                    ))}
                  </Card>
                ) : null}

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={(event) => setActiveItemId(String(event.active.id))}
                  onDragCancel={() => setActiveItemId(null)}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={ritualOrder} strategy={verticalListSortingStrategy}>
                    <Card className={activeItem ? 'ring-2 ring-[var(--teal)]/20 transition' : 'transition'}>
                      {sortableItems.map((item, index) => (
                        <SortableRitualRow key={item.id} item={item} isLast={index === sortableItems.length - 1} />
                      ))}
                    </Card>
                  </SortableContext>
                  <DragOverlay dropAnimation={{ duration: 180, easing: 'ease-out' }}>
                    {activeItem ? (
                      <motion.div initial={{ scale: 0.98, opacity: 0.92 }} animate={{ scale: 1.02, opacity: 1 }} className="rounded-3xl shadow-2xl">
                        <Card className="min-w-[320px] border-[var(--teal)] bg-white">
                          <div className="flex items-center gap-3">
                            <GripVertical className="h-4 w-4 text-[var(--teal)]" />
                            <div>
                              <p className="text-sm font-medium">{activeItem.title}</p>
                              <p className="text-xs text-[var(--text-secondary)]">{activeItem.type}</p>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>
            ) : null}

            {currentStep === 'fechamento' ? (
              <div className="space-y-3">
                <h4 className="text-lg font-semibold">Dia organizado</h4>
                <p className="text-sm text-[var(--text-secondary)]">
                  A ordem final do Ritual ja foi persistida e a lista do dia em Hoje reflete exatamente essa sequencia.
                </p>
                <div className="rounded-2xl bg-[var(--surface-alt)] p-4 text-sm text-[var(--text-secondary)]">
                  Primeiros itens: {orderedItems.slice(0, 3).map((item) => item.title).join(' · ') || 'Nenhum item definido'}
                </div>
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between gap-3 pt-2">
          <Button variant="ghost" disabled={stepIndex === 0} onClick={() => setStepIndex((current) => Math.max(0, current - 1))}>
            Voltar
          </Button>
          <Button disabled={stepIndex === steps.length - 1} onClick={() => setStepIndex((current) => Math.min(steps.length - 1, current + 1))}>
            Avancar
          </Button>
        </div>
      </Card>
    </div>
  );
}
