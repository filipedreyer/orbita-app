import { useMemo, useState } from 'react';
import { Button, Card, Input } from '../../components/ui';
import { useDataStore } from '../../store';
import { getPlainText } from './memory-helpers';

export function ItensPage() {
  const items = useDataStore((state) => state.items);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'nota' | 'ideia' | 'lista'>('todos');

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => (typeFilter === 'todos' ? true : item.type === typeFilter))
      .filter((item) => `${item.title} ${getPlainText(item.description)}`.toLowerCase().includes(search.toLowerCase()));
  }, [items, search, typeFilter]);

  return (
    <div className="space-y-4">
      <Card className="space-y-3 p-4">
        <h3 className="text-xl font-semibold">Itens</h3>
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar em todos os itens da Memória..." />
        <div className="flex flex-wrap gap-2">
          <Button variant={typeFilter === 'todos' ? 'primary' : 'ghost'} onClick={() => setTypeFilter('todos')}>Todos</Button>
          <Button variant={typeFilter === 'nota' ? 'primary' : 'ghost'} onClick={() => setTypeFilter('nota')}>Notas</Button>
          <Button variant={typeFilter === 'ideia' ? 'primary' : 'ghost'} onClick={() => setTypeFilter('ideia')}>Ideias</Button>
          <Button variant={typeFilter === 'lista' ? 'primary' : 'ghost'} onClick={() => setTypeFilter('lista')}>Listas</Button>
        </div>
      </Card>

      <div className="space-y-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="space-y-2 p-4">
            <p className="text-sm font-semibold text-[var(--text)]">{item.title}</p>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--text-tertiary)]">{item.type}</p>
            <p className="text-sm text-[var(--text-secondary)]">{getPlainText(item.description).slice(0, 160) || 'Sem conteúdo textual.'}</p>
          </Card>
        ))}
        {filteredItems.length === 0 ? <Card className="p-6 text-sm text-[var(--text-secondary)]">Nenhum item encontrado.</Card> : null}
      </div>
    </div>
  );
}
