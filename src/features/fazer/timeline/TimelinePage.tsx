import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useHojeDomain, useHojeProjection } from '../../../store/fazer';
import { ChainList } from './ChainList';
import { ImpactAnalysis } from './ImpactAnalysis';
import { IndentedTree } from './IndentedTree';
import { StickyCard } from './StickyCard';

export function TimelinePage() {
  const domain = useHojeDomain();
  const projection = useHojeProjection();
  const [mode, setMode] = useState<'capacity' | 'dependencies'>('capacity');
  const [dependencyView, setDependencyView] = useState<'chains' | 'tree'>('chains');
  const [selectedChainId, setSelectedChainId] = useState<string | null>(domain.dependencyTimeline.chains[0]?.id ?? null);

  useEffect(() => {
    if (!selectedChainId && domain.dependencyTimeline.chains.length > 0) {
      setSelectedChainId(domain.dependencyTimeline.chains[0].id);
    }

    if (selectedChainId && !domain.dependencyTimeline.chains.some((chain) => chain.id === selectedChainId)) {
      setSelectedChainId(domain.dependencyTimeline.chains[0]?.id ?? null);
    }
  }, [domain.dependencyTimeline.chains, selectedChainId]);

  const selectedChain = domain.dependencyTimeline.chains.find((chain) => chain.id === selectedChainId) ?? null;
  const highlightedChainIds = useMemo(
    () => new Set(selectedChain ? selectedChain.items.map((item) => item.id) : []),
    [selectedChain],
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button variant={mode === 'capacity' ? 'primary' : 'secondary'} onClick={() => setMode('capacity')}>
          Capacidade
        </Button>
        <Button variant={mode === 'dependencies' ? 'primary' : 'secondary'} onClick={() => setMode('dependencies')}>
          Dependencias
        </Button>
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
              <p className="text-xs text-[var(--text-tertiary)]">Blocos inegociaveis</p>
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
        <div className="space-y-4">
          <Card className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">Dependencias</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Onda 1 funcional: lista de cadeias e arvore indentada simples sobre a mesma derivacao do dia.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant={dependencyView === 'chains' ? 'primary' : 'secondary'} onClick={() => setDependencyView('chains')}>
                  Cadeias
                </Button>
                <Button variant={dependencyView === 'tree' ? 'primary' : 'secondary'} onClick={() => setDependencyView('tree')}>
                  Arvore
                </Button>
              </div>
            </div>
          </Card>

          {dependencyView === 'chains' ? (
            <ChainList chains={domain.dependencyTimeline.chains} selectedChainId={selectedChainId} onSelect={setSelectedChainId} />
          ) : (
            <IndentedTree tree={domain.dependencyTimeline.tree} highlightedChainIds={highlightedChainIds} />
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <StickyCard />
            <ImpactAnalysis />
          </div>
        </div>
      )}
    </div>
  );
}
