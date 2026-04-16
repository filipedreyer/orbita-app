export function StepDiario({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-3 rounded-3xl border border-[var(--border)] bg-white p-5">
      <h4 className="text-lg font-semibold">Registro livre</h4>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Como foi seu dia?"
        className="min-h-40 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-alt)] px-4 py-3 text-sm"
      />
    </div>
  );
}
