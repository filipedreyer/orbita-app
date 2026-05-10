import { Badge, Card } from '../../components/ui';
import type { IAOutputDescriptor } from './types';

const outputLabel: Record<IAOutputDescriptor['kind'], string> = {
  leitura: 'Leitura',
  sugestao: 'Sugestao',
  relatorio: 'Relatorio',
  acao_proposta: 'Acao proposta',
};

export function IAOutputRenderer({ output }: { output: IAOutputDescriptor }) {
  return (
    <Card className="space-y-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">{output.title}</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{output.body}</p>
        </div>
        <Badge label={outputLabel[output.kind]} tone="project" />
      </div>
    </Card>
  );
}

