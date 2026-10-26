import type { Weights } from '../../personalization/recommend';

export type InsightId = 'coldStart' | 'monotone' | 'allZero';

/** Ab diesem Anteil der Ähnlichkeit an allen Gewichten kann die Liste eintönig werden. */
export const MONOTONE_SHARE = 0.8;
/** Eintönig ist sie erst, wenn von den vordersten Plätzen so viele dieselbe Kategorie haben. */
export const MONOTONE_PLACES = 4;
export const MONOTONE_MIN_SAME = 3;

// Haben mindestens MONOTONE_MIN_SAME der Plätze 1 bis MONOTONE_PLACES dieselbe Kategorie?
function sameCategoryAhead(ranked: { product: { category: string } }[]): boolean {
  const counts = new Map<string, number>();
  for (const { product } of ranked.slice(0, MONOTONE_PLACES)) counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
  return Math.max(0, ...counts.values()) >= MONOTONE_MIN_SAME;
}

// Welche Erkenntnis-Kästen zur Lage passen. Der Anteil zählt, nicht der Rohwert: die Gewichte
// müssen nicht auf eine Summe von 1 eingestellt sein. „Eintönig“ gilt nur, wenn es die echte Liste
// bestätigt: hohe Ähnlichkeit UND mindestens drei der vordersten vier Plätze aus einer Kategorie.
export function insightsFor(weights: Weights, hasHistory: boolean, ranked: { product: { category: string } }[]): InsightId[] {
  const sum = weights.affinity + weights.popularity + weights.similarity;
  const result: InsightId[] = [];
  if (!hasHistory) result.push('coldStart');
  if (sum === 0) result.push('allZero');
  else if (hasHistory && weights.similarity / sum >= MONOTONE_SHARE - 1e-9 && sameCategoryAhead(ranked)) result.push('monotone');
  return result;
}
