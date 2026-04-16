import { useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../app/routes';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { requestPasswordReset } from '../../services/auth';
import { AuthShell } from './AuthShell';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await requestPasswordReset(email);
      setMessage('Se o email existir, você receberá um link de redefinição.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível solicitar a redefinição.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Recuperar senha"
      subtitle="Tela conectada ao fluxo nativo do Supabase Auth para envio de link de recuperação."
      footer={<Link className="font-semibold text-[var(--teal)]" to={routes.login}>Voltar para login</Link>}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" />
        {message ? <p className="text-sm text-[var(--green)]">{message}</p> : null}
        {error ? <p className="text-sm text-[var(--red)]">{error}</p> : null}
        <Button className="w-full" loading={loading} type="submit">Enviar link</Button>
      </form>
    </AuthShell>
  );
}
