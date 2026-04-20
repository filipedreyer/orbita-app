import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabaseEnvError } from '../lib/supabase';

export function ConfigurationErrorScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg)] px-6 py-10 text-[var(--text)]">
      <Card className="w-full max-w-xl space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--state-attention)]">Configuracao obrigatoria</p>
          <h1 className="text-3xl font-semibold tracking-[-0.03em]">O Orbita precisa das variaveis do Supabase para iniciar.</h1>
          <p className="text-sm leading-6 text-[var(--text-secondary)]">{supabaseEnvError}</p>
        </div>

        <div className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-subtle)] p-4 text-sm leading-6 text-[var(--text-secondary)]">
          Defina <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> no ambiente local e recarregue o app.
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </Card>
    </main>
  );
}
