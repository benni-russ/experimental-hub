import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '../../design/components/Button';
import { rateMetric, type Rating } from '../../experience/vitals';
import { RATING_WORD, formatNumber } from './insights';
import { RatingTag } from './MetricTiles';
import { BLOCK_DURATIONS, blockFor, measureNextPaint } from './feelTestModel';

interface Run {
  id: number;
  blockMs: number;
  measuredMs: number;
  rating: Rating;
}

const MAX_RUNS = 5;

/**
 * Fühltest: Der Knopf blockiert den Hauptthread wirklich und misst grob, wann das nächste Bild kommt.
 * Während der Blockade sind alle Knöpfe deaktiviert; weitere Klicks stapeln sich nicht.
 */
export function FeelTest() {
  const [running, setRunning] = useState(false);
  const [runs, setRuns] = useState<Run[]>([]);
  const [message, setMessage] = useState('');
  const busy = useRef(false);
  const nextId = useRef(1);
  const frame = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      cancelAnimationFrame(frame.current);
      clearTimeout(timer.current);
    };
  }, []);

  const press = (blockMs: number, e: MouseEvent<HTMLButtonElement>) => {
    if (busy.current) return;
    busy.current = true;
    const button = e.currentTarget;
    // Zeitstempel der Eingabe, falls der Browser ihn auf derselben Uhr liefert; sonst jetzt.
    const now = performance.now();
    const start = e.timeStamp > 0 && e.timeStamp <= now ? e.timeStamp : now;
    // Erst die Knöpfe deaktivieren (sofort ins DOM), dann blockieren.
    flushSync(() => setRunning(true));
    blockFor(blockMs);
    // Nächstes Bild: nach dem Zeichnen im nächsten Frame messen.
    frame.current = requestAnimationFrame(() => {
      timer.current = setTimeout(() => {
        busy.current = false;
        if (!mounted.current) return;
        const measuredMs = measureNextPaint(start, performance.now());
        const rating = rateMetric('inp', measuredMs);
        const run = { id: nextId.current++, blockMs, measuredMs, rating };
        setRuns((prev) => [run, ...prev].slice(0, MAX_RUNS));
        setMessage(`${blockMs}-ms-Aufgabe: nächstes Bild nach ${formatNumber(measuredMs)} ms, ${RATING_WORD[rating]}.`);
        flushSync(() => setRunning(false));
        // Ein deaktivierter Knopf verliert in manchen Browsern den Fokus: zurückgeben.
        if (document.activeElement === null || document.activeElement === document.body) button.focus();
      }, 0);
    });
  };

  return (
    <div className="wv-feel">
      <p className="wv-hint">
        Jeder Knopf hält den Hauptthread deines Browsers so lange beschäftigt, wie er sagt. Gemessen wird grob die Zeit vom Klick bis zum nächsten Bild. Das ist eine
        grobe Messung im eigenen Browser, keine offizielle INP-Messung.
      </p>
      <div className="wv-feel-buttons" role="group" aria-label="Hauptthread blockieren">
        {BLOCK_DURATIONS.map((ms) => (
          <Button key={ms} variant="secondary" disabled={running} onClick={(e) => press(ms, e)}>
            {ms} ms blockieren
          </Button>
        ))}
      </div>
      <p className="visually-hidden" aria-live="polite">
        {message}
      </p>
      {runs.length ? (
        <ul className="wv-runs" aria-label="Letzte Messungen">
          {runs.map((r) => (
            <li key={r.id}>
              <span className="wv-run-text">
                {r.blockMs} ms blockiert: nächstes Bild nach <strong>{formatNumber(r.measuredMs)} ms</strong>
              </span>
              <RatingTag rating={r.rating} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
