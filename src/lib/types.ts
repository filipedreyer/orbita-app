export type EntityType =
  | 'tarefa'
  | 'projeto'
  | 'meta'
  | 'habito'
  | 'rotina'
  | 'evento'
  | 'nota'
  | 'ideia'
  | 'lembrete'
  | 'lista'
  | 'inegociavel';

export type PriorityLevel = 'alta' | 'media' | 'baixa';
export type EntityStatus = 'active' | 'done' | 'cancelled' | 'archived' | 'paused';
export type FrequencyType = 'daily' | 'weekly' | 'monthly';
export type GoalDirection = 'up' | 'stable' | 'down';
export type InegociavelRuleType = 'bloco_tempo' | 'frequencia' | 'limite';
export type CaptureType = 'inbox' | EntityType;

export interface HabitMetadata {
  frequency: FrequencyType;
  streak: number;
  last_checked: string | null;
}

export interface RoutineMetadata {
  frequency: FrequencyType;
}

export interface EventMetadata {
  time: string | null;
  location: string | null;
}

export interface InegociavelMetadata {
  regra_tipo: InegociavelRuleType;
  horas_por_dia?: number;
  horario_inicio?: string;
  horario_fim?: string;
  vezes_por_semana?: number;
  limite_horas?: number;
  dias_cumpridos_ultimos_7?: number;
  dias_cumpridos_ultimos_14?: number;
}

export type ItemMetadata = HabitMetadata | RoutineMetadata | EventMetadata | InegociavelMetadata | Record<string, unknown>;

export interface Item {
  id: string;
  user_id: string;
  type: EntityType;
  title: string;
  description: string | null;
  status: EntityStatus;
  priority: PriorityLevel | null;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  goal_id: string | null;
  project_id: string | null;
  tags: string[];
  reschedule_count: number;
  metadata: ItemMetadata;
  image_url: string | null;
}

export interface SubItem {
  id: string;
  item_id: string;
  user_id: string;
  text: string;
  done: boolean;
  sort_order: number;
  created_at: string;
}

export interface InboxItem {
  id: string;
  user_id: string;
  text: string;
  image_url: string | null;
  ai_suggested_type: EntityType;
  ai_suggested_tags: string | null;
  created_at: string;
}

export interface HabitLog {
  id: string;
  user_id: string;
  item_id: string;
  checked_date: string;
  created_at: string;
}

export interface UserSettings {
  homeScreen: 'today';
  theme: 'auto' | 'light' | 'dark';
  silenceStart: string;
  silenceEnd: string;
  weeklyReportDay: string;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  settings: UserSettings;
  created_at: string;
  updated_at: string;
}

export const typeLabels: Record<EntityType, string> = {
  tarefa: 'Tarefa',
  projeto: 'Projeto',
  meta: 'Meta',
  habito: 'Hábito',
  rotina: 'Rotina',
  evento: 'Evento',
  nota: 'Nota',
  ideia: 'Ideia',
  lembrete: 'Lembrete',
  lista: 'Lista',
  inegociavel: 'Inegociável',
};

export const frequencyLabels: Record<FrequencyType, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
};
