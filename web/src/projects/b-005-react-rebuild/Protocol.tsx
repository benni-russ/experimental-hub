import { useId } from 'react';

interface ProtocolProps {
  /** Ablauf jeder Eingabe, z. B. „Aktion → neuer Zustand → Ansicht neu berechnet“ */
  pattern: string;
  /** Zeilen der letzten Eingabe; null vor der ersten */
  lines: string[] | null;
  /** Zähler unter der Liste, z. B. „Schreibzugriffe ins DOM bisher: 4“ */
  count: string;
  /** Text für die Ansage nach jeder Eingabe */
  announcement: string;
}

/** Protokoll-Leiste unter einem Panel: was bei der letzten Eingabe passiert ist. */
export function Protocol({ pattern, lines, count, announcement }: ProtocolProps) {
  const id = useId();
  return (
    <section className="rebuild-protocol" aria-labelledby={id}>
      <h4 id={id}>Protokoll</h4>
      <p className="rebuild-pattern">
        <span className="rebuild-muted">Bei jeder Eingabe: </span>
        {pattern}
      </p>
      {lines ? (
        <ol className="rebuild-protocol-list" data-role="protocol" aria-label="Letzte Eingabe">
          {lines.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      ) : (
        <p className="rebuild-muted">Noch keine Eingabe.</p>
      )}
      <p className="rebuild-count" data-role="count">
        {count}
      </p>
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </section>
  );
}
