import { formatNumber } from '../../learning/numbers';
import { standardError } from './standardError';

const W = 360;
const H = 190;
const M = { top: 16, right: 18, bottom: 40, left: 18 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;
const MIN = 7;
const MAX = 13;
const CENTER = 10;
const STEPS = 80;

const x = (v: number) => M.left + ((v - MIN) / (MAX - MIN)) * PLOT_W;

/** Glockenkurve um die Mitte; die Fläche ist 1, deshalb ist die schmale Kurve höher. */
function curve(sd: number, peak: number): string {
  const pts: string[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const v = MIN + ((MAX - MIN) * i) / STEPS;
    const density = Math.exp(-0.5 * ((v - CENTER) / sd) ** 2) / sd;
    const y = M.top + PLOT_H - (density / peak) * PLOT_H;
    pts.push(`${i === 0 ? 'M' : 'L'}${x(v).toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(' ');
}

/** Zwei Verteilungen derselben wahren Rate: wenige Besucher breit, viele schmal. */
export function RatesChart() {
  const wide = standardError(0.1, 1000);
  const narrow = standardError(0.1, 4000);
  const peak = (1 / narrow) * 1.05;
  const label =
    `Zwei Glockenkurven mit gleicher Mitte bei 10 %. Die breite Kurve zeigt, wie stark eine gemessene Rate bei 1.000 Besuchern streut ` +
    `(Standardfehler ${formatNumber(wide, 2)} Prozentpunkte), die schmale bei 4.000 Besuchern (${formatNumber(narrow, 2)} Prozentpunkte). ` +
    `Mit mehr Besuchern liegt die Messung näher an der wahren Rate.`;

  return (
    <figure className="rnd-figure">
      <figcaption className="rnd-caption">Gemessene Rate bei wahrer Rate von 10 %</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        <line className="rnd-axis" x1={M.left} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} />
        <line className="rnd-center" x1={x(CENTER)} x2={x(CENTER)} y1={M.top} y2={H - M.bottom} />
        <path className="rnd-wide" d={curve(wide, peak)} />
        <path className="rnd-narrow" d={curve(narrow, peak)} />
        {[7, 8, 9, 10, 11, 12, 13].map((t) => (
          <text key={t} className="rnd-tick" x={x(t)} y={H - M.bottom + 16} textAnchor="middle">
            {formatNumber(t)} %
          </text>
        ))}
        <text className="rnd-label rnd-label-narrow" x={x(CENTER) + 22} y={M.top + 14}>
          4.000 Besucher
        </text>
        <text className="rnd-label rnd-label-wide" x={x(11.9)} y={M.top + PLOT_H - 38} textAnchor="middle">
          1.000 Besucher
        </text>
        <text className="rnd-tick" x={W / 2} y={H - 6} textAnchor="middle">
          Gemessene Rate
        </text>
      </svg>
    </figure>
  );
}
