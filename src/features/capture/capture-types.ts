import { Bell, CalendarDays, CheckSquare, ClipboardList, Flag, HeartPulse, Inbox, ListTodo, NotebookPen, Repeat, Rows3, Sparkles } from 'lucide-react';
import type { CanonicalEntityType } from '../../lib/entity-domain';

export interface StructuredCaptureTypeOption {
  type: CanonicalEntityType;
  label: string;
  description: string;
  icon: typeof Bell;
}

export const structuredCaptureTypeOptions: StructuredCaptureTypeOption[] = [
  { type: 'meta', label: 'Meta', description: 'Direcao e resultado esperado.', icon: Flag },
  { type: 'projeto', label: 'Projeto', description: 'Frente concreta ligada a uma meta.', icon: ListTodo },
  { type: 'tarefa', label: 'Tarefa', description: 'Acao concreta para executar.', icon: CheckSquare },
  { type: 'habito', label: 'Habito', description: 'Ciclo recorrente para sustentar o sistema.', icon: HeartPulse },
  { type: 'rotina', label: 'Rotina', description: 'Sequencia repetida de atividades.', icon: Repeat },
  { type: 'evento', label: 'Evento', description: 'Compromisso com data e horario.', icon: ClipboardList },
  { type: 'lembrete', label: 'Lembrete', description: 'Sinal curto para nao esquecer.', icon: Bell },
  { type: 'nota', label: 'Nota', description: 'Registro livre e editavel.', icon: NotebookPen },
  { type: 'lista', label: 'Lista', description: 'Colecao estruturada de itens.', icon: ClipboardList },
];

export type CaptureGridAction =
  | { kind: 'structured'; label: string; description: string; icon: typeof Bell; type: CanonicalEntityType }
  | { kind: 'templates'; label: string; description: string; icon: typeof Bell }
  | { kind: 'inbox'; label: string; description: string; icon: typeof Bell };

export const captureGridOptions: CaptureGridAction[] = [
  { kind: 'structured', type: 'meta', label: 'Meta', description: 'Direcao e resultado esperado.', icon: Flag },
  { kind: 'structured', type: 'projeto', label: 'Projeto', description: 'Frente concreta ligada a uma meta.', icon: ListTodo },
  { kind: 'structured', type: 'tarefa', label: 'Tarefa', description: 'Acao concreta para executar.', icon: CheckSquare },
  { kind: 'structured', type: 'habito', label: 'Habito', description: 'Ciclo recorrente.', icon: HeartPulse },
  { kind: 'structured', type: 'rotina', label: 'Rotina', description: 'Sequencia repetida.', icon: Repeat },
  { kind: 'structured', type: 'evento', label: 'Agenda', description: 'Tempo reservado ou compromisso.', icon: CalendarDays },
  { kind: 'structured', type: 'evento', label: 'Evento', description: 'Compromisso com data e horario.', icon: ClipboardList },
  { kind: 'structured', type: 'lembrete', label: 'Lembrete', description: 'Sinal curto para nao esquecer.', icon: Bell },
  { kind: 'structured', type: 'nota', label: 'Nota', description: 'Registro livre e editavel.', icon: NotebookPen },
  { kind: 'structured', type: 'lista', label: 'Lista', description: 'Colecao estruturada.', icon: Rows3 },
  { kind: 'templates', label: 'Templates', description: 'Modelos reutilizaveis.', icon: Sparkles },
  { kind: 'inbox', label: 'Inbox', description: 'Triagem transitória.', icon: Inbox },
];

export const forbiddenCaptureLabels = ['Idea', 'Essencial protegido', 'Inegociavel', 'IA', 'Arquivados', 'Central', 'Admin', 'Caixola', 'Backlog'] as const;
