import { inverseStandardNormal, standardNormalCdf } from './normal';

export interface Counts {
  visitorsA: number;
  conversionsA: number;
  visitorsB: number;
  conversionsB: number;
}

export interface DifferenceInterval {
  /** Raten in Prozent, z. B. 10. */
  rateA: number;
  rateB: number;
  /** Prozentpunkte, B − A. */
  difference: number;
  /** Prozentpunkte. */
  standardError: number;
  /** z(1 − (1 − level)/2). */
  z: number;
  /** Prozentpunkte. */
  lower: number;
  upper: number;
  /** n·p < 10 oder n·(1 − p) < 10 in einer Gruppe. */
  approximationWeak: boolean;
}

function isValid(counts: Counts): boolean {
  const { visitorsA, conversionsA, visitorsB, conversionsB } = counts;
  const group = (visitors: number, conversions: number) =>
    Number.isFinite(visitors) &&
    Number.isFinite(conversions) &&
    Number.isInteger(visitors) &&
    Number.isInteger(conversions) &&
    visitors > 0 &&
    conversions >= 0 &&
    conversions <= visitors;
  return group(visitorsA, conversionsA) && group(visitorsB, conversionsB);
}

function isWeak(visitors: number, share: number): boolean {
  return visitors * share < 10 || visitors * (1 - share) < 10;
}

/** Wald-Intervall für die Differenz zweier Anteile (B − A), Ausgabe in Prozentpunkten. */
export function differenceInterval(counts: Counts, level: number): DifferenceInterval | null {
  if (!isValid(counts) || !Number.isFinite(level) || level <= 0 || level >= 1) return null;

  const { visitorsA, conversionsA, visitorsB, conversionsB } = counts;
  const shareA = conversionsA / visitorsA;
  const shareB = conversionsB / visitorsB;
  const difference = shareB - shareA;
  const standardError = Math.sqrt((shareA * (1 - shareA)) / visitorsA + (shareB * (1 - shareB)) / visitorsB);
  const z = inverseStandardNormal(1 - (1 - level) / 2);

  return {
    rateA: shareA * 100,
    rateB: shareB * 100,
    difference: difference * 100,
    standardError: standardError * 100,
    z,
    lower: (difference - z * standardError) * 100,
    upper: (difference + z * standardError) * 100,
    approximationWeak: isWeak(visitorsA, shareA) || isWeak(visitorsB, shareB),
  };
}

/** Zweiseitiger z-Test mit gepoolter Rate. */
export function twoProportionZTest(counts: Counts): { z: number; pValue: number } | null {
  if (!isValid(counts)) return null;

  const { visitorsA, conversionsA, visitorsB, conversionsB } = counts;
  const pooled = (conversionsA + conversionsB) / (visitorsA + visitorsB);
  if (pooled === 0 || pooled === 1) return { z: 0, pValue: 1 };

  const standardError = Math.sqrt(pooled * (1 - pooled) * (1 / visitorsA + 1 / visitorsB));
  const z = (conversionsB / visitorsB - conversionsA / visitorsA) / standardError;
  return { z, pValue: 2 * standardNormalCdf(-Math.abs(z)) };
}
