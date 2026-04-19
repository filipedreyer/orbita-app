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
export type CaptureOrigin = 'quick_capture' | 'structured';

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

export interface FileLikeMetadata {
  file_name?: string;
  file_size?: number;
  mime_type?: string;
}

export interface InboxAttachmentFields {
  // Caminho explicito para anexos genericos no inbox. Estes campos sao opcionais
  // para manter compatibilidade com o schema atual enquanto o backend nao expoe
  // colunas dedicadas para attachment.
  attachment_url?: string | null;
  attachment_name?: string | null;
  attachment_mime_type?: string | null;
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

export interface InboxItem extends InboxAttachmentFields {
  id: string;
  user_id: string;
  text: string;
  // Campo legado: hoje continua servindo como fallback para anexos no inbox,
  // inclusive quando o anexo nao e imagem. Manter por compatibilidade.
  image_url: string | null;
  ai_suggested_type: EntityType | null;
  ai_suggested_tags: string | null;
  created_at: string;
}

export interface InboxDraft extends InboxAttachmentFields {
  text: string;
  // Mesmo comportamento legado do InboxItem.image_url.
  image_url: string | null;
}

export interface HabitLog {
  id: string;
  user_id: string;
  item_id: string;
  checked_date: string;
  created_at: string;
}

export interface RitualOrderSettings {
  date: string;
  ids: string[];
}

export interface UserSettings {
  homeScreen: 'today';
  theme: 'auto' | 'light' | 'dark';
  silenceStart: string;
  silenceEnd: string;
  weeklyReportDay: string;
  ritualOrder?: RitualOrderSettings | null;
  [key: string]: unknown;
}

export interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  settings: UserSettings;
  created_at: string;
  updated_at: string;
}

export type ProfileSettingsRecord = UserSettings;
export type EntityItem = Item;
export type InboxEntity = InboxItem;
export type EntityRecord = Item | InboxItem | SubItem | HabitLog;

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
