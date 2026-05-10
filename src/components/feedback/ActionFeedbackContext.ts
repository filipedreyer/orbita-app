import { createContext, useContext } from 'react';

export interface ActionFeedbackContextValue {
  showFeedback: (message: string, options?: { undoLabel?: string; onUndo?: () => void }) => void;
}

export const ActionFeedbackContext = createContext<ActionFeedbackContextValue | null>(null);

export function useActionFeedback() {
  const context = useContext(ActionFeedbackContext);
  if (!context) {
    throw new Error('useActionFeedback must be used within ActionFeedbackProvider');
  }
  return context;
}

