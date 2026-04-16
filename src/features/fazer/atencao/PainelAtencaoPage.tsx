import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { useHojeProjection } from '../../../store/fazer';

export function PainelAtencaoPage() {
  const projection = useHojeProjection();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Painel de Atenção</p>
        <h3 className="mt-2 text-2xl font-bold tracking-[-0.03em]">Sinais do sistema</h3>
      </div>

      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-[var(--teal)]" />
          <p className="text-sm font-semibold capitalize">{projection.attention.level}</p>
        </div>
        <div className="space-y-2">
          {projection.attention.reasons.length > 0 ? (
            projection.attention.reasons.map((reason) => (
              <div key={reason} className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                {reason}
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)]">
              Nenhum sinal crítico no momento.
            </div>
          )}
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-[var(--yellow)]" />
          <p className="text-sm font-semibold">Leitura atual</p>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Este painel já usa regras canônicas de atraso, capacidade e compressão de inegociáveis definidas no domínio de Fazer.
        </p>
      </Card>
    </div>
  );
}
