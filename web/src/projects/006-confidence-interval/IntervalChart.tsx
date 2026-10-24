import { formatDifference, formatNumber, formatSigned, isWhole } from '../../learning/numbers';
import { formatMde } from './format';

export interface ChartRow {
  estimate: number;
  lower: number;
  upper: number;
  /** false = verfehlt die Wahrheit (hohl gezeichnet); undefined = keine Wahrheit bekannt */
  covers?: boolean;
}

export interface Axis {
  min: number;
  max: number;
}

/**
 * Symmetrische Achse um 0: schließt das Intervall, die Null und den MDE ein, mit Rand.
 * Die Spanne bleibt auch bei Breite 0 (beide Gruppen 0 % oder 100 %) von null verschieden.
 */
export function symmetricAxis(lower: number, upper: number, mde: number | null): Axis {
  const extent = Math.max(Math.abs(lower), Math.abs(upper), mde !== null ? Math.abs(mde) : 0);
  const half = Math.max(extent * 1.2, 0.2);
  return { min: -half, max: half };
}

const STEPS = [0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 50];
function ticksFor(axis: Axis): number[] {
  const span = axis.max - axis.min;
  const step = STEPS.find((s) => span / s <= 7) ?? 100;
  const ticks: number[] = [];
  for (let t = Math.ceil(axis.min / step) * step; t <= axis.max + 1e-9; t += step) {
    ticks.push(Math.abs(t) < 1e-9 ? 0 : Math.round(t * 1e6) / 1e6);
  }
  return ticks;
}

/** Kleine Pfeilspitze am Achsenrand: das Intervall läuft weiter. */
const arrow = (cx: number, cy: number, dir: 1 | -1) =>
  `${cx},${cy} ${cx - dir * 6},${cy - 3.5} ${cx - dir * 6},${cy + 3.5}`;

// Breite 360 wie 004: Auf 375 px Bildschirm bleibt die Schrift ≥ 12 px.
const W = 360;
const M = { top: 38, right: 14, bottom: 42, left: 14 };
const PLOT_W = W - M.left - M.right;

export function IntervalChart({
  rows,
  axis,
  truth = null,
  mde = null,
  description,
}: {
  rows: ChartRow[];
  axis: Axis;
  /** wahrer Unterschied in Prozentpunkten, falls bekannt */
  truth?: number | null;
  mde?: number | null;
  /** Satz mit Anzahl und Treffern; die Achse ergänzt das Diagramm selbst */
  description: string;
}) {
  const span = axis.max - axis.min || 1;
  const pitch = Math.min(rows.length <= 1 ? 40 : 16, 440 / Math.max(rows.length, 1));
  const plotH = Math.max(rows.length, 1) * pitch;
  const H = M.top + plotH + M.bottom;
  const clamp = (v: number) => Math.min(Math.max(v, axis.min), axis.max);
  const x = (v: number) => M.left + ((clamp(v) - axis.min) / span) * PLOT_W;
  const y = (i: number) => M.top + pitch * (i + 0.5);
  const r = Math.min(4.5, pitch / 2.1);
  const bottom = M.top + plotH;
  const ticks = ticksFor(axis);

  // Beschriftungen oben; liegen Wahrheit und MDE eng beieinander, rückt die zweite eine Zeile höher.
  const labelled: { key: string; at: number; text: string; row: number }[] = [];
  if (truth !== null) labelled.push({ key: 'truth', at: truth, text: `wahr: ${formatDifference(truth, 0)}`, row: 0 });
  if (mde !== null) {
    const close = truth !== null && Math.abs(x(mde) - x(truth)) < 70;
    labelled.push({ key: 'mde', at: mde, text: `MDE: ${formatMde(mde)}`, row: close ? 1 : 0 });
  }

  const overflowing = rows.filter((row) => row.lower < axis.min || row.upper > axis.max).length;
  const overflowNote =
    overflowing > 0
      ? ` ${formatNumber(overflowing)} ${overflowing === 1 ? 'Intervall reicht' : 'Intervalle reichen'} über die Achse hinaus, markiert mit Pfeilspitze.`
      : '';
  const label = `${description}${overflowNote} Achse von ${formatSigned(axis.min, 1)} bis ${formatSigned(axis.max, 1)} Prozentpunkte.`;

  return (
    <figure className="ci-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="ci-grid" x1={x(t)} x2={x(t)} y1={M.top} y2={bottom} />
            <text className="ci-tick" x={x(t)} y={bottom + 16} textAnchor="middle">
              {formatSigned(t, isWhole(t) ? 0 : 1)}
            </text>
          </g>
        ))}
        <line className="ci-axis" x1={M.left} x2={W - M.right} y1={bottom} y2={bottom} />
        <text className="ci-tick" x={M.left + PLOT_W / 2} y={H - 6} textAnchor="middle">
          Unterschied B − A (Prozentpunkte)
        </text>

        <line className="ci-zero" x1={x(0)} x2={x(0)} y1={M.top - 4} y2={bottom} />
        {truth !== null ? <line className="ci-truth" x1={x(truth)} x2={x(truth)} y1={M.top - 4} y2={bottom} /> : null}
        {mde !== null ? <line className="ci-mde" x1={x(mde)} x2={x(mde)} y1={M.top - 4} y2={bottom} /> : null}
        {labelled.map((l) => (
          <text
            key={l.key}
            className={`ci-line-label ci-line-label-${l.key}`}
            x={x(l.at)}
            y={M.top - 9 - l.row * 15}
            textAnchor={x(l.at) > W - 60 ? 'end' : x(l.at) < 60 ? 'start' : 'middle'}
          >
            {l.text}
          </text>
        ))}

        {rows.map((row, i) => {
          const missed = row.covers === false;
          return (
            <g key={i} className={missed ? 'ci-row ci-row-missed' : 'ci-row'}>
              <line x1={x(row.lower)} x2={x(row.upper)} y1={y(i)} y2={y(i)} />
              {row.lower < axis.min ? <polygon points={arrow(x(axis.min), y(i), -1)} /> : null}
              {row.upper > axis.max ? <polygon points={arrow(x(axis.max), y(i), 1)} /> : null}
              <circle cx={x(row.estimate)} cy={y(i)} r={r} />
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
