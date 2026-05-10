import type { PropsWithChildren } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { ActionFeedbackContext, type ActionFeedbackContextValue } from './ActionFeedbackContext';

interface FeedbackState {
  id: number;
  message: string;
  undoLabel?: string;
  onUndo?: () => void;
}

export function ActionFeedbackProvider({ children }: PropsWithChildren) {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(null), 3800);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const value = useMemo<ActionFeedbackContextValue>(
    () => ({
      showFeedback: (message, options) => {
        setFeedback({
          id: Date.now(),
          message,
          undoLabel: options?.undoLabel,
          onUndo: options?.onUndo,
        });
      },
    }),
    [],
  );

  return (
    <ActionFeedbackContext.Provider value={value}>
      {children}
      <AnimatePresence>
        {feedback ? (
          <motion.div
            key={feedback.id}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex justify-center px-4"
          >
            <div className="pointer-events-auto flex w-full max-w-xl items-center justify-between gap-3 rounded-3xl border border-[var(--border)] bg-white/95 px-4 py-3 shadow-2xl backdrop-blur">
              <p className="text-sm font-medium text-[var(--text)]">{feedback.message}</p>
              {feedback.onUndo ? (
                <Button
                  variant="ghost"
                  onClick={() => {
                    feedback.onUndo?.();
                    setFeedback(null);
                  }}
                >
                  {feedback.undoLabel ?? 'Desfazer'}
                </Button>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </ActionFeedbackContext.Provider>
  );
}
