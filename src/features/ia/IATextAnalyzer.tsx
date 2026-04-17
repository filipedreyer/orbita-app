import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { Button, Card } from '../../components/ui';
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
  const { analyzeText, analysisResults } = useIA();
  const analysis = analysisResults[sourceId];
  const plainText = useMemo(() => text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), [text]);

  return (
    <div className="space-y-3">
      <Button variant="secondary" onClick={() => analyzeText(sourceId, sourceLabel, plainText)}>
        <Sparkles className="h-4 w-4" />
        Analisar com IA
      </Button>

      {analysis ? (
        <Card className="space-y-3 p-4">
          <p className="text-sm font-semibold text-[var(--text)]">{analysis.title}</p>
          <p className="text-sm text-[var(--text-secondary)]">{analysis.summary}</p>
          <div className="space-y-2">
            {analysis.highlights.map((highlight) => (
              <div key={highlight} className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                {highlight}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.actions.map((item) => (
              <span key={item} className="rounded-full bg-[var(--teal-light)] px-3 py-1 text-xs font-semibold text-[var(--teal)]">
                {item}
              </span>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
