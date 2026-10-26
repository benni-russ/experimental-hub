// 1:1 aus dem früheren MDE Visualizer (Versuch A-001) übertragen.
// Feldnamen und Rechenweg bleiben identisch; geprüft gegen R stats::power.prop.test.
// Die Normalverteilung liegt in web/src/stats/normal.ts; hier nur importiert und re-exportiert.

import { inverseStandardNormal } from '../../stats/normal';

export { inverseStandardNormal };

export interface SampleSizeInput {
  /** Baseline in Prozent, z. B. 10 */
  baseline: number;
  /** absoluter Unterschied in Prozentpunkten, z. B. 1 */
  mde: number;
  /** Signifikanzniveau, z. B. 0.05 (zweiseitig) */
  alpha: number;
  /** Power, z. B. 0.8 */
  power: number;
}

export interface SampleSizeResult {
  p1: number;
  p2: number;
  difference: number;
  pooledProportion: number;
  zAlpha: number;
  zPower: number;
  varianceNull: number;
  varianceAlternative: number;
  stdNull: number;
  stdAlternative: number;
  raw: number;
  perVariant: number;
  total: number;
  relativeUplift: number;
}

/**
 * Näherungsweise Stichprobe für zwei unabhängige Anteile bei gleich großen Gruppen
 * (zweiseitiger z-Test, Normalapproximation, ohne Kontinuitätskorrektur).
 * `baseline` in Prozent, `mde` als absolute Prozentpunkte. Ungültig → null.
 */
export function calculateSampleSize({ baseline, mde, alpha, power }: SampleSizeInput): SampleSizeResult | null {
  const values = [baseline, mde, alpha, power];

  if (values.some((value) => !Number.isFinite(value))) return null;

  const p1 = baseline / 100;
  const difference = mde / 100;
  const p2 = p1 + difference;

  if (
    p1 <= 0 ||
    p1 >= 1 ||
    difference <= 0 ||
    p2 >= 1 ||
    alpha <= 0 ||
    alpha >= 1 ||
    power <= 0 ||
    power >= 1
  ) {
    return null;
  }

  const pooledProportion = (p1 + p2) / 2;
  const zAlpha = inverseStandardNormal(1 - alpha / 2);
  const zPower = inverseStandardNormal(power);
  const varianceNull = 2 * pooledProportion * (1 - pooledProportion);
  const varianceAlternative = p1 * (1 - p1) + p2 * (1 - p2);
  const stdNull = Math.sqrt(varianceNull);
  const stdAlternative = Math.sqrt(varianceAlternative);
  const raw = (zAlpha * stdNull + zPower * stdAlternative) ** 2 / difference ** 2;
  const perVariant = Math.ceil(raw);

  return {
    p1,
    p2,
    difference,
    pooledProportion,
    zAlpha,
    zPower,
    varianceNull,
    varianceAlternative,
    stdNull,
    stdAlternative,
    raw,
    perVariant,
    total: perVariant * 2,
    relativeUplift: (difference / p1) * 100,
  };
}
