import { Metric } from '../../design/components/Metric';
import type { LoadResult, Rating } from '../../experience/vitals';
import { rateMetric } from '../../experience/vitals';
import { METRICS, METRIC_NAME, RATING_WORD, formatMetric, thresholdText } from './insights';

const LONG_NAME = { lcp: 'größtes Element gezeichnet', cls: 'Verrutschen', inp: 'Reaktion auf den Klick' } as const;

// Gezeichnetes Zeichen je Stufe im Strichmaß der App: Haken, Ausrufezeichen, Kreuz. Keine
// Schriftglyphen (DESIGN.md); das Wort steht immer daneben.
export function RatingMark({ rating }: { rating: Rating }) {
  return (
    <svg className="wv-mark" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      {rating === 'good' ? <path d="M2 6.5l2.5 2.5L10 3" /> : null}
      {rating === 'needsImprovement' ? <path d="M6 1.75v5.5M6 10.25v0.01" /> : null}
      {rating === 'poor' ? <path d="M2.75 2.75l6.5 6.5M9.25 2.75l-6.5 6.5" /> : null}
    </svg>
  );
}

/** Stufe als Pille mit Zeichen und Wort; die Farbe hilft nur beim Überfliegen. */
export function RatingTag({ rating }: { rating: Rating }) {
  return (
    <span className={`tag wv-rating is-${rating}`}>
      <RatingMark rating={rating} /> {RATING_WORD[rating]}
    </span>
  );
}

/** Drei Kacheln: Wert, Stufe und die Grenzwerte als Referenz. */
export function MetricTiles({ load }: { load: LoadResult }) {
  return (
    <ul className="wv-tiles" aria-label="Kennzahlen auf dem Referenzprofil">
      {METRICS.map((m) => (
        <li key={m} className="wv-tile">
          <Metric label={`${METRIC_NAME[m]} · ${LONG_NAME[m]}`} value={formatMetric(m, load[m])} hint={thresholdText(m)} />
          <RatingTag rating={rateMetric(m, load[m])} />
        </li>
      ))}
    </ul>
  );
}
