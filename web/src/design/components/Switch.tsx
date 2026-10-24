interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/** Ein-/Aus-Schalter: sichtbares Label, Schiebeknopf und der Text „An“/„Aus“. */
export function Switch({ label, checked, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className="switch"
      onClick={() => onChange(!checked)}
    >
      <span className="switch-label">{label}</span>
      <span className="switch-track" aria-hidden="true">
        <span className="switch-thumb" />
      </span>
      {/* Der Zustand kommt aus aria-checked; das Wort nur fürs Auge, sonst doppelt angesagt */}
      <span className="switch-state" aria-hidden="true">{checked ? 'An' : 'Aus'}</span>
    </button>
  );
}
