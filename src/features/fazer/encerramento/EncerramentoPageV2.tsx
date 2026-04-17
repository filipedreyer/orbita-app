import { useMemo, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { useAuthStore, useDataStore } from '../../../store';
import { useEncerramentoDomain } from '../../../store/fazer';
import { StepConexoes } from './StepConexoes';
import { StepDiario } from './StepDiario';
import { StepRetrospecto } from './StepRetrospecto';

export function EncerramentoPageV2() {
  const session = useAuthStore((state) => state.session);
  const addItem = useDataStore((state) => state.addItem);
  const domain = useEncerramentoDomain();
  const [stepIndex, setStepIndex] = useState(0);
  const [journal, setJournal] = useState('');
  const [saved, setSaved] = useState(false);

  const positiveLines = useMemo(() => {
    return [
      domain.completedCount > 0 ? `Voce concluiu ${domain.completedCount} itens hoje.` : 'Hoje foi um dia de observacao e ajuste.',
      domain.respectedInegociaveisCount > 0 ? `${domain.respectedInegociaveisCount} inegociaveis permaneceram protegidos.` : 'Ainda ha espaco para proteger melhor seus inegociaveis.',
      'Boa noite. Descanse bem.',
    ];
  }, [domain.completedCount, domain.respectedInegociaveisCount]);

  async function handleFinish() {
    if (!journal.trim() || !session?.user || saved) return;

    await addItem({
      user_id: session.user.id,
      type: 'nota',
      title: `Diario ${domain.referenceDate}`,
      description: journal.trim(),
      status: 'active',
      priority: null,
      due_date: domain.referenceDate,
      completed_at: null,
      goal_id: null,
      project_id: null,
      tags: ['diario'],
      reschedule_count: 0,
      metadata: {
        tags: ['diario'],
        diary_date: domain.referenceDate,
      },
      image_url: null,
    });

    setSaved(true);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Encerramento</p>
        <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em]">Fechar o dia com leveza</h3>
      </div>

      {stepIndex === 0 ? <StepRetrospecto items={domain.completedItems} /> : null}
      {stepIndex === 1 ? <StepDiario value={journal} onChange={setJournal} /> : null}
      {stepIndex === 2 ? <StepConexoes lines={positiveLines} /> : null}

      <div className="flex justify-between gap-3">
        <Button variant="ghost" disabled={stepIndex === 0} onClick={() => setStepIndex((current) => Math.max(0, current - 1))}>
          Voltar
        </Button>
        {stepIndex < 2 ? (
          <Button onClick={() => setStepIndex((current) => Math.min(2, current + 1))}>Avancar</Button>
        ) : (
          <Button onClick={handleFinish}>{saved ? 'Diario salvo' : 'Encerrar o dia'}</Button>
        )}
      </div>
    </div>
  );
}
