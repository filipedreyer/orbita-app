import { Archive, FileStack, Inbox, Link2, Paperclip, Search, Shapes } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../app/routes';
import { Button, Card, Input } from '../../components/ui';
import { useDataStore } from '../../store';
import { IASuggestion } from '../ia/IASuggestion';
import { useIA } from '../ia/useIA';
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
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <button type="button" onClick={() => navigate(routes.memoriaInbox)} className="text-left">
          <Card className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <Inbox className="h-5 w-5 text-[var(--teal)]" />
              <p className="text-sm font-semibold">Inbox</p>
            </div>
            <p className="text-3xl font-bold">{inbox.length}</p>
            <p className="text-sm text-[var(--text-secondary)]">Capturas esperando triagem.</p>
          </Card>
        </button>

        <button type="button" onClick={() => navigate(routes.memoriaAtalhos)} className="text-left">
          <Card className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <Link2 className="h-5 w-5 text-[var(--teal)]" />
              <p className="text-sm font-semibold">Atalhos</p>
            </div>
            <p className="text-3xl font-bold">{shortcutItems.length}</p>
            <p className="text-sm text-[var(--text-secondary)]">Entradas marcadas para acesso rapido.</p>
          </Card>
        </button>

        <button type="button" onClick={() => navigate(routes.memoriaCaixola)} className="text-left">
          <Card className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <FileStack className="h-5 w-5 text-[var(--teal)]" />
              <p className="text-sm font-semibold">Caixola</p>
            </div>
            <p className="text-3xl font-bold">{noteItems.length}</p>
            <p className="text-sm text-[var(--text-secondary)]">{diaryItems.length} diarios ja recuperaveis.</p>
          </Card>
        </button>
      </div>

      {routeContext.area === 'memoria' && routeContext.suggestions[0] ? (
        <IASuggestion suggestion={routeContext.suggestions[0]} completedActions={completedActions} onRunAction={triggerAction} />
      ) : null}

      <Card className="space-y-3 p-4">
        <div className="flex items-center gap-3">
          <Search className="h-4 w-4 text-[var(--text-secondary)]" />
          <p className="text-sm font-semibold">Busca</p>
        </div>
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar em notas, itens e memorias..." />
        {search.trim() ? (
          <div className="space-y-2">
            {searchResults.length > 0 ? (
              searchResults.map((result) => (
                <div key={result.id} className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3">
                  <p className="text-sm font-medium text-[var(--text)]">{result.title}</p>
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">{result.preview}</p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)]">Nenhum resultado encontrado.</div>
            )}
          </div>
        ) : (
          <p className="text-sm text-[var(--text-secondary)]">A busca ja funciona como leitura rapida do acervo da Memoria.</p>
        )}
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {hubLinks.map((link) => (
          <Card key={link.path} className="space-y-3 p-4">
            <div className="flex items-center gap-3">
              <link.icon className="h-4 w-4 text-[var(--teal)]" />
              <p className="text-sm font-semibold">{link.label}</p>
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
