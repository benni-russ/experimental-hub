import { Fragment, useEffect, useState } from 'react';

export interface FormulaTerm {
  id: string;
  /** Bezeichnung im Detailfeld, z. B. „p₁ · Rate heute“ */
  label: string;
  /** Eingesetzter Wert als Code-Zeile */
  value: string;
  /** Ein bis zwei Sätze */
  explanation: string;
  /** Regler oder Feld auf der Seite, das zum Term gehört */
  control?: string;
}

/** Text oder Term; `term` ist ein Schlüssel in `terms`, `text` steht auf dem Knopf. */
export type FormulaPart = string | { term: string; text: string };

/**
 * Formel aus Text und bedienbaren Termen. Genau ein Term ist aktiv (Start: der erste im Zähler);
 * das Detailfeld darunter nennt Bezeichnung, Wert und Erklärung. `onActiveChange` meldet den
 * zugehörigen Regler, damit die Seite ihn hervorheben kann.
 */
export function InteractiveFormula({
  ariaLabel,
  lead,
  numerator,
  denominator,
  terms,
  onActiveChange,
}: {
  ariaLabel: string;
  lead: string;
  numerator: FormulaPart[];
  denominator?: FormulaPart[];
  terms: Record<string, FormulaTerm>;
  onActiveChange?: (control: string | undefined) => void;
}) {
  // Start: erster Teil mit vorhandenem Schlüssel, erst Zähler, dann Nenner
  const firstTerm = [...numerator, ...(denominator ?? [])].find((p) => typeof p !== 'string' && p.term in terms);
  const [activeId, setActiveId] = useState<string | undefined>(
    typeof firstTerm === 'object' ? firstTerm.term : undefined,
  );
  const active = activeId ? terms[activeId] : undefined;

  // Start-Term einmal melden. StrictMode ruft das zweimal auf, gesetzt wird derselbe Wert.
  useEffect(() => {
    onActiveChange?.(active?.control);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nur beim Einhängen
  }, []);

  // Ansage nur bei Fokus, Klick oder Tippen; Überfahren mit der Maus hebt nur hervor.
  const [announcement, setAnnouncement] = useState('');

  const activate = (id: string, announce: boolean) => {
    setActiveId(id);
    onActiveChange?.(terms[id]?.control);
    const t = terms[id];
    if (announce && t) setAnnouncement(`${t.label}: ${t.value}. ${t.explanation}`);
  };

  const renderParts = (parts: FormulaPart[]) =>
    parts.map((part, i) => {
      if (typeof part === 'string') return <Fragment key={i}>{part}</Fragment>;
      // Fehlender Schlüssel ist ein Programmierfehler: als Text zeigen statt abstürzen.
      if (!terms[part.term]) return <Fragment key={i}>{part.text}</Fragment>;
      const isActive = part.term === activeId;
      return (
        <button
          key={i}
          type="button"
          className={`formula-term${isActive ? ' is-active' : ''}`}
          aria-pressed={isActive}
          onClick={() => activate(part.term, true)}
          onFocus={() => activate(part.term, true)}
          onMouseEnter={() => activate(part.term, false)}
        >
          {part.text}
        </button>
      );
    });

  return (
    <div className="interactive-formula">
      <div className="formula-equation" role="group" aria-label={ariaLabel}>
        <span className="formula-lead">{lead}</span>
        {denominator ? (
          <span className="formula-fraction">
            <span className="formula-numerator">{renderParts(numerator)}</span>
            <span className="formula-denominator">{renderParts(denominator)}</span>
          </span>
        ) : (
          <span className="formula-line">{renderParts(numerator)}</span>
        )}
      </div>
      <p className="visually-hidden" aria-live="polite">
        {announcement}
      </p>
      <div className="formula-detail">
        {active ? (
          <>
            <strong>{active.label}</strong>
            <code>{active.value}</code>
            <p>{active.explanation}</p>
          </>
        ) : null}
      </div>
    </div>
  );
}
