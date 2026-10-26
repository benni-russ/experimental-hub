/**
 * Eine Klassifikation für das Intervall des Unterschieds (B − A, Prozentpunkte) gegen Null und MDE.
 * A-002 („Dein Test“) und A-002.3 (vier Fälle) lesen beide hieraus.
 *
 * Grenzen: Ein Intervall, das 0 berührt, schließt 0 ein (nicht signifikant).
 * Liegt das untere Ende genau auf dem MDE, gilt der MDE als erreicht (`>=`);
 * liegt das obere Ende genau darauf, liegt der MDE im Intervall.
 */

export type Significance = 'positive' | 'negative' | 'includesZero';

/**
 * both: signifikant, ganz über dem MDE · small: signifikant, ganz unter dem MDE ·
 * significantOpen: signifikant, MDE im Intervall · open: schließt 0 und MDE ein ·
 * excluded: schließt 0 ein, endet vor dem MDE · negative: ganz unter 0.
 */
export type IntervalCase = 'both' | 'small' | 'significantOpen' | 'open' | 'excluded' | 'negative';

export function significanceOf(lower: number, upper: number): Significance {
  if (lower > 0) return 'positive';
  if (upper < 0) return 'negative';
  return 'includesZero';
}

/** Fall des Intervalls; ohne MDE (null) gibt es keinen. Der MDE ist > 0. */
export function intervalCase(lower: number, upper: number, mde: number | null): IntervalCase | null {
  if (mde === null) return null;
  const significance = significanceOf(lower, upper);
  if (significance === 'negative') return 'negative';
  const relevance = lower >= mde ? 'reached' : upper < mde ? 'missed' : 'open';
  if (significance === 'positive') {
    return relevance === 'reached' ? 'both' : relevance === 'missed' ? 'small' : 'significantOpen';
  }
  return relevance === 'missed' ? 'excluded' : 'open';
}
