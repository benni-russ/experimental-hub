import { formatNumber } from '../../learning/numbers';
import { formatPercent } from './Assumptions';
import { calculateSampleSize } from './sampleSize';

export const MDE_MIN = 0.2;
export const MDE_MAX = 5;
const SAMPLES = 60;

const W = 360;
const H = 220;
const M = { top: 16, right: 14, bottom: 40, left: 62 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;

interface Point {
  mde: number;
  n: number;
}

/** Stichprobe je Variante über den Bereich des Reglers; ungültige Punkte fallen weg. */
export function curvePoints(baseline: number, alpha: number, power: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < SAMPLES; i++) {
    const mde = MDE_MIN + ((MDE_MAX - MDE_MIN) * i) / (SAMPLES - 1);
    const r = calculateSampleSize({ baseline, mde, alpha, power });
    if (r) points.push({ mde, n: r.perVariant });
  }
  return points;
}

export function SampleCurve({
  baseline,
  alpha,
  power,
  mde,
  current,
}: {
  baseline: number;
  alpha: number;
  power: number;
  mde: number;
  /** Personen je Variante am aktuellen Punkt; null bei ungültiger Kombination */
  current: number | null;
}) {
  const points = curvePoints(baseline, alpha, power);
  const first = points[0];
  const last = points[points.length - 1];
  if (!first || !last || points.length < 2) return null;

  // Logarithmische y-Achse: von der Zehnerpotenz unter dem kleinsten bis über dem größten Wert.
  const values = points.map((p) => p.n);
  const lo = Math.floor(Math.log10(Math.min(...values)));
  const hi = Math.max(Math.ceil(Math.log10(Math.max(...values))), lo + 1);
  const x = (v: number) => M.left + ((v - MDE_MIN) / (MDE_MAX - MDE_MIN)) * PLOT_W;
  const y = (v: number) => M.top + (1 - (Math.log10(v) - lo) / (hi - lo)) * PLOT_H;

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.mde).toFixed(1)},${y(p.n).toFixed(1)}`).join(' ');
  const yTicks = Array.from({ length: hi - lo + 1 }, (_, i) => 10 ** (lo + i));
  const xTicks = [1, 2, 3, 4, 5];

  const label =
    `Kurve: Personen je Variante abhängig vom kleinsten Unterschied, bei ${formatPercent(baseline)} Baseline. ` +
    `Bei ${formatNumber(first.mde, 1)} Prozentpunkten ${formatNumber(first.n)}, ` +
    `bei ${formatNumber(last.mde, 1)} Prozentpunkten ${formatNumber(last.n)}.` +
    (current !== null ? ` Aktuell ${formatNumber(mde, 1)} Prozentpunkte: ${formatNumber(current)}.` : '');

  const cx = x(mde);
  const cy = current !== null ? y(current) : 0;
  const labelRight = cx < W - 110;

  return (
    <figure className="mde-curve">
      <figcaption className="mde-curve-caption">
        Personen je Variante (logarithmische Achse: jede Linie bedeutet zehnmal so viele)
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        {yTicks.map((t) => (
          <g key={t}>
            <line className="mde-curve-grid" x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />
            <text className="mde-curve-tick" x={M.left - 6} y={y(t)} textAnchor="end" dominantBaseline="middle">
              {formatNumber(t)}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <text key={t} className="mde-curve-tick" x={x(t)} y={H - M.bottom + 16} textAnchor="middle">
            {formatNumber(t)}
          </text>
        ))}
        <line className="mde-curve-axis" x1={M.left} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} />
        <text className="mde-curve-tick" x={M.left + PLOT_W / 2} y={H - 6} textAnchor="middle">
          Kleinster Unterschied (Prozentpunkte)
        </text>
        <path className="mde-curve-line" d={path} />
        {current !== null ? (
          <g className="mde-curve-current">
            <line className="mde-curve-guide" x1={cx} x2={cx} y1={cy} y2={H - M.bottom} />
            <circle cx={cx} cy={cy} r={6} />
            <text
              className="mde-curve-current-label"
              x={labelRight ? cx + 10 : cx - 10}
              y={Math.max(cy - 10, M.top + 4)}
              textAnchor={labelRight ? 'start' : 'end'}
            >
              {formatNumber(current)}
            </text>
          </g>
        ) : null}
      </svg>
    </figure>
  );
}
