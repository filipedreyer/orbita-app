export function StepConexoes({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-3 rounded-3xl border border-[var(--border)] bg-white p-5">
      <h4 className="text-lg font-semibold">Conexões positivas</h4>
      <div className="space-y-2">
        {lines.map((line) => (
          <div key={line} className="rounded-2xl bg-[var(--surface-alt)] px-4 py-3 text-sm text-[var(--text-secondary)]">
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}
