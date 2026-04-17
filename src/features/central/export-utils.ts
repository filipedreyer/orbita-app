import type { HabitLog, InboxItem, Item, SubItem } from '../../lib/types';

function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function toFlatRecord(input: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => {
      if (Array.isArray(value)) return [key, value.join(' | ')];
      if (value && typeof value === 'object') return [key, JSON.stringify(value)];
      return [key, value ?? ''];
    }),
  );
}

function escapeCsvValue(value: unknown) {
  const stringValue = String(value ?? '');
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replaceAll('"', '""')}"`;
  }
  return stringValue;
}

function toCsv(rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return 'id\n';
  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const lines = [headers.join(',')];

  rows.forEach((row) => {
    lines.push(headers.map((header) => escapeCsvValue(row[header] ?? '')).join(','));
  });

  return `${lines.join('\n')}\n`;
}

function itemToRecord(item: Item) {
  return toFlatRecord({
    id: item.id,
    user_id: item.user_id,
    type: item.type,
    title: item.title,
    description: item.description ?? '',
    status: item.status,
    priority: item.priority ?? '',
    due_date: item.due_date ?? '',
    completed_at: item.completed_at ?? '',
    created_at: item.created_at,
    updated_at: item.updated_at,
    goal_id: item.goal_id ?? '',
    project_id: item.project_id ?? '',
    tags: item.tags,
    reschedule_count: item.reschedule_count,
    metadata: item.metadata,
    image_url: item.image_url ?? '',
  });
}

export interface ExportPayload {
  exportedAt: string;
  userId: string;
  activeItems: Item[];
  archivedItems: Item[];
  inbox: InboxItem[];
  subItems: SubItem[];
  habitLogs: HabitLog[];
  profileSettings: Record<string, unknown>;
}

export function downloadJsonExport(payload: ExportPayload) {
  downloadFile(`orbita-export-${payload.userId}.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
}

export function downloadCsvEntityExports(payload: ExportPayload) {
  const allItems = [...payload.activeItems, ...payload.archivedItems];
  const itemTypes = Array.from(new Set(allItems.map((item) => item.type))).sort();

  itemTypes.forEach((type, index) => {
    const rows = allItems.filter((item) => item.type === type).map(itemToRecord);
    window.setTimeout(() => {
      downloadFile(`orbita-${type}.csv`, toCsv(rows), 'text/csv;charset=utf-8');
    }, index * 80);
  });

  window.setTimeout(() => {
    downloadFile(
      'orbita-inbox.csv',
      toCsv(payload.inbox.map((item) => toFlatRecord(item as unknown as Record<string, unknown>))),
      'text/csv;charset=utf-8',
    );
  }, itemTypes.length * 80);

  window.setTimeout(() => {
    downloadFile(
      'orbita-sub-items.csv',
      toCsv(payload.subItems.map((item) => toFlatRecord(item as unknown as Record<string, unknown>))),
      'text/csv;charset=utf-8',
    );
  }, (itemTypes.length + 1) * 80);

  window.setTimeout(() => {
    downloadFile(
      'orbita-habit-logs.csv',
      toCsv(payload.habitLogs.map((item) => toFlatRecord(item as unknown as Record<string, unknown>))),
      'text/csv;charset=utf-8',
    );
  }, (itemTypes.length + 2) * 80);
}

export const CSV_EXPORT_NOTE = 'Nesta release, o CSV e entregue como arquivos individuais por entidade.';
