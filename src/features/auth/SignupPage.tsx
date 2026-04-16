import { useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../app/routes';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store';
import { AuthShell } from './AuthShell';

export function SignupPage() {
  const signUp = useAuthStore((state) => state.signUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await signUp(email, password, displayName);
      setMessage('Cadastro enviado. Verifique seu email para confirmar a conta.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a conta.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Criar conta"
      subtitle="O novo frontend usa o Supabase Auth existente. Nenhuma mudança de backend será feita nesta fase."
      footer={
        <p>
          Já tem conta? <Link className="font-semibold text-[var(--teal)]" to={routes.login}>Fazer login</Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input label="Nome" value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Como você quer aparecer" />
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" />
        <Input label="Senha" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Crie uma senha" />
        {message ? <p className="text-sm text-[var(--green)]">{message}</p> : null}
        {error ? <p className="text-sm text-[var(--red)]">{error}</p> : null}
        <Button className="w-full" loading={loading} type="submit">Criar conta</Button>
      </form>
    </AuthShell>
  );
}
