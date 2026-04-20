import { Badge, Card } from '../../components/ui';
import type { IAOnboardingStep } from './types';

export function IAOnboarding({
  steps,
}: {
  steps: IAOnboardingStep[];
}) {
  if (steps.length === 0) return null;

  return (
    <Card className="space-y-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">Onboarding guiado de Planejar</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">Fluxo visual mockado para orientar o portfolio antes de qualquer IA real.</p>
        </div>
      <Badge label="IA mock" tone="project" />
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-3 rounded-2xl bg-[var(--surface-alt)] px-4 py-3">
            <div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${step.done ? 'bg-[var(--teal)] text-white' : 'bg-white text-[var(--text-secondary)]'}`}>
              {index + 1}
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">{step.title}</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
