import { formatNumber } from '../../learning/numbers';
import { formatCount } from './format';

// Breite 360 wie 004: Auf 375 px Bildschirm bleibt die Schrift ≥ 12 px.
const W = 360;
const H = 230;
const M = { top: 36, right: 48, bottom: 36, left: 58 };
const PLOT_W = W - M.left - M.right;
const BAR_W = 80;

/**
 * Zwei Balken (Ist) und je eine gestrichelte Linie (Soll). Die Achse beginnt nicht bei 0,
 * sonst wären Abweichungen von wenigen Prozent unsichtbar; das sagt die Bildunterschrift.
 */
export function SplitChart({
  visitorsA,
  visitorsB,
  expectedA,
  expectedB,
  axis,
}: {
  visitorsA: number;
  visitorsB: number;
  expectedA: number;
  expectedB: number;
  axis: { min: number; max: number };
}) {
  const span = axis.max - axis.min;
  const plotH = H - M.top - M.bottom;
  const bottom = M.top + plotH;
  const y = (v: number) => M.top + plotH - ((Math.min(Math.max(v, axis.min), axis.max) - axis.min) / span) * plotH;
  const middle = (axis.min + axis.max) / 2;
  const ticks = [axis.min, middle, axis.max];

  const xA = M.left + PLOT_W * 0.22 - BAR_W / 2;
  const xB = M.left + PLOT_W * 0.78 - BAR_W / 2;
  const bars = [
    { key: 'a', label: 'A', value: visitorsA, expected: expectedA, x: xA },
    { key: 'b', label: 'B', value: visitorsB, expected: expectedB, x: xB },
  ];

  const description =
    `Zwei Balken: Variante A mit ${formatCount(visitorsA)} Besuchern, Variante B mit ${formatCount(visitorsB)}. ` +
    `Gestrichelt eingezeichnet ist das Soll von ${formatCount(expectedA)} und ${formatCount(expectedB)}. ` +
    `Achse von ${formatNumber(axis.min)} bis ${formatNumber(axis.max)} Besuchern` +
    (axis.min > 0 ? `, sie beginnt nicht bei 0.` : `.`);

  return (
    <figure className="srm-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={description}>
        {ticks.map((t) => (
          <g key={t}>
            <line className="srm-grid" x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />
            <text className="srm-tick" x={M.left - 8} y={y(t) + 4} textAnchor="end">
              {formatNumber(t)}
            </text>
          </g>
        ))}
        {bars.map((bar) => (
          <g key={bar.key}>
            <rect
              className={`srm-bar srm-bar-${bar.key}`}
              x={bar.x}
              y={y(bar.value)}
              width={BAR_W}
              height={Math.max(bottom - y(bar.value), 0)}
            />
            <text className="srm-value" x={bar.x + BAR_W / 2} y={y(bar.value) - 8} textAnchor="middle">
              {formatCount(bar.value)}
            </text>
            <text className="srm-bar-label" x={bar.x + BAR_W / 2} y={bottom + 22} textAnchor="middle">
              Variante {bar.label}
            </text>
            <line className="srm-target" x1={bar.x - 14} x2={bar.x + BAR_W + 14} y1={y(bar.expected)} y2={y(bar.expected)} />
          </g>
        ))}
        <text className="srm-tick" x={xB + BAR_W + 18} y={y(expectedB) + 4}>
          Soll
        </text>
        <line className="srm-axis" x1={M.left} x2={W - M.right} y1={bottom} y2={bottom} />
        {axis.min > 0 && (
          // Achsenbruch: rein visuell, der Text darunter und das aria-label sagen es auch.
          <text className="srm-break" x={M.left + 6} y={bottom + 5} textAnchor="middle" aria-hidden="true">
            ≈
          </text>
        )}
      </svg>
      {/* figcaption bleibt das letzte Kind von figure; der Achsenhinweis gehört zur Bildunterschrift */}
      <figcaption>
        Gestrichelt: Soll bei geplanter Aufteilung.
        {axis.min > 0 && (
          <p className="srm-axis-note">
            Achse beginnt bei {formatNumber(axis.min)}, nicht bei 0, sonst wären die Unterschiede kaum zu sehen.
          </p>
        )}
      </figcaption>
    </figure>
  );
}
