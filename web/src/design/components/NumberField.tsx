import { useId } from 'react';

interface NumberFieldProps {
  label: string;
  /** Roher Text; die Demo entscheidet, was gültig ist, damit Tippen nicht springt. */
  value: string;
  onChange: (raw: string) => void;
  error?: string | null;
  hint?: string;
  suffix?: string;
}

export function NumberField({ label, value, onChange, error, hint, suffix }: NumberFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  // Fehler zuerst, der Hinweis bleibt sichtbar (etwa „leer lassen …“ beim MDE).
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className="number-field">
      <label htmlFor={id}>{label}</label>
      <div className="number-field-row">
        <input
          id={id}
          className="input"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
        />
        {suffix ? <span className="number-field-suffix">{suffix}</span> : null}
      </div>
      {error ? (
        <p id={errorId} className="field-error">
          {error}
        </p>
      ) : null}
      {hint ? (
        <p id={hintId} className="number-field-hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
