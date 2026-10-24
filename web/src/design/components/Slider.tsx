import { useId, useRef, type SyntheticEvent } from 'react';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Optional: Wert nach dem Loslassen (Zeiger hoch oder abgebrochen, Taste los, Fokusverlust, Änderung durch Hilfstechnik), nur wenn er sich geändert hat. */
  onCommit?: (value: number) => void;
  format?: (value: number) => string;
}

export function Slider({ label, value, min, max, step, onChange, onCommit, format }: SliderProps) {
  const id = useId();
  // Zuletzt gemeldeter Wert: Loslassen ohne Änderung meldet nichts.
  const committed = useRef(value);
  // Zeiger oder Taste gedrückt: Änderungen sind Entwurf bis zum Loslassen.
  const holding = useRef(false);
  const hold = onCommit
    ? () => {
        holding.current = true;
      }
    : undefined;
  const commit = onCommit
    ? (e: SyntheticEvent<HTMLInputElement>) => {
        holding.current = false;
        const next = Number(e.currentTarget.value);
        if (next === committed.current) return;
        committed.current = next;
        onCommit(next);
      }
    : undefined;

  return (
    <div className="slider">
      <div className="slider-head">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="slider-value">
          {format ? format(value) : value}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          onChange(Number(e.target.value));
          // Hilfstechnik (Screenreader) ändert ohne Zeiger und Taste: sofort melden.
          if (commit && !holding.current) commit(e);
        }}
        onPointerDown={hold}
        onKeyDown={hold}
        onPointerUp={commit}
        onPointerCancel={commit}
        onKeyUp={commit}
        onBlur={commit}
      />
    </div>
  );
}
