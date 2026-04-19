import type { PropsWithChildren } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: PropsWithChildren<{ visible: boolean; onClose: () => void; title: string }>) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[var(--overlay)] p-4"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <motion.div
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[var(--radius-3xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sheet)]"
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.99 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-[-0.03em]">{title}</h2>
              <button type="button" onClick={onClose} className="rounded-[var(--radius-pill)] border border-[var(--border)] p-2">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div>{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
