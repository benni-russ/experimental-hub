import { InsightBox } from '../../design/components/InsightBox';
import { THRESHOLDS, type MetricName, type VitalsFixes } from '../../experience/vitals';
import { METRIC_NAME, fieldInsightText, fieldMetrics, formatMetric, type FieldMetric } from './insights';
import { RatingTag } from './MetricTiles';

// Feste Achsen, damit sich die Punktreihen beim Umschalten vergleichen lassen. Werte darüber
// stehen am Rand mit Pfeil und werden im Text gezählt.
export const AXIS_MAX: Record<MetricName, number> = { lcp: 10, cls: 0.4, inp: 1200 };

const W = 320;
const X0 = 12;
const X1 = 308;
const R = 4;

const besuch = (n: number) => (n === 1 ? '1 Besuch' : `${n} Besuche`);

/** Wie viele Werte über dem Achsenende liegen. */
export function clippedCount(m: FieldMetric): number {
  return m.values.filter((v) => v > AXIS_MAX[m.metric]).length;
}

function Strip({ m }: { m: FieldMetric }) {
  const max = AXIS_MAX[m.metric];
  const x = (v: number) => X0 + (Math.min(v, max) / max) * (X1 - X0);
  const anchor = (px: number): 'start' | 'middle' | 'end' => (px < 50 ? 'start' : px > W - 50 ? 'end' : 'middle');

  // Gleiche Werte (gleiche Profile) übereinander stapeln.
  const seen = new Map<number, number>();
  const stacked = m.values.map((v) => {
    const key = Math.round(x(v));
    const level = seen.get(key) ?? 0;
    seen.set(key, level + 1);
    return { v, level };
  });
  // Die Achse rückt so weit nach unten, dass der höchste Stapel und die Beschriftung darüber passen.
  const maxLevel = Math.max(...stacked.map((d) => d.level));
  const BASE = Math.max(64, 30 + (maxLevel + 1) * (2 * R + 1));
  const H = BASE + 40;
  const dots = stacked.map(({ v, level }) => ({ v, cx: x(v), cy: BASE - R - 1 - level * (2 * R + 1), clipped: v > max }));
  const top = Math.min(...dots.map((d) => d.cy)) - R;
  const p75x = x(m.p75);
  const refx = x(m.reference);
  const clipped = clippedCount(m);
  const t = THRESHOLDS[m.metric];

  const label =
    `${METRIC_NAME[m.metric]} der ${m.values.length} Besuche von ${formatMetric(m.metric, Math.min(...m.values))} bis ${formatMetric(m.metric, Math.max(...m.values))}. ` +
    `75. Perzentil ${formatMetric(m.metric, m.p75)}, Referenzprofil ${formatMetric(m.metric, m.reference)}.` +
    (clipped ? ` ${besuch(clipped)} über ${formatMetric(m.metric, max)} am rechten Rand.` : '');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="wv-strip-svg">
      {/* Bereiche gut, verbessern, schlecht als feine Linie unter der Achse */}
      <line x1={X0} y1={BASE + 6} x2={x(t.good)} y2={BASE + 6} className="wv-band is-good" />
      <line x1={x(t.good)} y1={BASE + 6} x2={x(t.poor)} y2={BASE + 6} className="wv-band is-needsImprovement" />
      <line x1={x(t.poor)} y1={BASE + 6} x2={X1} y2={BASE + 6} className="wv-band is-poor" />
      <line x1={X0} y1={BASE} x2={X1} y2={BASE} className="wv-axis" />
      {dots.map((d, i) =>
        d.clipped ? (
          <path key={i} d={`M${d.cx - R} ${d.cy - R}l${R * 2} ${R}l${-R * 2} ${R}z`} className="wv-dot is-clipped" />
        ) : (
          <circle key={i} cx={d.cx} cy={d.cy} r={R} className="wv-dot" />
        ),
      )}
      <line x1={p75x} y1={Math.min(top, BASE - 22) - 4} x2={p75x} y2={BASE + 10} className="wv-p75" />
      <text x={p75x} y={Math.min(top, BASE - 22) - 8} textAnchor={anchor(p75x)} className="wv-svg-label wv-svg-strong">
        75. Perzentil {formatMetric(m.metric, m.p75)}
      </text>
      <path d={`M${refx} ${BASE + 10}l-4 7h8z`} className="wv-ref" />
      <text x={refx} y={BASE + 30} textAnchor={anchor(refx)} className="wv-svg-label">
        Referenz {formatMetric(m.metric, m.reference)}
      </text>
      <text x={X0} y={H - 2} className="wv-svg-muted">
        0
      </text>
      <text x={X1} y={H - 2} textAnchor="end" className="wv-svg-muted">
        {formatMetric(m.metric, max)}
      </text>
    </svg>
  );
}

/** Labor gegen Feld: 20 Besuche je Kennzahl, ihr 75. Perzentil und der Wert des Referenzprofils. */
export function FieldStrip({ fixes }: { fixes: VitalsFixes }) {
  const metrics = fieldMetrics(fixes);
  return (
    <div className="wv-field">
      <ul className="wv-strips">
        {metrics.map((m) => {
          const clipped = clippedCount(m);
          return (
            <li key={m.metric} className="wv-strip">
              <div className="wv-strip-head">
                <span className="wv-strip-name">{METRIC_NAME[m.metric]} im Feld</span>
                <RatingTag rating={m.rating} />
              </div>
              <Strip m={m} />
              {clipped ? (
                <p className="wv-hint">
                  {besuch(clipped)} über {formatMetric(m.metric, AXIS_MAX[m.metric])}, am rechten Rand als Pfeil. Der langsamste: {formatMetric(m.metric, Math.max(...m.values))}.
                </p>
              ) : null}
            </li>
          );
        })}
      </ul>
      <InsightBox title="Labor gegen Feld">{fieldInsightText(fixes)}</InsightBox>
    </div>
  );
}
