import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { mountClassic } from './classicBuilder';
import { Protocol } from './Protocol';

interface ClassicPanelProps {
  forgetTotal: boolean;
}

/**
 * Hülle für den klassischen Builder. React rendert nur den leeren Container;
 * darin schreibt mountClassic von Hand. Das Aufräumen in useEffect hält auch
 * den doppelten Aufbau im StrictMode aus.
 */
export function ClassicPanel({ forgetTotal }: ClassicPanelProps) {
  const id = useId();
  const hostRef = useRef<HTMLDivElement>(null);
  // Dasselbe Objekt für die ganze Lebenszeit: mountClassic liest es bei jeder Eingabe neu.
  const options = useRef({ forgetTotal });
  const [groups, setGroups] = useState<string[][]>([]);

  useLayoutEffect(() => {
    options.current.forgetTotal = forgetTotal;
  }, [forgetTotal]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let pending: string[] | null = null;
    // Alle Zeilen eines Klicks kommen synchron; eine Microtask fasst sie zu einer Eingabe zusammen.
    const log = (line: string) => {
      if (!pending) {
        const group: string[] = [];
        pending = group;
        queueMicrotask(() => {
          pending = null;
          if (!disposed) setGroups((prev) => [...prev, group]);
        });
      }
      pending.push(line);
    };
    const dispose = mountClassic(host, log, options.current);
    return () => {
      disposed = true;
      dispose();
    };
  }, []);

  const last = groups.at(-1) ?? null;
  const total = groups.reduce((n, g) => n + g.length, 0);

  return (
    <section className="rebuild-panel" aria-labelledby={id}>
      <header className="rebuild-panel-head">
        <h3 id={id}>Klassisch</h3>
        <p className="rebuild-muted">Vanilla-JS: liest und schreibt das DOM direkt.</p>
        {/* Die Status-Region steht immer da, damit das Ein- und Ausschalten angesagt wird. */}
        <div role="status">
          {forgetTotal ? (
            <p className="rebuild-flag">
              <span aria-hidden="true">⚠ </span>Fehler eingebaut: Die Summe wird nicht neu geschrieben.
            </p>
          ) : null}
        </div>
      </header>
      <div ref={hostRef} className="rebuild-cart" />
      <Protocol
        pattern="Feld gelesen → Zeile eingefügt → Summe neu geschrieben"
        lines={last}
        count={`Schreibzugriffe ins DOM bisher: ${total}`}
        announcement={last ? `Klassisch, ${last.length} Schreibzugriffe: ${last.join('; ')}.` : ''}
      />
    </section>
  );
}
