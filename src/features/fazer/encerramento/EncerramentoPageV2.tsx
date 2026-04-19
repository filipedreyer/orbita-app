import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Clock3, MoonStar, Sparkles, TriangleAlert } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { readEncerramentoWithAI, type EncerramentoReadPayload } from '../../ia/encerramento';
import type { Item } from '../../../lib/types';
import { useDataStore } from '../../../store';
import { useEncerramentoDomain, useHojeDomain, useHojeProjection } from '../../../store/fazer';

const LONG_INACTIVITY_DAYS = 14;

function isOlderThanDays(timestamp: string, days: number) {
  const ageMs = Date.now() - new Date(timestamp).getTime();
  return ageMs > days * 24 * 60 * 60 * 1000;
}

function renderSimpleList(items: Item[], emptyLabel: string) {
  if (items.length === 0) {
    return <p className="text-sm text-[var(--text-secondary)]">{emptyLabel}</p>;
  }

  return (
    <div className="space-y-2">
      {items.slice(0, 4).map((item) => (
        <div key={item.id} className="rounded-[var(--radius-2xl)] bg-[var(--surface-alt)] px-4 py-3">
          <p className="text-sm font-medium text-[var(--text)]">{item.title}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--text-tertiary)]">{item.type}</p>
        </div>
      ))}
      {items.length > 4 ? <p className="text-xs text-[var(--text-tertiary)]">+ {items.length - 4} itens adicionais</p> : null}
    </div>
  );
}

export function EncerramentoPageV2() {
  const domain = useEncerramentoDomain();
  const hojeDomain = useHojeDomain();
  const projection = useHojeProjection();
  const items = useDataStore((state) => state.items);
  const [lightsOut, setLightsOut] = useState(false);
  const [closingReading, setClosingReading] = useState<string | null>(null);

  const unfinishedItems = useMemo(
    () => projection.sections.focusItems.filter((item) => item.status === 'active' || item.status === 'paused'),
    [projection.sections.focusItems],
  );

  const postponedItems = useMemo(
    () =>
      items.filter((item) => {
        if (item.status === 'done' || item.status === 'archived') return false;
        const metadata = (item.metadata || {}) as Record<string, unknown>;
        return metadata.inbox_postponed === true || metadata.inbox_needs_revisit === true;
      }),
    [items],
  );

  const reconsiderItems = useMemo(() => {
    const riskyInactive = items.filter((item) => {
      if (item.status !== 'active' && item.status !== 'paused') return false;
      if (item.due_date) return false;
      const metadata = (item.metadata || {}) as Record<string, unknown>;
      if (metadata.inbox_needs_revisit === true) return false;
      return isOlderThanDays(item.updated_at || item.created_at, LONG_INACTIVITY_DAYS);
    });

    return [...postponedItems, ...riskyInactive].filter(
      (item, index, collection) => collection.findIndex((entry) => entry.id === item.id) === index,
    );
  }, [items, postponedItems]);

  const attentionItems = useMemo(
    () => [...hojeDomain.overdueItems, ...reconsiderItems].filter((item, index, collection) => collection.findIndex((entry) => entry.id === item.id) === index),
    [hojeDomain.overdueItems, reconsiderItems],
  );

  const revisitCount = useMemo(
    () =>
      postponedItems.filter((item) => {
        const metadata = (item.metadata || {}) as Record<string, unknown>;
        return metadata.inbox_needs_revisit === true;
      }).length,
    [postponedItems],
  );

  const encerramentoPayload = useMemo<EncerramentoReadPayload>(
    () => ({
      execution: {
        completedCount: domain.completedCount,
        openCount: unfinishedItems.length,
        respectedInegociaveisCount: domain.respectedInegociaveisCount,
      },
      carryover: {
        unfinishedCount: unfinishedItems.length,
        reconsiderCount: reconsiderItems.length,
      },
      attention: {
        overdueCount: hojeDomain.overdueItems.length,
        revisitCount,
      },
    }),
    [
      domain.completedCount,
      domain.respectedInegociaveisCount,
      hojeDomain.overdueItems.length,
      reconsiderItems.length,
      revisitCount,
      unfinishedItems.length,
    ],
  );

  useEffect(() => {
    let cancelled = false;
    setClosingReading(null);

    async function loadClosingReading() {
      const reading = await readEncerramentoWithAI(encerramentoPayload);
      if (!cancelled && reading) {
        setClosingReading(reading);
      }
    }

    void loadClosingReading();

    return () => {
      cancelled = true;
    };
  }, [encerramentoPayload]);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Encerramento</p>
        <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em]">Fechar o dia sem arrastar o sistema</h3>
        <p className="mt-2 max-w-2xl text-sm text-[var(--text-secondary)]">
          Este fechamento nao vira relatorio nem diario obrigatorio. Ele so recolhe o que o dia entregou, o que continua aberto e o que nao deveria ser levado adiante no automatico.
        </p>
      </div>

      <Card className="space-y-3 p-4">
        <p className="text-sm font-semibold text-[var(--text)]">Antes de desligar</p>
        <p className="text-sm text-[var(--text-secondary)]">
          O foco aqui e encerrar o ciclo do dia com nitidez. Nao e revisar o sistema inteiro, nem replanejar tudo agora.
        </p>
      </Card>

      {closingReading ? (
        <Card className="space-y-3 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Leitura de fechamento</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--text-secondary)]">{closingReading}</p>
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Resumo</p>
              <h4 className="mt-2 text-lg font-semibold text-[var(--text)]">O que o dia conseguiu fechar</h4>
            </div>
            <CheckCircle2 className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <div className="space-y-2 text-sm text-[var(--text-secondary)]">
            <p><span className="font-semibold text-[var(--text)]">{domain.completedCount}</span> itens concluidos hoje.</p>
            <p><span className="font-semibold text-[var(--text)]">{unfinishedItems.length}</span> itens ainda seguem abertos.</p>
            <p><span className="font-semibold text-[var(--text)]">{domain.respectedInegociaveisCount}</span> inegociaveis permaneceram protegidos.</p>
          </div>
        </Card>

        <Card className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Continuacao</p>
              <h4 className="mt-2 text-lg font-semibold text-[var(--text)]">O que ainda pede continuidade</h4>
            </div>
            <Clock3 className="h-5 w-5 text-[var(--warning)]" />
          </div>
          <div className="space-y-2 text-sm text-[var(--text-secondary)]">
            <p><span className="font-semibold text-[var(--text)]">{unfinishedItems.length}</span> ativos seguem para reavaliacao no proximo ciclo.</p>
            <p><span className="font-semibold text-[var(--text)]">{reconsiderItems.length}</span> pedem uma pausa de discernimento antes de simplesmente carregar para frente.</p>
          </div>
        </Card>

        <Card className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Sinais do sistema</p>
              <h4 className="mt-2 text-lg font-semibold text-[var(--text)]">O que nao convem esquecer</h4>
            </div>
            <TriangleAlert className="h-5 w-5 text-[var(--danger)]" />
          </div>
          <div className="space-y-2 text-sm text-[var(--text-secondary)]">
            <p><span className="font-semibold text-[var(--text)]">{hojeDomain.overdueItems.length}</span> seguem em atraso.</p>
            <p><span className="font-semibold text-[var(--text)]">{postponedItems.length}</span> vieram de adiamento e ainda pedem volta.</p>
            <p><span className="font-semibold text-[var(--text)]">{attentionItems.length}</span> aparecem em atencao neste fechamento.</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3 p-4">
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">O que foi concluido</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Feitos do dia, para poder realmente encerrar o que ja saiu do caminho.</p>
          </div>
          {renderSimpleList(domain.completedItems, 'Nenhum item concluido hoje.')}
        </Card>

        <Card className="space-y-3 p-4">
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">O que continua em aberto</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Itens que seguem vivos, sem exigir que voce resolva tudo agora no fechamento.</p>
          </div>
          {renderSimpleList(unfinishedItems, 'Nenhum item ativo permaneceu em aberto.')}
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3 p-4">
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">Itens para reconsiderar</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Adiados ou itens com sinais de inercia que merecem voltar com mais consciencia depois.</p>
          </div>
          {renderSimpleList(reconsiderItems, 'Nenhum item pedindo reconsideracao agora.')}
        </Card>

        <Card className="space-y-3 p-4">
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">Itens em atencao</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Riscos ainda visiveis no fechamento, sem transformar este momento numa revisao ampla do sistema.</p>
          </div>
          {renderSimpleList(attentionItems, 'Nenhum risco adicional destacado neste encerramento.')}
        </Card>
      </div>

      <Card className="space-y-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-[var(--text)]">Encerrar o ciclo de hoje</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Sem formulario longo. So um fechamento leve para concluir o dia e deixar a revisao mais ampla para a camada certa.</p>
          </div>
          <Button onClick={() => setLightsOut(true)}>
            <MoonStar className="h-4 w-4" />
            Fechar o dia
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {lightsOut ? (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.12 }}
              className="rounded-3xl border border-white/10 bg-white/8 px-6 py-5 text-center backdrop-blur"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">Encerramento</p>
              <p className="mt-3 text-xl font-semibold text-white">Luzes baixando suavemente</p>
              <p className="mt-2 text-sm text-white/70">Dia lido. Agora e hora de desligar.</p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
