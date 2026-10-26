import { calculateSampleSize, type SampleSizeInput, type SampleSizeResult } from './sampleSize';

export interface Halving {
  half: SampleSizeResult;
  /** Personen je Variante bei halbem Unterschied geteilt durch die beim vollen */
  ratio: number;
}

/**
 * Was kostet es, nur den halben Unterschied erkennen zu wollen? Meist rund das
 * Vierfache; bei kleiner Baseline und großem Unterschied deutlich weniger, weil
 * sich die Streuung mit der Zielrate merklich ändert. Ungültig → null.
 */
export function halveMde(input: SampleSizeInput): Halving | null {
  const full = calculateSampleSize(input);
  const half = calculateSampleSize({ ...input, mde: input.mde / 2 });
  if (!full || !half) return null;
  return { half, ratio: half.perVariant / full.perVariant };
}

/** Unterhalb dieses Faktors erklärt die Demo, warum es nicht „rund vierfach“ ist. */
export const NOTABLY_BELOW_FOUR = 3.5;
