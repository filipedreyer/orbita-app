import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../../../components/ui/Button';
import { useActionFeedback } from '../../../components/feedback/ActionFeedbackProvider';
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
  const [lightsOut, setLightsOut] = useState(false);
  const { showFeedback } = useActionFeedback();

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
    setLightsOut(true);
    showFeedback('Diario salvo. O dia foi encerrado.');
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Encerramento</p>
        <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em]">Fechar o dia com leveza</h3>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {stepIndex === 0 ? <StepRetrospecto items={domain.completedItems} /> : null}
          {stepIndex === 1 ? <StepDiario value={journal} onChange={setJournal} /> : null}
          {stepIndex === 2 ? <StepConexoes lines={positiveLines} /> : null}
        </motion.div>
      </AnimatePresence>

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

      <AnimatePresence>
        {lightsOut ? (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.12 }}
              className="rounded-3xl border border-white/10 bg-white/8 px-6 py-5 text-center backdrop-blur"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Encerramento</p>
              <p className="mt-3 text-xl font-semibold text-white">Luzes baixando suavemente</p>
              <p className="mt-2 text-sm text-white/70">Dia salvo. Agora e hora de desligar.</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
