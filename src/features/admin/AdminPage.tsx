import { Activity, Archive, BellRing, Database, Download, MonitorSmartphone, RefreshCcw, ShieldCheck, UserRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../app/routes';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../auth/AuthProvider';
import { usePwa } from '../pwa/PwaProvider';
import * as itemsService from '../../services/items';
import * as profileService from '../../services/profile';
import { useDataStore } from '../../store';

export function AdminPage() {
  const { session } = useAuth();
  const items = useDataStore((state) => state.items);
  const inbox = useDataStore((state) => state.inbox);
  const [archivedCount, setArchivedCount] = useState(0);
  const [habitLogCount, setHabitLogCount] = useState(0);
  const [profileSettings, setProfileSettings] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(true);
  const pwa = usePwa();

  useEffect(() => {
    if (!session?.user) return;

    let isMounted = true;
    setLoading(true);

    void Promise.all([
      itemsService.fetchArchivedItems(session.user.id),
      itemsService.fetchHabitLogs(session.user.id),
      profileService.fetchProfileSettings(session.user.id),
    ])
      .then(([archivedItems, habitLogs, settings]) => {
        if (!isMounted) return;
        setArchivedCount(archivedItems.length);
        setHabitLogCount(habitLogs.length);
        setProfileSettings(settings);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [session]);

  const contentMetrics = useMemo(() => {
    const notes = items.filter((item) => item.type === 'nota').length;
    const goals = items.filter((item) => item.type === 'meta').length;
    const projects = items.filter((item) => item.type === 'projeto').length;
    const habits = items.filter((item) => item.type === 'habito').length;
    const nonNegotiables = items.filter((item) => item.type === 'inegociavel').length;

    return { notes, goals, projects, habits, nonNegotiables };
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">Admin</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]">Saude e operacao do app</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Painel alinhado a arquitetura atual: saude do sistema, uso local e placeholders explicitos para metricas que dependem de backend adicional.
          </p>
        </div>
        <Link to={routes.central}>
          <Button variant="secondary">Voltar para a Central</Button>
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4 p-4">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-[var(--teal)]" />
            <h3 className="text-lg font-semibold">Saude do sistema</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
              <p className="text-xs text-[var(--text-tertiary)]">Build baseline</p>
              <p className="mt-2 text-sm font-semibold text-[var(--text)]">Pronto para build de producao</p>
            </div>
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
              <p className="text-xs text-[var(--text-tertiary)]">PWA</p>
              <p className="mt-2 text-sm font-semibold text-[var(--text)]">{pwa.isOfflineReady ? 'Service worker ativo' : 'Fallback sem SW'}</p>
            </div>
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
              <p className="text-xs text-[var(--text-tertiary)]">Conectividade</p>
              <p className="mt-2 text-sm font-semibold text-[var(--text)]">{pwa.isOnline ? 'Online' : 'Offline'}</p>
            </div>
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4">
              <p className="text-xs text-[var(--text-tertiary)]">Sessao</p>
              <p className="mt-2 text-sm font-semibold text-[var(--text)]">{session?.user?.email ?? 'Nao autenticado'}</p>
            </div>
          </div>
        </Card>

        <Card className="space-y-4 p-4">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-[var(--teal)]" />
            <h3 className="text-lg font-semibold">Metricas de uso</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4"><p className="text-xs text-[var(--text-tertiary)]">Itens ativos</p><p className="mt-2 text-2xl font-bold">{items.length}</p></div>
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4"><p className="text-xs text-[var(--text-tertiary)]">Inbox</p><p className="mt-2 text-2xl font-bold">{inbox.length}</p></div>
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4"><p className="text-xs text-[var(--text-tertiary)]">Arquivados</p><p className="mt-2 text-2xl font-bold">{archivedCount}</p></div>
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4"><p className="text-xs text-[var(--text-tertiary)]">Habit logs</p><p className="mt-2 text-2xl font-bold">{habitLogCount}</p></div>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4 p-4">
          <div className="flex items-center gap-3">
            <Archive className="h-5 w-5 text-[var(--teal)]" />
            <h3 className="text-lg font-semibold">Visao de conteudo</h3>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4"><p className="text-xs text-[var(--text-tertiary)]">Notas</p><p className="mt-2 text-xl font-bold">{contentMetrics.notes}</p></div>
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4"><p className="text-xs text-[var(--text-tertiary)]">Metas</p><p className="mt-2 text-xl font-bold">{contentMetrics.goals}</p></div>
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4"><p className="text-xs text-[var(--text-tertiary)]">Projetos</p><p className="mt-2 text-xl font-bold">{contentMetrics.projects}</p></div>
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4"><p className="text-xs text-[var(--text-tertiary)]">Habitos</p><p className="mt-2 text-xl font-bold">{contentMetrics.habits}</p></div>
            <div className="rounded-2xl bg-[var(--surface-alt)] p-4 md:col-span-2"><p className="text-xs text-[var(--text-tertiary)]">Inegociaveis</p><p className="mt-2 text-xl font-bold">{contentMetrics.nonNegotiables}</p></div>
          </div>
        </Card>

        <Card className="space-y-4 p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[var(--teal)]" />
            <h3 className="text-lg font-semibold">Configuracoes basicas</h3>
          </div>
          {loading ? (
            <p className="text-sm text-[var(--text-secondary)]">Carregando configuracoes...</p>
          ) : (
            <div className="space-y-3 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center justify-between rounded-2xl bg-[var(--surface-alt)] px-4 py-3">
                <span>Tema</span>
                <Badge label={String(profileSettings.theme ?? 'auto')} tone="project" />
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[var(--surface-alt)] px-4 py-3">
                <span>Tela inicial</span>
                <Badge label={String(profileSettings.homeScreen ?? 'today')} tone="project" />
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-[var(--surface-alt)] px-4 py-3">
                <span>Weekly report</span>
                <Badge label={String(profileSettings.weeklyReportDay ?? 'monday')} tone="project" />
              </div>
              <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-3 text-xs leading-5">
                Usuarios ativos, error rate e metricas profundas de backend continuam dependentes de infraestrutura adicional e ficam placeholderizadas nesta release.
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <MonitorSmartphone className="h-5 w-5 text-[var(--teal)]" />
          <h3 className="text-lg font-semibold">Release readiness</h3>
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-[var(--text-secondary)]">
          <Badge label={pwa.isOfflineReady ? 'offline minimo pronto' : 'offline pendente'} tone="project" />
          <Badge label="exportacao pronta" tone="project" />
          <Badge label="onboarding pronto" tone="project" />
          <Badge label="deploy vercel pronto" tone="project" />
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-[var(--text-secondary)]">
          <div className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-2xl)] border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 py-3 font-semibold text-[var(--accent)]">
            <BellRing className="h-4 w-4" />
            Baseline monitorada
          </div>
          <div className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <RefreshCcw className="h-4 w-4" />
            Sem migracoes extras
          </div>
          <div className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <Download className="h-4 w-4" />
            Exportacao pronta
          </div>
          <div className="inline-flex min-h-11 items-center gap-2 rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
            <UserRound className="h-4 w-4" />
            Admin local
          </div>
        </div>
      </Card>
    </div>
  );
}

