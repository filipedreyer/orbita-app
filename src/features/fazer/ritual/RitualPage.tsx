import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { CardRow } from '../../../components/ui/CardRow';
import { useDataStore } from '../../../store';
import { useRitualDomain } from '../../../store/fazer';

const steps = ['boas-vindas', 'pendencias', 'capacidade', 'ordenacao', 'fechamento'] as const;

export function RitualPage() {
  const domain = useRitualDomain();
  const { completeItem, rescheduleItem, setRitualOrder, moveRitualItem } = useDataStore();
  const ritualOrder = useDataStore((state) => state.ritualOrder);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (domain.ritualItems.length > 0 && ritualOrder.length === 0) {
      setRitualOrder(domain.ritualItems.map((item) => item.id));
    }
  }, [domain.ritualItems, ritualOrder.length, setRitualOrder]);

  const orderedItems = useMemo(() => {
    const rank = new Map(ritualOrder.map((id, index) => [id, index]));
    return [...domain.ritualItems].sort((left, right) => (rank.get(left.id) ?? 999) - (rank.get(right.id) ?? 999));
  }, [domain.ritualItems, ritualOrder]);

  const currentStep = steps[stepIndex];

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Ritual do dia</p>
        <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em]">Revisão guiada</h3>
      </div>

      <Card className="space-y-3">
        <p className="text-sm text-[var(--text-secondary)]">Etapa {stepIndex + 1} de {steps.length}</p>

        {currentStep === 'boas-vindas' ? (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold">Bom dia</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              Você tem {domain.pendingItems.length} pendências, {domain.ritualItems.length} itens do dia e {domain.capacity.operationalHours}h de capacidade operacional estimada.
            </p>
          </div>
        ) : null}

        {currentStep === 'pendencias' ? (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold">Pendências</h4>
            {domain.pendingItems.length > 0 ? (
              <div className="space-y-2">
                {domain.pendingItems.map((item) => (
                  <Card key={item.id} className="space-y-3">
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
                        Adiar para amanhã
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">Nenhuma pendência aberta para revisar.</p>
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
                Inegociáveis: <span className="font-semibold text-[var(--text)]">{domain.capacity.inegociavelBlockHours}h</span>
              </div>
              <div className="rounded-2xl bg-[var(--surface-alt)] p-4 text-sm text-[var(--text-secondary)]">
                Operacional: <span className="font-semibold text-[var(--text)]">{domain.capacity.operationalHours}h</span>
              </div>
            </div>
          </div>
        ) : null}

        {currentStep === 'ordenacao' ? (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold">Ordenação básica</h4>
            <Card>
              {orderedItems.map((item, index) => (
                <CardRow key={item.id} isLast={index === orderedItems.length - 1}>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{item.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="icon" variant="ghost" onClick={() => moveRitualItem(item.id, 'up')}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => moveRitualItem(item.id, 'down')}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </CardRow>
              ))}
            </Card>
          </div>
        ) : null}

        {currentStep === 'fechamento' ? (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold">Dia organizado</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              A ordem básica foi aplicada ao domínio desta fase e a lista do dia já está pronta para execução.
            </p>
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4 text-sm text-[var(--text-secondary)]">
              Primeiros itens: {orderedItems.slice(0, 3).map((item) => item.title).join(' · ') || 'Nenhum item definido'}
            </div>
          </div>
        ) : null}

        <div className="flex justify-between gap-3 pt-2">
          <Button variant="ghost" disabled={stepIndex === 0} onClick={() => setStepIndex((current) => Math.max(0, current - 1))}>
            Voltar
          </Button>
          <Button disabled={stepIndex === steps.length - 1} onClick={() => setStepIndex((current) => Math.min(steps.length - 1, current + 1))}>
            Avançar
          </Button>
        </div>
      </Card>
    </div>
  );
}
