import { useMemo, useState } from 'react';
import { InsightBox } from '../../design/components/InsightBox';
import { FIELD_VISITS, REFERENCE, rateMetric, simulateLoad, type VitalsFixes } from '../../experience/vitals';
import { FeelTest } from './FeelTest';
import { FieldStrip } from './FieldStrip';
import { FixList } from './FixList';
import { METRICS, METRIC_NAME, RATING_WORD, formatMetric, insightContent, vitalsInsights } from './insights';
import { MetricTiles } from './MetricTiles';
import { Timeline } from './Timeline';
import { Waterfall } from './Waterfall';
import './webVitals.css';

/** Satz für die Live-Region: alle drei Werte mit Stufe. */
function announce(fixes: VitalsFixes): string {
  const load = simulateLoad(fixes, REFERENCE);
  return METRICS.map((m) => `${METRIC_NAME[m]} ${formatMetric(m, load[m])}, ${RATING_WORD[rateMetric(m, load[m])]}`).join('; ') + '.';
}

// Eine Produktseite auf dem Referenzprofil, sieben Gegenmittel, Zeitleiste, Wasserfall, Feld und
// Fühltest. Jeder Besuch startet ohne Gegenmittel; nichts wird gespeichert.
export default function Demo() {
  const [fixes, setFixes] = useState<VitalsFixes>({});
  const [message, setMessage] = useState('');
  const load = useMemo(() => simulateLoad(fixes, REFERENCE), [fixes]);
  const insights = vitalsInsights(fixes);

  const change = (next: VitalsFixes) => {
    setFixes(next);
    setMessage(announce(next));
  };

  return (
    <div className="wv-demo">
      <section className="wv-section" aria-labelledby="wv-h-metrics">
        <h3 id="wv-h-metrics">Drei Kennzahlen, gemessen im Labor</h3>
        <p className="wv-hint">
          Eine Produktseite lädt auf dem Referenzprofil {REFERENCE.label}. Schalte Gegenmittel an und sieh zu, welche Zahl sich bewegt.
        </p>
        <MetricTiles load={load} />
        <p className="visually-hidden" aria-live="polite">
          {message}
        </p>
      </section>

      <section className="wv-section" aria-label="Gegenmittel und Erkenntnisse">
        <FixList fixes={fixes} onChange={change} />
        {insights.map((i) => {
          const c = insightContent(i, fixes);
          return (
            <InsightBox key={i} title={c.title}>
              {c.text}
            </InsightBox>
          );
        })}
      </section>

      <section className="wv-section" aria-labelledby="wv-h-timeline">
        <h3 id="wv-h-timeline">Die Seite entsteht</h3>
        <Timeline load={load} fixes={fixes} />
      </section>

      <section className="wv-section" aria-labelledby="wv-h-waterfall">
        <h3 id="wv-h-waterfall">Wasserfall</h3>
        <p className="wv-hint">Jede Datei braucht eine Wartezeit und dann ihre Größe geteilt durch die Leitung. Das CSS hält das erste Bild auf.</p>
        <Waterfall load={load} />
      </section>

      <section className="wv-section" aria-labelledby="wv-h-field">
        <h3 id="wv-h-field">Labor gegen Feld</h3>
        <p className="wv-hint">
          Das Labor ist ein Ladevorgang auf einem festen Profil. Im Feld kommen {FIELD_VISITS.length} Besuche auf ganz verschiedenen Geräten und Leitungen; jeder Punkt ist einer davon.
        </p>
        <FieldStrip fixes={fixes} />
      </section>

      <section className="wv-section" aria-labelledby="wv-h-feel">
        <h3 id="wv-h-feel">Fühltest: Wie fühlt sich INP an?</h3>
        <FeelTest />
      </section>
    </div>
  );
}
