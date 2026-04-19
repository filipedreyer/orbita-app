import { Bot, FileText } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import { useIA } from './useIA';

export function IAEntryPoints({
  eyebrow = 'IA contextual',
  title,
  description,
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  compact?: boolean;
}) {
  const { openChat, openReports, routeContext } = useIA();
  const hasReports = routeContext.reports.length > 0;

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={openChat}>
          <Bot className="h-4 w-4" />
          Abrir chat
        </Button>
        {hasReports ? (
          <Button variant="ghost" onClick={openReports}>
            <FileText className="h-4 w-4" />
            Ver relatorios
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <Card className="space-y-3 p-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">{eyebrow}</p>
        <p className="mt-1 text-sm font-semibold text-[var(--text)]">{title}</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" onClick={openChat}>
          <Bot className="h-4 w-4" />
          Abrir chat
        </Button>
        {hasReports ? (
          <Button variant="ghost" onClick={openReports}>
            <FileText className="h-4 w-4" />
            Ver relatorios
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
