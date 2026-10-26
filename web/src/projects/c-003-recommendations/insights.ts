import type { Weights } from '../../personalization/recommend';

export type InsightId = 'coldStart' | 'monotone' | 'allZero';

/** Ab diesem Anteil der Ähnlichkeit an allen Gewichten wird die Liste eintönig. */
export const MONOTONE_SHARE = 0.8;

// Welche Erkenntnis-Kästen zur Lage passen. Der Anteil zählt, nicht der Rohwert: die Gewichte
// müssen nicht auf eine Summe von 1 eingestellt sein.
export function insightsFor(weights: Weights, hasHistory: boolean): InsightId[] {
  const sum = weights.affinity + weights.popularity + weights.similarity;
  const result: InsightId[] = [];
  if (!hasHistory) result.push('coldStart');
  if (sum === 0) result.push('allZero');
  else if (hasHistory && weights.similarity / sum >= MONOTONE_SHARE - 1e-9) result.push('monotone');
  return result;
}
