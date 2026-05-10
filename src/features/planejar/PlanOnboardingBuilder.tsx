import { Sparkles, Wand2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button, Card, Input, Textarea } from '../../components/ui';
import { useAuthStore, useDataStore } from '../../store';
import { runOnboardingWithAI, type IAOnboardingStepKey } from '../ia/onboarding';
import { usePlanejarPortfolio } from '../../store/planejar';

type BuilderStep = {
  key: IAOnboardingStepKey;
  label: string;
  title: string;
  description: string;
  placeholder: string;
};

type SuggestionDraft = {
  id: string;
  type: 'meta' | 'projeto' | 'habito' | 'essencial_protegido';
  title: string;
  description: string;
  linkedTo?: string;
  useSuggestedLink: boolean;
  ignored: boolean;
  accepted: boolean;
};

const steps: BuilderStep[] = [
  {
    key: 'goals',
    label: 'Metas',
    title: 'Objetivos principais',
    description: 'Descreva em poucas linhas o que voce quer estruturar como direcao.',
    placeholder: 'Ex.: consolidar saude, organizar vida financeira e fechar uma certificacao.',
  },
  {
    key: 'projects',
    label: 'Projetos',
    title: 'Desdobrar em projetos',
    description: 'Liste frentes concretas que deveriam sustentar essas metas.',
    placeholder: 'Ex.: montar rotina de estudo, renegociar dividas, preparar portfolio.',
  },
  {
    key: 'habits',
    label: 'Habitos',
    title: 'Habitos de sustentacao',
    description: 'Traga recorrencias que sustentam o plano sem virar projeto.',
    placeholder: 'Ex.: revisar agenda diariamente, treinar 3x por semana, leitura curta pela manha.',
  },
  {
    key: 'inegociaveis',
    label: 'Essencial',
    title: 'Essencial protegido',
    description: 'Liste protecoes importantes para aplicar como condicao a entidades existentes.',
    placeholder: 'Ex.: bloco sem reunioes de manha, sono minimo, treino como prioridade fixa.',
  },
];

function makeDraftId(step: IAOnboardingStepKey, index: number) {
  return `${step}-${index}-${Date.now()}`;
}

export function PlanOnboardingBuilder() {
  const session = useAuthStore((state) => state.session);
  const addItem = useDataStore((state) => state.addItem);
  const portfolio = usePlanejarPortfolio();
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestFailed, setRequestFailed] = useState(false);
  const [hasRequestedCurrentStep, setHasRequestedCurrentStep] = useState(false);
  const [drafts, setDrafts] = useState<Record<IAOnboardingStepKey, SuggestionDraft[]>>({
    goals: [],
    projects: [],
    habits: [],
    inegociaveis: [],
  });

  const currentStep = steps[stepIndex];

  const existingStructure = useMemo(
    () => ({
      goals: portfolio.goals.map((goal) => ({ id: goal.id, title: goal.title })),
      projects: portfolio.projects.map((project) => ({ id: project.id, title: project.title, goal_id: project.goal_id })),
      habits: portfolio.habits.map((habit) => ({ id: habit.id, title: habit.title })),
      inegociaveis: portfolio.protectedEssentials.map((item) => ({ id: item.id, title: item.title })),
    }),
    [portfolio.goals, portfolio.habits, portfolio.projects, portfolio.protectedEssentials],
  );

  const currentDrafts = drafts[currentStep.key].filter((draft) => !draft.ignored);

  async function handleGenerate() {
    if (!userInput.trim()) return;

    setLoading(true);
    setRequestFailed(false);
    setHasRequestedCurrentStep(true);

    try {
      const result = await runOnboardingWithAI({
        step: currentStep.key,
        userInput: userInput.trim(),
        existingStructure,
      });

      if (!result) {
        setDrafts((current) => ({ ...current, [currentStep.key]: [] }));
        setRequestFailed(true);
        return;
      }

      setDrafts((current) => ({
        ...current,
        [currentStep.key]: result.suggestions.map((suggestion, index) => ({
          id: makeDraftId(currentStep.key, index),
          type: suggestion.type,
          title: suggestion.title,
          description: suggestion.description ?? '',
          linkedTo: suggestion.linkedTo,
          useSuggestedLink: false,
          ignored: false,
          accepted: false,
        })),
      }));
    } finally {
      setLoading(false);
    }
  }

  function updateDraft(draftId: string, updates: Partial<SuggestionDraft>) {
    setDrafts((current) => ({
      ...current,
      [currentStep.key]: current[currentStep.key].map((draft) => (draft.id === draftId ? { ...draft, ...updates } : draft)),
    }));
  }

  async function handleAcceptDraft(draft: SuggestionDraft) {
    if (!session?.user || !draft.title.trim()) return;

    if (draft.type === 'meta') {
      await addItem({
        user_id: session.user.id,
        type: 'meta',
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        status: 'active',
        priority: null,
        due_date: null,
        completed_at: null,
        goal_id: null,
        project_id: null,
        tags: [],
        reschedule_count: 0,
        metadata: {
          direction: 'up',
        },
        image_url: null,
      });
    }

    if (draft.type === 'projeto') {
      await addItem({
        user_id: session.user.id,
        type: 'projeto',
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        status: 'active',
        priority: null,
        due_date: null,
        completed_at: null,
        goal_id: draft.useSuggestedLink ? draft.linkedTo ?? null : null,
        project_id: null,
        tags: [],
        reschedule_count: 0,
        metadata: {},
        image_url: null,
      });
    }

    if (draft.type === 'habito') {
      await addItem({
        user_id: session.user.id,
        type: 'habito',
        title: draft.title.trim(),
        description: draft.description.trim() || null,
        status: 'active',
        priority: null,
        due_date: null,
        completed_at: null,
        goal_id: null,
        project_id: null,
        tags: [],
        reschedule_count: 0,
        metadata: {
          frequency: 'daily',
          streak: 0,
          last_checked: null,
        },
        image_url: null,
      });
    }

    if (draft.type === 'essencial_protegido') {
      updateDraft(draft.id, { accepted: false, ignored: true });
      return;
    }

    updateDraft(draft.id, { accepted: true, ignored: true });
  }

  function handleNextStep() {
    if (stepIndex === steps.length - 1) {
      setOpen(false);
      setStepIndex(0);
      setUserInput('');
      setRequestFailed(false);
      return;
    }

    setStepIndex((current) => current + 1);
    setUserInput('');
    setRequestFailed(false);
    setHasRequestedCurrentStep(false);
  }

  function handlePreviousStep() {
    if (stepIndex === 0) return;
    setStepIndex((current) => current - 1);
    setUserInput('');
    setRequestFailed(false);
    setHasRequestedCurrentStep(false);
  }

  if (!open) {
    return (
      <Card className="space-y-4 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">Estrutura guiada de Planejar</p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Um fluxo simples para transformar entrada curta em metas, projetos, habitos e protecoes essenciais sugeridas.
            </p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Sparkles className="h-4 w-4" />
            Estruturar meu plano
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">Estruturar meu plano</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Etapa {stepIndex + 1} de {steps.length}: {currentStep.label}
          </p>
        </div>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Fechar
        </Button>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        {steps.map((step, index) => (
          <div
            key={step.key}
            className={`rounded-2xl px-4 py-3 text-sm ${
              index === stepIndex
                ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                : index < stepIndex
                  ? 'bg-[var(--surface-alt)] text-[var(--text)]'
                  : 'bg-[var(--surface)] text-[var(--text-secondary)]'
            }`}
          >
            <p className="font-semibold">{step.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3 rounded-[var(--radius-2xl)] bg-[var(--surface-alt)] p-4">
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">{currentStep.title}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{currentStep.description}</p>
        </div>

        <Textarea
          value={userInput}
          onChange={(event) => setUserInput(event.target.value)}
          placeholder={currentStep.placeholder}
          className="min-h-28 bg-[var(--surface)]"
        />

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleGenerate} loading={loading}>
            <Wand2 className="h-4 w-4" />
            Gerar sugestoes
          </Button>
          <Button variant="ghost" onClick={handlePreviousStep} disabled={stepIndex === 0}>
            Voltar
          </Button>
          <Button variant="secondary" onClick={handleNextStep}>
            {stepIndex === steps.length - 1 ? 'Concluir' : 'Seguir sem sugestoes'}
          </Button>
        </div>
      </div>

      {requestFailed || (hasRequestedCurrentStep && currentDrafts.length === 0) ? (
        <Card className="p-4 text-sm text-[var(--text-secondary)]">
          Nenhuma sugestao disponivel agora. Voce pode seguir manualmente para a proxima etapa.
        </Card>
      ) : null}

      {currentDrafts.length > 0 ? (
        <div className="space-y-3">
          {currentDrafts.map((draft) => {
            const linkedGoal = draft.linkedTo ? portfolio.goals.find((goal) => goal.id === draft.linkedTo) ?? null : null;
            return (
              <Card key={draft.id} className="space-y-4 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{draft.type}</p>
                  <Input
                    value={draft.title}
                    onChange={(event) => updateDraft(draft.id, { title: event.target.value })}
                    className="mt-2"
                  />
                </div>

                <Textarea
                  value={draft.description}
                  onChange={(event) => updateDraft(draft.id, { description: event.target.value })}
                  placeholder="Descricao opcional"
                  className="min-h-24 bg-[var(--surface)]"
                />

                {draft.type === 'projeto' && linkedGoal ? (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-4">
                    <p className="text-sm font-semibold text-[var(--text)]">Vinculo sugerido</p>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">{linkedGoal.title}</p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant={draft.useSuggestedLink ? 'primary' : 'ghost'}
                        onClick={() => updateDraft(draft.id, { useSuggestedLink: !draft.useSuggestedLink })}
                      >
                        {draft.useSuggestedLink ? 'Vinculo confirmado' : 'Usar vinculo sugerido'}
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => void handleAcceptDraft(draft)}>Aceitar</Button>
                  <Button variant="ghost" onClick={() => updateDraft(draft.id, { ignored: true })}>
                    Ignorar
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}
    </Card>
  );
}
