import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../app/routes';
import type { CanonicalEntityType } from '../../lib/entity-domain';
import { CaptureGrid } from './CaptureGrid';
import { QuickCaptureInput } from './QuickCaptureInput';
import { StructuredCaptureForm } from './StructuredCaptureForm';
import type { CaptureGridAction } from './capture-types';

type CaptureFlowState =
  | { view: 'launcher' }
  | { view: 'structured'; type: CanonicalEntityType; label: string };

export function CaptureSurface({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const [flowState, setFlowState] = useState<CaptureFlowState>({ view: 'launcher' });

  const title = useMemo(() => {
    if (flowState.view === 'structured') {
      return flowState.label;
    }

    return 'Capturar';
  }, [flowState]);

  function handleClose() {
    setFlowState({ view: 'launcher' });
    onClose();
  }

  function handleBackToLauncher() {
    setFlowState({ view: 'launcher' });
  }

  function handleGridSelection(option: CaptureGridAction) {
    if (option.kind === 'inbox') {
      handleClose();
      navigate(routes.memoriaInbox);
      return;
    }

    if (option.kind === 'templates') {
      handleClose();
      navigate(routes.memoriaTemplates);
      return;
    }

    setFlowState({ view: 'structured', type: option.type, label: option.label });
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
          <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] pt-[calc(env(safe-area-inset-top)+1.25rem)]">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {flowState.view === 'structured' ? (
                  <button type="button" onClick={handleBackToLauncher} className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-card)]" aria-label="Voltar">
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                ) : null}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">Olys</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--text)]">{title}</p>
                </div>
              </div>
              <button type="button" onClick={handleClose} className="rounded-[var(--radius-pill)] border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[var(--shadow-card)]" aria-label="Fechar Capturar">
                <X className="h-5 w-5" />
              </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {flowState.view === 'launcher' ? (
                <motion.div key="launcher" className="space-y-6" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.16 }}>
                  <QuickCaptureInput active={visible && flowState.view === 'launcher'} onSaved={handleClose} />
                  <CaptureGrid onSelect={handleGridSelection} />
                </motion.div>
              ) : (
                <motion.div key={`${flowState.type}:${flowState.label}`} className="space-y-4" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.16 }}>
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
