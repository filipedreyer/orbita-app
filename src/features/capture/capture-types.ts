import { Bell, CheckSquare, ClipboardList, Flag, HeartPulse, Lightbulb, ListTodo, NotebookPen, Repeat, ShieldCheck } from 'lucide-react';
import type { EntityType } from '../../lib/types';

export interface StructuredCaptureTypeOption {
  type: EntityType;
  label: string;
  description: string;
  icon: typeof Bell;
}

export const structuredCaptureTypeOptions: StructuredCaptureTypeOption[] = [
  { type: 'tarefa', label: 'Tarefa', description: 'Acao concreta para executar.', icon: CheckSquare },
  { type: 'lembrete', label: 'Lembrete', description: 'Sinal curto para nao esquecer.', icon: Bell },
  { type: 'evento', label: 'Evento', description: 'Compromisso com data e horario.', icon: ClipboardList },
  { type: 'nota', label: 'Nota', description: 'Registro livre e editavel.', icon: NotebookPen },
  { type: 'ideia', label: 'Ideia', description: 'Insight ainda sem compromisso.', icon: Lightbulb },
  { type: 'meta', label: 'Meta', description: 'Direcao e resultado esperado.', icon: Flag },
  { type: 'projeto', label: 'Projeto', description: 'Frente concreta ligada a uma meta.', icon: ListTodo },
  { type: 'habito', label: 'Habito', description: 'Ciclo recorrente para sustentar o sistema.', icon: HeartPulse },
  { type: 'rotina', label: 'Rotina', description: 'Sequencia repetida de atividades.', icon: Repeat },
  { type: 'lista', label: 'Lista', description: 'Colecao estruturada de itens.', icon: ClipboardList },
  { type: 'inegociavel', label: 'Inegociavel', description: 'Restricao estrutural do sistema.', icon: ShieldCheck },
];
