import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import type { EntityType } from '../../lib/types';
import { structuredCaptureTypeOptions } from './capture-types';
import { QuickCaptureComposer } from './QuickCaptureComposer';
import { StructuredCaptureForm } from './StructuredCaptureForm';

type CreateFlowState =
  | { view: 'launcher' }
  | { view: 'structured'; type: EntityType };

export function CreateLauncherModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const [flowState, setFlowState] = useState<CreateFlowState>({ view: 'launcher' });

  const title = useMemo(() => {
    if (flowState.view === 'structured') {
      const selected = structuredCaptureTypeOptions.find((option) => option.type === flowState.type);
      return selected?.label ?? 'Criar';
    }

    return 'Criar';
  }, [flowState]);

  function handleClose() {
    setFlowState({ view: 'launcher' });
    onClose();
  }

  function handleBackToLauncher() {
    setFlowState({ view: 'launcher' });
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-50 bg-[var(--bg)]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-10 pt-5">
            <div className="mb-8 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {flowState.view === 'structured' ? (
                  <button type="button" onClick={handleBackToLauncher} className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-card)]" aria-label="Voltar">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                ) : null}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">Criar</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--text)]">{title}</p>
                </div>
              </div>
              <button type="button" onClick={handleClose} className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-card)]" aria-label="Fechar">
                <X className="h-5 w-5" />
              </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {flowState.view === 'launcher' ? (
                <motion.div key="launcher" className="space-y-6" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.16 }}>
                  <QuickCaptureComposer active={visible && flowState.view === 'launcher'} onSaved={handleClose} />

                  <section className="space-y-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Criacao estruturada</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Escolha um tipo quando quiser criar algo já estruturado, sem passar pela inbox.</p>
                    </div>
                    {structuredCaptureTypeOptions.map((option) => (
                      <button
                        key={option.type}
                        type="button"
                        onClick={() => setFlowState({ view: 'structured', type: option.type })}
                        className="flex w-full items-start gap-4 rounded-[var(--radius-3xl)] border border-[var(--border)] bg-[var(--surface)] px-4 py-4 text-left shadow-[var(--shadow-card)] transition hover:border-[var(--accent-border)] hover:bg-[var(--surface-alt)]"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-2xl)] bg-[var(--accent-soft)] text-[var(--accent)]">
                          <option.icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[var(--text)]">{option.label}</p>
                          <p className="mt-1 text-sm text-[var(--text-secondary)]">{option.description}</p>
                        </div>
                      </button>
                    ))}
                  </section>
                </motion.div>
              ) : (
                <motion.div key={flowState.type} className="space-y-4" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.16 }}>
                  <StructuredCaptureForm initialType={flowState.type} onCancel={handleBackToLauncher} onSaved={handleClose} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
