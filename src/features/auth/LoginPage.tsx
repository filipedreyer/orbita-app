import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { routes } from '../../app/routes';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store';
import { AuthShell } from './AuthShell';

export function LoginPage() {
  const navigate = useNavigate();
  const signIn = useAuthStore((state) => state.signIn);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      navigate(routes.fazer, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Entrar"
      subtitle="Acesso por email e senha com Supabase Auth. A confirmação por email continua sendo gerenciada no backend existente."
      footer={
        <p>
          Ainda não tem conta? <Link className="font-semibold text-[var(--teal)]" to={routes.signup}>Criar conta</Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@exemplo.com" />
        <Input label="Senha" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Sua senha" />
        {error ? <p className="text-sm text-[var(--red)]">{error}</p> : null}
        <Button className="w-full" loading={loading} type="submit">Entrar</Button>
      </form>
      <div className="flex items-center justify-between text-sm">
        <Link className="font-semibold text-[var(--teal)]" to={routes.forgotPassword}>Esqueci minha senha</Link>
        <span className="text-[var(--text-tertiary)]">OAuth Google fica opcional para depois</span>
      </div>
    </AuthShell>
  );
}
