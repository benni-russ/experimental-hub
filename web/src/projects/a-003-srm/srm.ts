import { standardNormalCdf } from '../../stats/normal';

/** Ab diesem p-Wert gilt die Aufteilung als auffällig (üblich für SRM-Prüfungen). */
export const SRM_THRESHOLD = 0.001;

export interface SrmResult {
  expectedA: number;
  expectedB: number;
  chiSquare: number;
  /** Zweiseitig; mit 1 Freiheitsgrad ist χ² = z², also p = 2·Φ(−√χ²). */
  pValue: number;
  /** Abweichung von A gegenüber dem Erwartungswert, in Prozent. */
  deviationPercent: number;
  mismatch: boolean;
}

function isCount(value: number): boolean {
  return Number.isFinite(value) && Number.isInteger(value) && value >= 0;
}

/**
 * χ²-Anpassungstest der Besucherverteilung gegen den geplanten Anteil.
 * `null` bei ungültigen Eingaben (nicht ganze oder negative Besucher, Summe 0,
 * Anteil nicht echt zwischen 0 und 100).
 */
export function srmTest(o: { visitorsA: number; visitorsB: number; plannedShareA: number }): SrmResult | null {
  const { visitorsA, visitorsB, plannedShareA } = o;
  if (!isCount(visitorsA) || !isCount(visitorsB)) return null;
  if (!Number.isFinite(plannedShareA) || plannedShareA <= 0 || plannedShareA >= 100) return null;
  const total = visitorsA + visitorsB;
  if (total === 0) return null;

  const share = plannedShareA / 100;
  const expectedA = total * share;
  const expectedB = total * (1 - share);
  const chiSquare = (visitorsA - expectedA) ** 2 / expectedA + (visitorsB - expectedB) ** 2 / expectedB;
  // Die Näherung von Φ liegt bei 0 minimal über 0,5; ein p-Wert über 1 wäre unsinnig.
  const pValue = Math.min(1, 2 * standardNormalCdf(-Math.sqrt(chiSquare)));
  return {
    expectedA,
    expectedB,
    chiSquare,
    pValue,
    deviationPercent: (visitorsA / expectedA - 1) * 100,
    mismatch: pValue < SRM_THRESHOLD,
  };
}

const pValueFormat = new Intl.NumberFormat('de-DE', { maximumSignificantDigits: 4 });

/** Nie „0“: alles unter 0,0001 erscheint als „< 0,0001“. */
export function formatPValue(p: number): string {
  if (!Number.isFinite(p)) return '–';
  if (p < 0.0001) return '< 0,0001';
  return pValueFormat.format(p);
}
