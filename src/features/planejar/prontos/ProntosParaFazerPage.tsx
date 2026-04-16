import { ArrowRight, Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../app/routes';
import { Button, Card, PriorityBadge } from '../../../components/ui';
import { usePlanejarProjection } from '../../../store/planejar';

export function ProntosParaFazerPage() {
  const projection = usePlanejarProjection();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text)]">
          <Rocket className="h-4 w-4" />
          Prontos para Fazer
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Esta lista ja respeita elegibilidade, dependencia bloqueante e horizonte imediato.
        </p>
      </Card>

      <div className="grid gap-4">
        {projection.ready.map((item) => (
          <Card key={item.id} className="space-y-4 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{item.type}</p>
                <h4 className="mt-2 text-lg font-semibold">{item.title}</h4>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Horizonte: <span className="font-semibold text-[var(--text)]">{item.horizon}</span>
                </p>
              </div>
              {item.priority ? <PriorityBadge priority={item.priority} /> : null}
            </div>

            <Button variant="secondary" onClick={() => navigate(routes.fazerHoje)}>
              <ArrowRight className="h-4 w-4" />
              Ir para Fazer
            </Button>
          </Card>
        ))}

        {projection.ready.length === 0 ? (
          <Card className="p-6 text-sm text-[var(--text-secondary)]">
            Ainda nao ha itens prontos. Um item precisa ser elegivel, nao bloqueado e estar no horizonte imediato.
          </Card>
        ) : null}
      </div>
    </div>
  );
}
