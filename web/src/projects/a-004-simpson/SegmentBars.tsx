import { formatNumber } from '../../learning/numbers';
import { formatGap, overallWinnerWord, pct, pct2, winnerWord } from './format';
import { SEGMENT_RATES } from './simpson';

const W = 360;
const H = 290;
const M = { top: 36, right: 8, bottom: 62, left: 36 };
const PLOT_W = W - M.left - M.right;
/** Achse von 0 bis 8 %: beginnt bei 0, damit die Balkenhöhen ehrlich bleiben. */
const AXIS_MAX = 8;
const TICKS = [0, 2, 4, 6, 8];
const BAR_W = 46;
const GROUP_PAD = 8;

type Winner = 'A' | 'B' | 'tie';

function winnerOf(a: number, b: number): Winner {
  if (Math.abs(a - b) < 1e-9) return 'tie';
  return a > b ? 'A' : 'B';
}

/**
 * Drei Gruppen (Mobil, Desktop, Insgesamt), je ein Balkenpaar A/B. Die Achse beginnt bei 0.
 * Die Gruppe „Insgesamt“ trägt bei Paradox einen Rahmen in Gold.
 */
export function SegmentBars({
  mobileShareB,
  mobileShareA,
  overallA,
  overallB,
  overallWinner,
  paradox,
}: {
  mobileShareB: number;
  mobileShareA: number;
  overallA: number;
  overallB: number;
  overallWinner: Winner;
  paradox: boolean;
}) {
  const plotH = H - M.top - M.bottom;
  const bottom = M.top + plotH;
  const y = (v: number) => M.top + plotH - (v / AXIS_MAX) * plotH;
  const groupW = PLOT_W / 3;

  const groups = [
    {
      key: 'mobile',
      label: 'Mobil',
      a: SEGMENT_RATES.A.mobile,
      b: SEGMENT_RATES.B.mobile,
      winner: winnerOf(SEGMENT_RATES.A.mobile, SEGMENT_RATES.B.mobile),
      word: winnerWord(winnerOf(SEGMENT_RATES.A.mobile, SEGMENT_RATES.B.mobile)),
    },
    {
      key: 'desktop',
      label: 'Desktop',
      a: SEGMENT_RATES.A.desktop,
      b: SEGMENT_RATES.B.desktop,
      winner: winnerOf(SEGMENT_RATES.A.desktop, SEGMENT_RATES.B.desktop),
      word: winnerWord(winnerOf(SEGMENT_RATES.A.desktop, SEGMENT_RATES.B.desktop)),
    },
    { key: 'overall', label: 'Insgesamt', a: overallA, b: overallB, winner: overallWinner, word: overallWinnerWord(overallA, overallB, overallWinner) },
  ];

  const description =
    `Drei Balkenpaare, Kaufrate in Prozent, Achse von 0 bis ${AXIS_MAX} Prozent. ` +
    `Mobil: A ${pct(SEGMENT_RATES.A.mobile)}, B ${pct(SEGMENT_RATES.B.mobile)}. ` +
    `Desktop: A ${pct(SEGMENT_RATES.A.desktop)}, B ${pct(SEGMENT_RATES.B.desktop)}. ` +
    `Insgesamt: A ${pct2(overallA)}, B ${pct2(overallB)}, ${overallWinnerWord(overallA, overallB, overallWinner)}, Abstand B minus A ${formatGap(overallB - overallA)}. ` +
    `Der Mobil-Anteil beträgt in A ${formatNumber(mobileShareA)} Prozent und in B ${formatNumber(mobileShareB)} Prozent.`;

  return (
    <figure className="simpson-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={description}>
        {TICKS.map((t) => (
          <g key={t}>
            <line className="simpson-grid" x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} />
            <text className="simpson-tick" x={M.left - 6} y={y(t) + 4} textAnchor="end">
              {t} %
            </text>
          </g>
        ))}
        {groups.map((g, i) => {
          const gx = M.left + i * groupW;
          const cx = gx + groupW / 2;
          const framed = g.key === 'overall' && paradox;
          const bars = [
            { s: 'a', x: cx - BAR_W - 3, v: g.a },
            { s: 'b', x: cx + 3, v: g.b },
          ];
          return (
            <g key={g.key}>
              {framed ? (
                <rect
                  className="simpson-frame"
                  x={gx + GROUP_PAD / 2}
                  y={M.top - 24}
                  width={groupW - GROUP_PAD}
                  height={H - M.top + 22}
                  rx={6}
                />
              ) : null}
              {bars.map((bar) => (
                <g key={bar.s}>
                  <rect
                    className={`simpson-bar simpson-bar-${bar.s}`}
                    x={bar.x}
                    y={y(bar.v)}
                    width={BAR_W}
                    height={Math.max(bottom - y(bar.v), 0)}
                  />
                  <text className="simpson-value" x={bar.x + BAR_W / 2} y={y(bar.v) - 6} textAnchor="middle">
                    {g.key === 'overall' ? pct2(bar.v) : pct(bar.v)}
                  </text>
                  <text className="simpson-tick" x={bar.x + BAR_W / 2} y={bottom + 16} textAnchor="middle">
                    {bar.s.toUpperCase()}
                  </text>
                </g>
              ))}
              <text className="simpson-group-label" x={cx} y={bottom + 36} textAnchor="middle">
                {g.label}
              </text>
              <text className="simpson-winner" x={cx} y={bottom + 54} textAnchor="middle">
                {g.word}
              </text>
            </g>
          );
        })}
        <line className="simpson-axis" x1={M.left} x2={W - M.right} y1={bottom} y2={bottom} />
      </svg>
      <figcaption>
        Kaufrate je Variante, Achse ab 0 %. Insgesamt ist das gewichtete Mittel der beiden Segmente: A mit{' '}
        {formatNumber(mobileShareA)} % Mobil-Anteil, B mit {formatNumber(mobileShareB)} %.
      </figcaption>
    </figure>
  );
}
