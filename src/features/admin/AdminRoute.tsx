import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../app/routes';
import { Button, Card } from '../../components/ui';
import { useAdminRole } from './useAdminRole';

export function AdminRoute({ children }: { children: ReactNode }) {
  const adminRole = useAdminRole();

  if (adminRole.state === 'checking') {
    return <Card className="p-6 text-sm text-[var(--text-secondary)]">Verificando permissao administrativa...</Card>;
  }

  if (!adminRole.isAdmin) {
    return (
      <Card className="space-y-4 border-[var(--danger)]/30 p-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">Admin protegido</p>
          <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[var(--text)]">Acesso administrativo bloqueado</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Login nao equivale a Admin. Esta rota falha fechada quando a role nao pode ser confirmada.
          </p>
          <p className="mt-2 text-sm text-[var(--text-tertiary)]">{adminRole.reason}</p>
        </div>
        <Link to={routes.central}>
          <Button variant="secondary">Voltar para a Central</Button>
        </Link>
      </Card>
    );
  }

  return children;
}
