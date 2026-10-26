import { formatNumber } from '../../learning/numbers';

/** Prozent mit einer Nachkommastelle (Segmentraten). */
export const pct = (v: number): string => `${formatNumber(v, 1)} %`;

/** Prozent mit zwei Nachkommastellen (Gesamtraten: am Kipppunkt liegen A und B unter 0,05 Punkte auseinander). */
export const pct2 = (v: number): string => `${formatNumber(v, 2)} %`;

export function winnerWord(w: 'A' | 'B' | 'tie'): string {
  return w === 'tie' ? 'gleichauf' : `${w} vorn`;
}

/** Abstand B − A in Prozentpunkten mit Vorzeichen: „+0,038 Prozentpunkte“ · „−0,004 Prozentpunkte“. */
export function formatGap(diff: number): string {
  const text = formatNumber(Math.abs(diff), 3);
  if (text === '0,000') return '0,000 Prozentpunkte';
  return `${diff > 0 ? '+' : '−'}${text} Prozentpunkte`;
}

/** Gewinnerwort für „Insgesamt“: „knapp“, wenn die gerundeten Gesamtraten gleich aussehen. */
export function overallWinnerWord(overallA: number, overallB: number, winner: 'A' | 'B' | 'tie'): string {
  if (winner !== 'tie' && pct2(overallA) === pct2(overallB)) return `${winner} knapp vorn`;
  return winnerWord(winner);
}
