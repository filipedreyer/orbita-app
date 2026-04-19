import type { Item } from '../../lib/types';
import { supabase } from '../../lib/supabase';

export type TodayReadCapacity = 'balanced' | 'loaded' | 'overloaded';

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
};

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

  return {
    agora: agora.map((item) => mapTodayItem(item, itemsById)),
    cabe: cabe.map((item) => mapTodayItem(item, itemsById)),
    atencao: atencao.map((item) => mapTodayItem(item, itemsById)),
    capacity,
    directionSummary: {
      linked,
      standalone,
    },
  };
}

export async function readTodayWithAI(payload: TodayReadPayload) {
  const { data, error } = await supabase.functions.invoke<{ reading: string }>('ia-read-today', {
    body: payload,
  });

  if (error) {
    throw new Error(error.message || 'Nao foi possivel ler o dia com IA.');
  }

  if (!data?.reading) {
    throw new Error('A IA nao retornou leitura do dia.');
  }

  return data.reading;
}
