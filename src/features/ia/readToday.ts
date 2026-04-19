import type { Item } from '../../lib/types';
import { supabase } from '../../lib/supabase';

export type TodayReadCapacity = 'balanced' | 'loaded' | 'overloaded';
export type TodayReadStatus = 'idle' | 'loading' | 'success' | 'empty' | 'timeout' | 'failure';

const READ_TODAY_TIMEOUT_MS = 8000;
const MIN_READING_LENGTH = 24;

type TodayReadItem = {
  title: string;
  type: string;
  status: string;
  due_date: string | null;
  linkage: {
    kind: 'goal' | 'project' | 'none';
    label: string | null;
  };
};

export type TodayReadPayload = {
  agora: TodayReadItem[];
  cabe: TodayReadItem[];
  atencao: TodayReadItem[];
  capacity: TodayReadCapacity;
  directionSummary: {
    linked: number;
    standalone: number;
  };
  summary: {
    agoraCount: number;
    cabeCount: number;
    atencaoCount: number;
    dueTodayInAgora: number;
    linkedInAgora: number;
    standaloneInAgora: number;
    highPriorityStandaloneInAgora: number;
    overdueInAtencao: number;
    revisitInAtencao: number;
  };
};

export class ReadTodayError extends Error {
  code: Exclude<TodayReadStatus, 'idle' | 'loading' | 'success'>;

  constructor(code: Exclude<TodayReadStatus, 'idle' | 'loading' | 'success'>, message: string) {
    super(message);
    this.name = 'ReadTodayError';
    this.code = code;
  }
}

function mapLinkage(item: Item, itemsById: Map<string, Item>): TodayReadItem['linkage'] {
  const goal = item.goal_id ? itemsById.get(item.goal_id) : null;
  if (goal) {
    return { kind: 'goal', label: goal.title };
  }

  const project = item.project_id ? itemsById.get(item.project_id) : null;
  if (project) {
    return { kind: 'project', label: project.title };
  }

  return { kind: 'none', label: null };
}

function mapTodayItem(item: Item, itemsById: Map<string, Item>): TodayReadItem {
  return {
    title: item.title,
    type: item.type,
    status: item.status,
    due_date: item.due_date ?? null,
    linkage: mapLinkage(item, itemsById),
  };
}

export function buildTodayReadPayload({
  agora,
  cabe,
  atencao,
  capacity,
  linked,
  standalone,
  allItems,
}: {
  agora: Item[];
  cabe: Item[];
  atencao: Item[];
  capacity: TodayReadCapacity;
  linked: number;
  standalone: number;
  allItems: Item[];
}): TodayReadPayload {
  const itemsById = new Map(allItems.map((item) => [item.id, item]));
  const mappedAgora = agora.map((item) => mapTodayItem(item, itemsById));
  const mappedCabe = cabe.map((item) => mapTodayItem(item, itemsById));
  const mappedAtencao = atencao.map((item) => mapTodayItem(item, itemsById));
  const linkedInAgora = mappedAgora.filter((item) => item.linkage.kind !== 'none').length;
  const standaloneInAgora = mappedAgora.length - linkedInAgora;
  const dueTodayInAgora = mappedAgora.filter((item) => !!item.due_date).length;
  const highPriorityStandaloneInAgora = agora.filter((item) => {
    const linkage = mapLinkage(item, itemsById);
    return linkage.kind === 'none' && item.priority === 'alta';
  }).length;
  const overdueInAtencao = mappedAtencao.filter((item) => !!item.due_date).length;
  const revisitInAtencao = atencao.filter((item) => {
    const metadata = (item.metadata || {}) as Record<string, unknown>;
    return metadata.inbox_needs_revisit === true;
  }).length;

  return {
    agora: mappedAgora,
    cabe: mappedCabe,
    atencao: mappedAtencao,
    capacity,
    directionSummary: {
      linked,
      standalone,
    },
    summary: {
      agoraCount: mappedAgora.length,
      cabeCount: mappedCabe.length,
      atencaoCount: mappedAtencao.length,
      dueTodayInAgora,
      linkedInAgora,
      standaloneInAgora,
      highPriorityStandaloneInAgora,
      overdueInAtencao,
      revisitInAtencao,
    },
  };
}

export async function readTodayWithAI(payload: TodayReadPayload) {
  const invokePromise = supabase.functions.invoke<{ reading?: unknown }>('ia-read-today', {
    body: payload,
  });
  const timeoutPromise = new Promise<never>((_, reject) => {
    window.setTimeout(() => {
      reject(new ReadTodayError('timeout', 'Leitura indisponivel agora. Siga com o dia e tente novamente depois.'));
    }, READ_TODAY_TIMEOUT_MS);
  });

  const { data, error } = await Promise.race([invokePromise, timeoutPromise]);

  if (error) {
    throw new ReadTodayError('failure', 'Leitura indisponivel agora. Siga com o dia e tente novamente depois.');
  }

  if (!data || typeof data !== 'object' || !('reading' in data)) {
    throw new ReadTodayError('failure', 'Leitura indisponivel agora. Siga com o dia e tente novamente depois.');
  }

  const reading = typeof data.reading === 'string' ? data.reading.trim() : '';
  if (!reading) {
    throw new ReadTodayError('empty', 'Leitura indisponivel agora. Siga com o dia e tente novamente depois.');
  }

  if (reading.length < MIN_READING_LENGTH) {
    throw new ReadTodayError('empty', 'Leitura indisponivel agora. Siga com o dia e tente novamente depois.');
  }

  return reading;
}

export { READ_TODAY_TIMEOUT_MS };
