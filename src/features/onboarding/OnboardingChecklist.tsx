import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useOnboarding } from './OnboardingProvider';

type OnboardingArea = 'fazer' | 'memoria' | 'planejar';

interface OnboardingStep {
  title: string;
  description: string;
}

export function OnboardingChecklist({
  area,
  title,
  description,
  primaryLabel,
  onPrimaryAction,
  steps,
}: {
  area: OnboardingArea;
  title: string;
  description: string;
  primaryLabel: string;
  onPrimaryAction: () => void;
  steps: OnboardingStep[];
}) {
  const { isPending, dismissArea } = useOnboarding();

  if (!isPending(area)) return null;

  return (
    <Card className="space-y-4 border-[var(--teal-mid)] bg-[var(--teal-light)] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--teal)]">Onboarding</p>
          <h3 className="mt-2 text-lg font-semibold text-[var(--text)]">{title}</h3>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>
        </div>
        <Button variant="ghost" onClick={() => dismissArea(area)}>
          Pular por enquanto
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.title} className="rounded-2xl bg-white px-4 py-3">
            <div className="flex items-center gap-2 text-[var(--teal)]">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-sm font-semibold text-[var(--text)]">{step.title}</p>
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => {
            onPrimaryAction();
            dismissArea(area);
          }}
        >
          {primaryLabel}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}
