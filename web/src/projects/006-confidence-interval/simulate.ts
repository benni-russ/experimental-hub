import { binomial, createRandom } from '../../stats/random';
import { differenceInterval } from '../../stats/proportions';

/** Wahre Werte der Simulation: Basisrate in Prozent, Unterschied in Prozentpunkten. */
export const TRUTH = { baseline: 10, difference: 1 } as const;

export const DEFAULT_SEED = 20261024;

/** Ein simuliertes Intervall; alle Werte in Prozentpunkten. */
export interface SimulatedInterval {
  estimate: number;
  lower: number;
  upper: number;
  covers: boolean;
}

/**
 * Wiederholt einen A/B-Test `tests`-mal mit wahren Raten aus TRUTH und
 * berechnet je Test das Konfidenzintervall der Differenz B − A.
 */
export function simulateIntervals(o: {
  seed: number;
  visitorsPerVariant: number;
  tests: number;
  level: number;
}): { intervals: SimulatedInterval[]; covered: number } {
  const rng = createRandom(o.seed);
  const rateA = TRUTH.baseline / 100;
  const rateB = (TRUTH.baseline + TRUTH.difference) / 100;
  const intervals: SimulatedInterval[] = [];
  let covered = 0;

  for (let i = 0; i < o.tests; i++) {
    const conversionsA = binomial(rng, o.visitorsPerVariant, rateA);
    const conversionsB = binomial(rng, o.visitorsPerVariant, rateB);
    const result = differenceInterval(
      {
        visitorsA: o.visitorsPerVariant,
        conversionsA,
        visitorsB: o.visitorsPerVariant,
        conversionsB,
      },
      o.level,
    );
    if (result === null) {
      throw new RangeError('Simulation with these inputs yields no interval.');
    }

    const hit = result.lower <= TRUTH.difference && TRUTH.difference <= result.upper;
    if (hit) covered++;
    intervals.push({
      estimate: result.difference,
      lower: result.lower,
      upper: result.upper,
      covers: hit,
    });
  }

  return { intervals, covered };
}
