import type { InboxItem, Item } from '../../lib/types';

export function getItemMetadata(item: Item) {
  return (item.metadata as Record<string, unknown>) ?? {};
}

export function getItemTags(item: Item) {
  const metadataTags = getItemMetadata(item).tags;
  const fromMetadata = Array.isArray(metadataTags) ? metadataTags.filter((tag): tag is string => typeof tag === 'string') : [];
  return [...item.tags, ...fromMetadata];
}

export function isDiaryNote(item: Item) {
  return item.type === 'nota' && getItemTags(item).includes('diario');
}

export function isTemplateNote(item: Item) {
  return item.type === 'nota' && getItemTags(item).includes('template');
}

export function isShortcutItem(item: Item) {
  return getItemTags(item).includes('atalho');
}

export function getPlainText(html: string | null) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchesMemorySearch(item: Item | InboxItem, term: string) {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return true;

  if ('text' in item) {
    return item.text.toLowerCase().includes(normalized);
  }

  return `${item.title} ${getPlainText(item.description)}`.toLowerCase().includes(normalized);
}
