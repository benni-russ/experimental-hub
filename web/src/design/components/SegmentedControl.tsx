interface SegmentedControlProps<T extends string | number> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  /** ID eines sichtbaren Labels; ersetzt dann aria-label, damit es nur einen Namen gibt */
  labelledBy?: string;
  /** ID eines Hinweistexts */
  describedBy?: string;
}

export function SegmentedControl<T extends string | number>({
  label,
  options,
  value,
  onChange,
  labelledBy,
  describedBy,
}: SegmentedControlProps<T>) {
  return (
    <div
      className="segmented"
      role="group"
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
    >
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={o.value === value}
          className="segmented-item"
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
