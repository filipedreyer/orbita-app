interface PillOption {
  key: string;
  label: string;
  color?: string;
}

export function PillSelector({
  options,
  selected,
  onSelect,
  allowNull,
}: {
  options: PillOption[];
  selected: string | null;
  onSelect: (key: string | null) => void;
  allowNull?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isActive = option.key === selected;
        const activeStyles = option.color
          ? { backgroundColor: option.color, borderColor: option.color, color: '#fff' }
          : undefined;

        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onSelect(isActive && allowNull ? null : option.key)}
            className="min-h-9 rounded-full border border-[var(--border)] px-4 py-2 text-sm transition"
            style={isActive ? activeStyles : undefined}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
