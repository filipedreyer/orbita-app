import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { Badge, Button, Card } from '../../components/ui';
import { useIA } from './useIA';

export function IATextAnalyzer({
  sourceId,
  sourceLabel,
  text,
}: {
  sourceId: string;
  sourceLabel: string;
  text: string;
}) {
  const { analyzeText, analysisResults, createFromAnalysis, ignoreAnalysisSuggestion } = useIA();
  const analysis = analysisResults[sourceId];
  const plainText = useMemo(() => text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), [text]);

  const confidenceLabel: Record<'low' | 'medium' | 'high', string> = {
    low: 'Baixa',
    medium: 'Media',
    high: 'Alta',
  };

  const typeColor: Record<'tarefa' | 'lembrete' | 'nota', string> = {
    tarefa: 'var(--accent-purple)',
    lembrete: 'var(--accent-amber)',
    nota: 'var(--accent-teal)',
  };

  return (
    <div className="space-y-3">
      <Button variant="secondary" onClick={() => void analyzeText(sourceId, sourceLabel, plainText)} disabled={!plainText}>
        <Sparkles className="h-4 w-4" />
        Analisar
      </Button>

      {analysis?.suggestions.length ? (
        <Card className="space-y-3 p-4">
          <p className="text-sm font-semibold text-[var(--text)]">Sugestoes extraidas</p>
          <div className="space-y-3">
            {analysis.suggestions.map((suggestion) => (
              <div
                key={`${suggestion.type}:${suggestion.title}`}
                className="space-y-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-alt)] p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge label={suggestion.type} color={typeColor[suggestion.type]} />
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--text-secondary)]">
                    Confianca {confidenceLabel[suggestion.confidence]}
                  </span>
                </div>
                <p className="text-sm font-medium text-[var(--text)]">{suggestion.title}</p>
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => void createFromAnalysis(sourceId, suggestion)}>
                    Revisar criacao
                  </Button>
                  <Button className="flex-1" variant="ghost" onClick={() => ignoreAnalysisSuggestion(sourceId, suggestion.title)}>
                    Ignorar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
