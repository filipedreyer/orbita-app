import { useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../app/routes';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { updatePassword } from '../../services/auth';
import { AuthShell } from './AuthShell';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await updatePassword(password);
      setMessage('Senha atualizada com sucesso.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar a senha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Redefinir senha"
      subtitle="Esta rota é a landing page do link enviado por email. O token continua sendo validado pelo Supabase."
      footer={<Link className="font-semibold text-[var(--teal)]" to={routes.login}>Ir para login</Link>}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input label="Nova senha" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Digite a nova senha" />
        {message ? <p className="text-sm text-[var(--green)]">{message}</p> : null}
        {error ? <p className="text-sm text-[var(--red)]">{error}</p> : null}
        <Button className="w-full" loading={loading} type="submit">Atualizar senha</Button>
      </form>
    </AuthShell>
  );
}
