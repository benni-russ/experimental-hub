import { formatNumber, formatSigned, isWhole } from '../../learning/numbers';
import { SRM_THRESHOLD, formatPValue } from './srm';

/** Besucherzahlen: ganz, sonst eine Nachkommastelle (Erwartungswerte). */
export const formatCount = (v: number) => formatNumber(v, isWhole(v) ? 0 : 1);
/** Prozent mit einer Stelle und echtem Minuszeichen: „2,5 %“ */
export const formatPercent = (v: number) => `${formatSigned(v, 1)} %`;
/** Mit Vorzeichen: „+1,2 %“ · „−1,2 %“ */
export const formatSignedPercent = (v: number) => (v > 0 ? `+${formatPercent(v)}` : formatPercent(v));
/** „p = 0,00015“ · „p < 0,0001“ */
export const formatP = (p: number) => {
  const s = formatPValue(p);
  return s.startsWith('<') ? `p ${s}` : `p = ${s}`;
};
/** „0,001“ aus der Schwelle, deutsch. */
export const formatThreshold = () => formatNumber(SRM_THRESHOLD, 3);
