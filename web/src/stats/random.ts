/** Zufallszahlen-Generator: gleichverteilt in [0, 1). */
export type Random = () => number;

/**
 * Zufallsgenerator mit Startwert (mulberry32). Gleicher Startwert ergibt
 * immer dieselbe Folge, damit Simulationen reproduzierbar sind.
 */
export function createRandom(seed: number): Random {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Binomialverteilte Zufallszahl: Anzahl der Erfolge bei `n` unabhängigen
 * Versuchen mit Erfolgswahrscheinlichkeit `p` (exakt, Summe von Bernoulli-Zügen).
 */
export function binomial(rng: Random, n: number, p: number): number {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError('n must be an integer greater than or equal to 0.');
  }
  if (!(p >= 0 && p <= 1)) {
    throw new RangeError('p must be between 0 and 1.');
  }

  let successes = 0;
  for (let i = 0; i < n; i++) {
    if (rng() < p) successes++;
  }
  return successes;
}
