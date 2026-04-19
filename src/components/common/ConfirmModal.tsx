import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';

interface ConfirmAction {
  label: string;
  onPress: () => void;
  variant: 'primary' | 'danger' | 'cancel';
}

interface ConfirmConfig {
  title: string;
  message: string;
  actions: ConfirmAction[];
}

export function useConfirm() {
  const [config, setConfig] = useState<ConfirmConfig | null>(null);

  function confirm(next: ConfirmConfig) {
    setConfig(next);
  }

  function close() {
    setConfig(null);
  }

  const ConfirmElement = config ? (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[var(--overlay)] p-4" onClick={close}>
      <div
        className="w-full max-w-md rounded-[var(--radius-3xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sheet)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-[var(--radius-2xl)] bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{config.title}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{config.message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {config.actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant === 'cancel' ? 'ghost' : action.variant === 'danger' ? 'destructive' : 'primary'}
              className="flex-1"
              onClick={() => {
                action.onPress();
                close();
              }}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  ) : null;

  return { confirm, ConfirmElement };
}
