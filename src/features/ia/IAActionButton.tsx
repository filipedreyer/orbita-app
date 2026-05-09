import { AnimatePresence, motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { useActionFeedback } from '../../components/feedback/ActionFeedbackProvider';
import { Button } from '../../components/ui';
import type { IAActionDescriptor } from './types';

export function IAActionButton({
  action,
  completed,
  onRun,
}: {
  action: IAActionDescriptor;
  completed: boolean;
  onRun: (action: IAActionDescriptor) => void;
}) {
  const { showFeedback } = useActionFeedback();

  return (
    <motion.div whileTap={{ scale: 0.98 }} whileHover={{ y: -1 }}>
      <Button
        variant={completed ? 'secondary' : 'primary'}
        onClick={() => {
          onRun(action);
          showFeedback(completed ? `${action.label} ja foi revisado.` : `${action.label} enviado para confirmacao.`);
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={completed ? 'done' : 'idle'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className="inline-flex items-center gap-2"
          >
            {completed ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            {completed ? 'Revisado' : action.label}
          </motion.span>
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}
