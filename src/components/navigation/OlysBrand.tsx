const OLYS_BRAND_ASSET_SRC: string | null = null;

export function OlysBrand() {
  if (OLYS_BRAND_ASSET_SRC) {
    return <img src={OLYS_BRAND_ASSET_SRC} alt="Olys" className="h-8 w-auto" />;
  }

  return (
    <div className="flex items-center gap-2" aria-label="Olys">
      <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--accent)] text-sm font-bold text-white">
        O
      </span>
      <span className="text-lg font-bold text-[var(--text)]">Olys</span>
    </div>
  );
}
