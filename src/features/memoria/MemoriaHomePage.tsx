import { Archive, FileStack, Inbox, Link2, Paperclip, Search, Shapes } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../app/routes';
import { Button, Card, Input } from '../../components/ui';
import { useDataStore } from '../../store';
import { IASuggestion } from '../ia/IASuggestion';
import { useIA } from '../ia/useIA';
import { OnboardingChecklist } from '../onboarding/OnboardingChecklist';
import { getPlainText, isDiaryNote, isShortcutItem, matchesMemorySearch } from './memory-helpers';

const hubLinks = [
  { label: 'Itens', path: routes.memoriaItens, icon: Search },
  { label: 'Templates', path: routes.memoriaTemplates, icon: Shapes },
  { label: 'Arquivados', path: routes.memoriaArquivados, icon: Archive },
  { label: 'Anexos', path: routes.memoriaAnexos, icon: Paperclip },
] as const;

export function MemoriaHomePage() {
  const navigate = useNavigate();
  const items = useDataStore((state) => state.items);
  const inbox = useDataStore((state) => state.inbox);
  const { routeContext, completedActions, triggerAction } = useIA();
  const [search, setSearch] = useState('');

  const noteItems = useMemo(() => items.filter((item) => item.type === 'nota'), [items]);
  const shortcutItems = useMemo(() => items.filter(isShortcutItem), [items]);
  const diaryItems = useMemo(() => items.filter(isDiaryNote), [items]);
  const searchResults = useMemo(
    () =>
      items
        .filter((item) => matchesMemorySearch(item, search))
        .slice(0, 5)
        .map((item) => ({
          id: item.id,
          title: item.title,
          preview: getPlainText(item.description).slice(0, 100) || item.type,
        })),
    [items, search],
  );

  return (
    <div className="space-y-5">
      <OnboardingChecklist
        area="memoria"
        title="Como usar a Memoria"
        description="Capture na Inbox, refine em Itens e consolide conhecimento em Caixola e Diario."
        primaryLabel="Abrir Inbox"
        onPrimaryAction={() => navigate(routes.memoriaInbox)}
        steps={[
          { title: 'Inbox', description: 'Triagem inicial das capturas ainda sem classificacao.' },
          { title: 'Caixola', description: 'Notas, diario e templates no mesmo fluxo editorial.' },
          { title: 'Busca', description: 'Recupere conteudo e reorganize o acervo sem sair da Memoria.' },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <button type="button" onClick={() => navigate(routes.memoriaInbox)} className="text-left">
          <Card className="space-y-4 p-5 transition hover:border-[var(--border-strong)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-2xl)] bg-[var(--accent-soft)] text-[var(--accent)]">
                <Inbox className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-[var(--text)]">Inbox</p>
            </div>
            <p className="text-3xl font-bold tracking-[-0.04em] text-[var(--text)]">{inbox.length}</p>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">Capturas esperando triagem.</p>
          </Card>
        </button>

        <button type="button" onClick={() => navigate(routes.memoriaAtalhos)} className="text-left">
          <Card className="space-y-4 p-5 transition hover:border-[var(--border-strong)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-2xl)] bg-[var(--accent-soft)] text-[var(--accent)]">
                <Link2 className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-[var(--text)]">Atalhos</p>
            </div>
            <p className="text-3xl font-bold tracking-[-0.04em] text-[var(--text)]">{shortcutItems.length}</p>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">Entradas marcadas para acesso rapido.</p>
          </Card>
        </button>

        <button type="button" onClick={() => navigate(routes.memoriaCaixola)} className="text-left">
          <Card className="space-y-4 p-5 transition hover:border-[var(--border-strong)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[var(--radius-2xl)] bg-[var(--accent-soft)] text-[var(--accent)]">
                <FileStack className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-[var(--text)]">Caixola</p>
            </div>
            <p className="text-3xl font-bold tracking-[-0.04em] text-[var(--text)]">{noteItems.length}</p>
            <p className="text-sm leading-6 text-[var(--text-secondary)]">{diaryItems.length} diarios ja recuperaveis.</p>
          </Card>
        </button>
      </div>

      {routeContext.area === 'memoria' && routeContext.suggestions[0] ? (
        <IASuggestion suggestion={routeContext.suggestions[0]} completedActions={completedActions} onRunAction={triggerAction} />
      ) : null}

      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-2xl)] bg-[var(--surface-alt)] text-[var(--text-secondary)]">
            <Search className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Busca</p>
            <p className="mt-1 text-sm font-semibold text-[var(--text)]">Recuperacao rapida</p>
          </div>
        </div>
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar em notas, itens e memorias..." />
        {search.trim() ? (
          <div className="space-y-2">
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                <div key={result.id} className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3">
                  <p className="text-sm font-medium text-[var(--text)]">{result.title}</p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">{result.preview}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)]">Nenhum resultado encontrado.</div>
            )}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">A busca funciona como leitura rapida do acervo da Memoria.</p>
        )}
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {hubLinks.map((link) => (
          <Card key={link.path} className="space-y-4 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-2xl)] bg-[var(--accent-soft)] text-[var(--accent)]">
                <link.icon className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-[var(--text)]">{link.label}</p>
            </div>
            <Button variant="secondary" onClick={() => navigate(link.path)}>
              Abrir
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
