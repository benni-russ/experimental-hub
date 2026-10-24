// Rechnung für Versuch 004 (Simpson-Paradox): Gesamtrate als gewichtetes Mittel
// der Segmentraten, dazu der Kipppunkt, ab dem B insgesamt hinter A liegt.

/** Kaufraten je Variante und Segment in Prozent. */
export const SEGMENT_RATES = {
  A: { mobile: 2.0, desktop: 6.0 },
  B: { mobile: 2.4, desktop: 6.6 },
} as const;

/** Mobil-Anteil in A in Prozent. */
export const MOBILE_SHARE_A = 50;

/** Gesamtrate in Prozent: Segmentraten, gewichtet mit dem Mobil-Anteil (Prozent). */
export function overallRate(rates: { mobile: number; desktop: number }, mobileShare: number): number {
  const share = mobileShare / 100;
  return share * rates.mobile + (1 - share) * rates.desktop;
}

/** Mobil-Anteil in B (Prozent), bei dem B und A insgesamt gleichauf liegen. */
export function tippingPoint(): number {
  const target = overallRate(SEGMENT_RATES.A, MOBILE_SHARE_A);
  const { mobile, desktop } = SEGMENT_RATES.B;
  return ((desktop - target) / (desktop - mobile)) * 100;
}

const TIE_TOLERANCE = 1e-9;

export function compare(mobileShareB: number): {
  overallA: number;
  overallB: number;
  overallWinner: 'A' | 'B' | 'tie';
  paradox: boolean;
} {
  const overallA = overallRate(SEGMENT_RATES.A, MOBILE_SHARE_A);
  const overallB = overallRate(SEGMENT_RATES.B, mobileShareB);
  const diff = overallB - overallA;
  const overallWinner = Math.abs(diff) < TIE_TOLERANCE ? 'tie' : diff > 0 ? 'B' : 'A';
  const bWinsBoth =
    SEGMENT_RATES.B.mobile > SEGMENT_RATES.A.mobile && SEGMENT_RATES.B.desktop > SEGMENT_RATES.A.desktop;
  return { overallA, overallB, overallWinner, paradox: bWinsBoth && overallWinner === 'A' };
}
