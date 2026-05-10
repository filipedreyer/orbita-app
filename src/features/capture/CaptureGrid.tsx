import { CaptureTypeTile } from './CaptureTypeTile';
import type { CaptureGridAction } from './capture-types';
import { captureGridOptions } from './capture-types';

export function CaptureGrid({ onSelect }: { onSelect: (option: CaptureGridAction) => void }) {
  return (
    <section className="space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">Criacao tipada</p>
        <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">Escolha explicitamente um destino quando a captura ja tiver forma.</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {captureGridOptions.map((option) => (
          <CaptureTypeTile key={`${option.kind}:${option.label}`} option={option} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}

