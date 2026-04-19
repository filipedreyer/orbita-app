import { Badge, BottomSheet, Card } from '../../components/ui';
import type { IARouteContext } from './types';

export function IAReportDrawer({
  visible,
  onClose,
  context,
}: {
  visible: boolean;
  onClose: () => void;
  context: IARouteContext;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Relatorios contextuais">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-[var(--text)]">{context.routeLabel}</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Leituras curtas desta superficie, variando pelo contexto ja conhecido do produto.</p>
        </div>

        <div className="space-y-3">
          {/* TODO: CLAUDE — conectar relatorios reais por superficie usando helpers estreitos, sem painel generico. */}
          {context.reports.map((report) => (
            <Card key={report.id} className="space-y-3 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">{report.title}</p>
                  <p className="mt-2 text-sm text-[var(--text-secondary)]">{report.summary}</p>
                </div>
                <Badge label="mock" color="var(--teal)" />
              </div>
              <div className="space-y-2">
                {report.highlights.map((highlight) => (
                  <div key={highlight} className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                    {highlight}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}
