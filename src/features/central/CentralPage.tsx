import { useNavigate } from 'react-router-dom';
import { routes } from '../../app/routes';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store';

export function CentralPage() {
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">Central</p>
        <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em]">Configuração inicial</h2>
      </div>

      <Card>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Fase 1</h3>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">
            A área Central fica simples nesta etapa, servindo como destino do hamburger e ponto de saída da sessão.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => navigate(routes.fazer)}>Voltar ao app</Button>
            <Button
              variant="ghost"
              onClick={async () => {
                await signOut();
                navigate(routes.login, { replace: true });
              }}
            >
              Sair
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
