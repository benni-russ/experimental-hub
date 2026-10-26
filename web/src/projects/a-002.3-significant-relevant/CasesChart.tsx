import { formatNumber } from '../../learning/numbers';
import { CASES, CASES_LABEL, MDE } from './cases';

const W = 360;
const ROW = 50;
const M = { top: 26, right: 18, bottom: 42, left: 18 };
const H = M.top + CASES.length * ROW + M.bottom;
const PLOT_W = W - M.left - M.right;
const MIN = -1;
const MAX = 3;
const x = (v: number) => M.left + ((v - MIN) / (MAX - MIN)) * PLOT_W;
const BOTTOM = M.top + CASES.length * ROW;

/** Vier Intervalle gegen Null- und MDE-Linie; die Lage zu den Linien entscheidet den Fall. */
export function CasesChart() {
  return (
    <figure className="sig-figure">
      <figcaption className="sig-caption">Unterschied B − A in Prozentpunkten, Intervall je Fall</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={CASES_LABEL}>
        <line className="sig-null" x1={x(0)} x2={x(0)} y1={M.top - 8} y2={BOTTOM} />
        <line className="sig-mde" x1={x(MDE)} x2={x(MDE)} y1={M.top - 8} y2={BOTTOM} />
        <text className="sig-tick" x={x(0)} y={M.top - 12} textAnchor="end">
          Null
        </text>
        <text className="sig-tick" x={x(MDE)} y={M.top - 12} textAnchor="start">
          MDE
        </text>

        {CASES.map((c, i) => {
          const top = M.top + i * ROW;
          const mid = top + 32;
          return (
            <g key={c.id}>
              <text className="sig-case-label" x={M.left} y={top + 14}>
                {i + 1}. {c.label}
              </text>
              <line className="sig-interval" x1={x(c.lower)} x2={x(c.upper)} y1={mid} y2={mid} />
              <line className="sig-cap" x1={x(c.lower)} x2={x(c.lower)} y1={mid - 6} y2={mid + 6} />
              <line className="sig-cap" x1={x(c.upper)} x2={x(c.upper)} y1={mid - 6} y2={mid + 6} />
            </g>
          );
        })}

        <line className="sig-axis" x1={M.left} x2={W - M.right} y1={BOTTOM + 4} y2={BOTTOM + 4} />
        {[-1, 0, 1, 2, 3].map((t) => (
          <text key={t} className="sig-tick" x={x(t)} y={BOTTOM + 20} textAnchor="middle">
            {t < 0 ? `−${formatNumber(-t)}` : formatNumber(t)}
          </text>
        ))}
      </svg>
    </figure>
  );
}
