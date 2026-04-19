import { Download, LifeBuoy, LogOut, MonitorSmartphone, PlayCircle, Settings2, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { routes } from '../../app/routes';
import { useActionFeedback } from '../../components/feedback/ActionFeedbackProvider';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../auth/AuthProvider';
import { CSV_EXPORT_NOTE, downloadCsvEntityExports, downloadJsonExport, type ExportPayload } from './export-utils';
import { useOnboarding } from '../onboarding/OnboardingProvider';
import { usePwa } from '../pwa/PwaProvider';
import * as itemsService from '../../services/items';
import * as profileService from '../../services/profile';
import { useAuthStore, useDataStore } from '../../store';
import type { ProfileSettingsRecord, UserSettings } from '../../lib/types';

const centralSections = [
  { id: 'guia', label: 'Guia', icon: PlayCircle },
  { id: 'suporte', label: 'Suporte', icon: LifeBuoy },
  { id: 'configuracoes', label: 'Configuracoes', icon: Settings2 },
] as const;

type CentralSection = (typeof centralSections)[number]['id'];

export function CentralPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const signOut = useAuthStore((state) => state.signOut);
  const items = useDataStore((state) => state.items);
  const inbox = useDataStore((state) => state.inbox);
  const ritualOrder = useDataStore((state) => state.ritualOrder);
  const { resetAll } = useOnboarding();
  const { showFeedback } = useActionFeedback();
  const pwa = usePwa();
  const [section, setSection] = useState<CentralSection>('guia');
  const [settings, setSettings] = useState<ProfileSettingsRecord>({
    homeScreen: 'today',
    theme: 'auto',
    weeklyReportDay: 'monday',
    silenceStart: '22:00',
    silenceEnd: '07:00',
  });
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [busyExport, setBusyExport] = useState<'json' | 'csv' | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (!session?.user) return;

    let isMounted = true;
    setSettingsLoading(true);
    void profileService
      .fetchProfileSettings(session.user.id)
      .then((nextSettings) => {
        if (isMounted) {
          setSettings((current) => ({ ...current, ...nextSettings }));
        }
      })
      .finally(() => {
        if (isMounted) setSettingsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [session]);

  const supportStats = useMemo(
    () => ({
      activeItems: items.length,
      inbox: inbox.length,
      ritualOrder: ritualOrder.length,
    }),
    [inbox.length, items.length, ritualOrder.length],
  );

  async function buildExportPayload(): Promise<ExportPayload | null> {
    if (!session?.user) return null;

    const [archivedItems, subItems, habitLogs, profileSettings] = await Promise.all([
      itemsService.fetchArchivedItems(session.user.id),
      itemsService.fetchAllSubItems(session.user.id),
      itemsService.fetchHabitLogs(session.user.id),
      profileService.fetchProfileSettings(session.user.id),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      userId: session.user.id,
      activeItems: items,
      archivedItems,
      inbox,
      subItems,
      habitLogs,
      profileSettings,
    };
  }

  async function handleJsonExport() {
    setBusyExport('json');
    try {
      const payload = await buildExportPayload();
      if (!payload) return;
      downloadJsonExport(payload);
      showFeedback('Exportacao JSON iniciada.');
    } finally {
      setBusyExport(null);
    }
  }

  async function handleCsvExport() {
    setBusyExport('csv');
    try {
      const payload = await buildExportPayload();
      if (!payload) return;
      downloadCsvEntityExports(payload);
      showFeedback(CSV_EXPORT_NOTE);
    } finally {
      setBusyExport(null);
    }
  }

  async function handleSaveSettings() {
    if (!session?.user) return;
    setSavingSettings(true);
    try {
      await profileService.updateProfileSettings(session.user.id, settings);
      showFeedback('Configuracoes salvas.');
    } finally {
      setSavingSettings(false);
    }
  }

  async function handleInstallPwa() {
    const accepted = await pwa.installApp();
    showFeedback(accepted ? 'Instalacao iniciada no dispositivo.' : 'Instalacao nao iniciada neste navegador.');
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-tertiary)]">Central</p>
          <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em]">Guia, suporte e configuracoes</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Camada final de operacao do produto: orientacao, exportacao, configuracoes basicas e acesso ao painel administrativo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={routes.centralAdmin}>
            <Button variant="secondary">
              <ShieldCheck className="h-4 w-4" />
              Admin
            </Button>
          </Link>
          <Button variant="ghost" onClick={() => navigate(routes.fazerHoje)}>
            Voltar ao app
          </Button>
        </div>
      </div>

      <Card className="p-2">
        <div className="flex flex-wrap gap-2">
        {centralSections.map((entry) => (
          <Button key={entry.id} variant={section === entry.id ? 'primary' : 'ghost'} onClick={() => setSection(entry.id)}>
            <entry.icon className="h-4 w-4" />
            {entry.label}
          </Button>
        ))}
        </div>
      </Card>

      {section === 'guia' ? (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="space-y-3 p-4">
              <p className="text-lg font-semibold">Fazer</p>
              <p className="text-sm text-[var(--text-secondary)]">Ritual define a ordem do dia. Hoje executa. Encerramento fecha o ciclo.</p>
              <Button variant="secondary" onClick={() => navigate(routes.fazerRitual)}>Abrir Ritual</Button>
            </Card>
            <Card className="space-y-3 p-4">
              <p className="text-lg font-semibold">Memoria</p>
              <p className="text-sm text-[var(--text-secondary)]">Inbox captura, Caixola organiza e Diario fica como nota recuperavel.</p>
              <Button variant="secondary" onClick={() => navigate(routes.memoria)}>Abrir Memoria</Button>
            </Card>
            <Card className="space-y-3 p-4">
              <p className="text-lg font-semibold">Planejar</p>
              <p className="text-sm text-[var(--text-secondary)]">Metas, projetos, habitos e inegociaveis orientam o portfolio.</p>
              <Button variant="secondary" onClick={() => navigate(routes.planejar)}>Abrir Planejar</Button>
            </Card>
          </div>

          <Card className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Onboarding curto do produto</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Resetar o onboarding volta a exibir a orientacao inicial em Fazer, Memoria e Planejar.</p>
              </div>
              <Button variant="secondary" onClick={() => {
                resetAll();
                showFeedback('Onboarding resetado.');
              }}>
                <Sparkles className="h-4 w-4" />
                Resetar onboarding
              </Button>
            </div>
          </Card>
        </div>
      ) : null}

      {section === 'suporte' ? (
        <div className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="space-y-4 p-4">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-[var(--teal)]" />
                <div>
                  <p className="text-lg font-semibold">Exportacao de dados</p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">Exporta apenas dados reais do usuario autenticado.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => void handleJsonExport()} loading={busyExport === 'json'}>Exportar JSON completo</Button>
                <Button variant="secondary" onClick={() => void handleCsvExport()} loading={busyExport === 'csv'}>Exportar CSVs por entidade</Button>
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">{CSV_EXPORT_NOTE}</p>
            </Card>

            <Card className="space-y-4 p-4">
              <div className="flex items-center gap-3">
                <LifeBuoy className="h-5 w-5 text-[var(--teal)]" />
                <div>
                  <p className="text-lg font-semibold">Suporte operacional</p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">Base minima para triagem do app antes do deploy.</p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-alt)] p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Itens ativos</p><p className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[var(--text)]">{supportStats.activeItems}</p></div>
                <div className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-alt)] p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Inbox</p><p className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[var(--text)]">{supportStats.inbox}</p></div>
                <div className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-alt)] p-4"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text-tertiary)]">Ritual order</p><p className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[var(--text)]">{supportStats.ritualOrder}</p></div>
              </div>
            </Card>
          </div>
        </div>
      ) : null}

      {section === 'configuracoes' ? (
        <div className="space-y-4">
          <Card className="space-y-4 p-4">
            <div className="flex items-center gap-3">
              <Settings2 className="h-5 w-5 text-[var(--teal)]" />
              <div>
                <p className="text-lg font-semibold">Configuracoes basicas</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Preferencias locais do produto sem reabrir a arquitetura das fases anteriores.</p>
              </div>
            </div>
            {settingsLoading ? (
              <p className="text-sm text-[var(--text-secondary)]">Carregando configuracoes...</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Tema</span>
                  <select
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm"
                    value={String(settings.theme ?? 'auto')}
                    onChange={(event) => setSettings((current) => ({ ...current, theme: event.target.value as UserSettings['theme'] }))}
                  >
                    <option value="auto">Auto</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Tela inicial</span>
                  <select
                    className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm"
                    value={String(settings.homeScreen ?? 'today')}
                    onChange={(event) => setSettings((current) => ({ ...current, homeScreen: event.target.value as UserSettings['homeScreen'] }))}
                  >
                    <option value="today">Today</option>
                  </select>
                </label>
                <Input label="Silencio inicio" value={String(settings.silenceStart ?? '22:00')} onChange={(event) => setSettings((current) => ({ ...current, silenceStart: event.target.value }))} />
                <Input label="Silencio fim" value={String(settings.silenceEnd ?? '07:00')} onChange={(event) => setSettings((current) => ({ ...current, silenceEnd: event.target.value }))} />
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void handleSaveSettings()} loading={savingSettings}>Salvar configuracoes</Button>
              <Link to={routes.centralAdmin}>
                <Button variant="secondary">Abrir Admin</Button>
              </Link>
            </div>
          </Card>

          <Card className="space-y-4 p-4">
            <div className="flex items-center gap-3">
              <MonitorSmartphone className="h-5 w-5 text-[var(--teal)]" />
              <div>
                <p className="text-lg font-semibold">PWA e instalacao</p>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">Status do app instalado, service worker e conectividade minima offline.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              <Badge label={pwa.isInstalled ? 'instalado' : 'nao instalado'} color="var(--teal)" />
              <Badge label={pwa.isOfflineReady ? 'offline minimo pronto' : 'offline pendente'} color="var(--teal)" />
              <Badge label={pwa.isOnline ? 'online' : 'offline'} color={pwa.isOnline ? 'var(--teal)' : 'var(--red)'} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" onClick={() => void handleInstallPwa()} disabled={!pwa.canInstall}>
                Instalar app
              </Button>
            </div>
          </Card>

          <Card className="space-y-3 p-4">
            <p className="text-lg font-semibold">Sessao</p>
            <p className="text-sm text-[var(--text-secondary)]">Encerrar a sessao continua disponivel na Central como controle final do app.</p>
            <Button
              variant="ghost"
              onClick={async () => {
                await signOut();
                navigate(routes.login, { replace: true });
              }}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
