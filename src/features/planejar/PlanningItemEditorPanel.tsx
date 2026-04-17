import { useEffect, useState } from 'react';
import { BottomSheet, Button, Input } from '../../components/ui';
import type { GoalDirection, Item, PriorityLevel } from '../../lib/types';

type PlanningEditorMode = 'meta' | 'projeto' | 'habito' | 'inegociavel';

export interface PlanningEditorValues {
  title: string;
  description: string;
  priority: PriorityLevel | null;
  goalId: string | null;
  direction: GoalDirection;
  frequency: 'daily' | 'weekly' | 'monthly';
  ruleType: 'bloco_tempo' | 'frequencia' | 'limite';
  hoursPerDay: string;
  startTime: string;
  endTime: string;
}

function buildInitialValues(item: Item | null): PlanningEditorValues {
  const metadata = (item?.metadata as Record<string, unknown>) ?? {};

  return {
    title: item?.title ?? '',
    description: item?.description ?? '',
    priority: item?.priority ?? null,
    goalId: item?.goal_id ?? null,
    direction: (metadata.direction as GoalDirection) ?? 'up',
    frequency: (metadata.frequency as 'daily' | 'weekly' | 'monthly') ?? 'daily',
    ruleType: (metadata.regra_tipo as 'bloco_tempo' | 'frequencia' | 'limite') ?? 'bloco_tempo',
    hoursPerDay: metadata.horas_por_dia ? String(metadata.horas_por_dia) : '',
    startTime: typeof metadata.horario_inicio === 'string' ? metadata.horario_inicio : '',
    endTime: typeof metadata.horario_fim === 'string' ? metadata.horario_fim : '',
  };
}

export function PlanningItemEditorPanel({
  visible,
  mode,
  item,
  goals,
  onClose,
  onSave,
}: {
  visible: boolean;
  mode: PlanningEditorMode;
  item: Item | null;
  goals: Item[];
  onClose: () => void;
  onSave: (values: PlanningEditorValues) => Promise<void> | void;
}) {
  const [values, setValues] = useState<PlanningEditorValues>(buildInitialValues(item));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setValues(buildInitialValues(item));
  }, [visible, item]);

  async function handleSave() {
    if (!values.title.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(values);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <BottomSheet visible={visible} onClose={onClose} title={item ? 'Editar' : 'Criar'}>
      <div className="space-y-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--text)]">Título</span>
          <Input value={values.title} onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))} />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-[var(--text)]">Descrição</span>
          <textarea
            value={values.description}
            onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
            className="min-h-28 w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)]"
          />
        </label>

        {(mode === 'meta' || mode === 'projeto') ? (
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--text)]">Prioridade</span>
            <select
              value={values.priority ?? ''}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  priority: (event.target.value || null) as PriorityLevel | null,
                }))
              }
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)]"
            >
              <option value="">Sem prioridade</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </label>
        ) : null}

        {mode === 'meta' ? (
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--text)]">Direção</span>
            <select
              value={values.direction}
              onChange={(event) => setValues((current) => ({ ...current, direction: event.target.value as GoalDirection }))}
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)]"
            >
              <option value="up">Subir</option>
              <option value="stable">Manter</option>
              <option value="down">Reduzir</option>
            </select>
          </label>
        ) : null}

        {mode === 'projeto' ? (
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--text)]">Meta vinculada</span>
            <select
              value={values.goalId ?? ''}
              onChange={(event) => setValues((current) => ({ ...current, goalId: event.target.value || null }))}
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)]"
            >
              <option value="">Sem meta vinculada</option>
              {goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {mode === 'habito' ? (
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--text)]">Frequência</span>
            <select
              value={values.frequency}
              onChange={(event) => setValues((current) => ({ ...current, frequency: event.target.value as 'daily' | 'weekly' | 'monthly' }))}
              className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)]"
            >
              <option value="daily">Diária</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
            </select>
          </label>
        ) : null}

        {mode === 'inegociavel' ? (
          <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] p-4">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--text)]">Regra</span>
              <select
                value={values.ruleType}
                onChange={(event) => setValues((current) => ({ ...current, ruleType: event.target.value as 'bloco_tempo' | 'frequencia' | 'limite' }))}
                className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--text)]"
              >
                <option value="bloco_tempo">Bloco de tempo</option>
                <option value="frequencia">Frequência</option>
                <option value="limite">Limite</option>
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold text-[var(--text)]">Horas por dia</span>
              <Input value={values.hoursPerDay} onChange={(event) => setValues((current) => ({ ...current, hoursPerDay: event.target.value }))} placeholder="Ex.: 2" />
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[var(--text)]">Início</span>
                <Input value={values.startTime} onChange={(event) => setValues((current) => ({ ...current, startTime: event.target.value }))} placeholder="08:00" />
              </label>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-[var(--text)]">Fim</span>
                <Input value={values.endTime} onChange={(event) => setValues((current) => ({ ...current, endTime: event.target.value }))} placeholder="10:00" />
              </label>
            </div>
          </div>
        ) : null}

        <div className="flex gap-3">
          <Button className="flex-1" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleSave} loading={saving}>
            Salvar
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
