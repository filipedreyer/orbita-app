import { ArrowRight, Clock3, Pin } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { Item } from '../../lib/types';
import type { IASuggestResult, IASuggestionItem } from './types';

function getSuggestionLabel(type: IASuggestionItem['type']) {
  if (type === 'defer') {
    return {
      title: 'Adiar este item',
      action: 'Adiar',
      icon: Clock3,
    };
  }

  if (type === 'highlight') {
    return {
      title: 'Trazer este item para atencao',
      action: 'Destacar',
      icon: ArrowRight,
    };
  }

  return {
    title: 'Manter este item como esta',
    action: 'Manter',
    icon: Pin,
  };
}

export function IASuggestCards({
  title,
  summary,
  result,
  itemsById,
  onApply,
  onIgnore,
}: {
  title: string;
  summary: string;
  result: IASuggestResult;
  itemsById: Map<string, Item>;
  onApply: (suggestion: IASuggestionItem) => void;
  onIgnore: (suggestion: IASuggestionItem) => void;
}) {
  if (result.suggestions.length === 0) return null;

  return (
    <Card className="space-y-4 p-4">
      <div>
        <p className="text-sm font-semibold text-[var(--text)]">{title}</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{summary}</p>
      </div>

      <div className="space-y-3">
        {result.suggestions.map((suggestion) => {
          const item = itemsById.get(suggestion.itemId);
          if (!item) return null;

          const label = getSuggestionLabel(suggestion.type);
          const Icon = label.icon;

          return (
            <div key={`${suggestion.type}:${suggestion.itemId}`} className="rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface-alt)] p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[var(--text)]">{label.title}</p>
                  <p className="mt-1 text-sm text-[var(--text)]">{item.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[var(--text-tertiary)]">{item.type}</p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{suggestion.reason}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button onClick={() => onApply(suggestion)}>{label.action}</Button>
                <Button variant="ghost" onClick={() => onIgnore(suggestion)}>
                  Ignorar
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
