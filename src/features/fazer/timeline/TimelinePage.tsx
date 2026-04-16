import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useHojeProjection } from '../../../store/fazer';

export function TimelinePage() {
  const projection = useHojeProjection();
  const [mode, setMode] = useState<'capacity' | 'dependencies'>('capacity');

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={mode === 'capacity' ? 'primary' : 'secondary'} onClick={() => setMode('capacity')}>Capacidade</Button>
        <Button variant={mode === 'dependencies' ? 'primary' : 'secondary'} onClick={() => setMode('dependencies')}>Dependências</Button>
      </div>

      {mode === 'capacity' ? (
        <Card className="space-y-4">
          <h3 className="text-lg font-semibold">Capacidade do dia</h3>
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
              <p className="text-xs text-[var(--text-tertiary)]">Horas totais</p>
              <p className="mt-2 text-2xl font-bold">{projection.timeline.capacity.totalHours}h</p>
            </div>
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
              <p className="text-xs text-[var(--text-tertiary)]">Blocos inegociáveis</p>
              <p className="mt-2 text-2xl font-bold">{projection.timeline.capacity.inegociavelBlockHours}h</p>
            </div>
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
              <p className="text-xs text-[var(--text-tertiary)]">Compromissos fixos</p>
              <p className="mt-2 text-2xl font-bold">{projection.timeline.capacity.fixedCommitmentHours}h</p>
            </div>
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
              <p className="text-xs text-[var(--text-tertiary)]">Capacidade operacional</p>
              <p className="mt-2 text-2xl font-bold">{projection.timeline.capacity.operationalHours}h</p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold">Dependências</h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Estrutura preparada para a onda de dependências. Nesta fase, o modo Dependências ainda é estrutural.
          </p>
        </Card>
      )}
    </div>
  );
}
