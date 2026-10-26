import { VISITORS } from '../../personalization/visitors';

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (visitorId: string) => void;
}

/** Auswahl des Besuchers, gemeinsam für Demo und „Unter der Haube“. */
export function VisitorSelect({ id, label, value, onChange }: Props) {
  return (
    <div className="rc-field">
      <label htmlFor={id} className="rc-label">
        {label}
      </label>
      <select id={id} className="input" value={value} onChange={(e) => onChange(e.target.value)}>
        {VISITORS.map((v) => (
          <option key={v.id} value={v.id}>
            {v.events.length === 0 ? `${v.name} (neu, ohne Verlauf)` : v.name}
          </option>
        ))}
      </select>
    </div>
  );
}
