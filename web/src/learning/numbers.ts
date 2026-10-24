/**
 * Liest eine Zahl in deutscher Schreibweise.
 * Leerzeichen und Punkte als Tausendertrenner, ein Komma als Dezimaltrenner.
 * Alles andere ergibt null (nie 0), damit Unsinn nicht als Schätzung zählt.
 *
 * Mehrdeutigkeit: „14.751“ gilt als 14751 (Punkt + genau drei Ziffern =
 * Tausendertrenner), nicht als 14,751. Ein Punkt mit anderer Stellenzahl
 * („3.5“) bleibt Dezimalpunkt.
 */
export function parseGermanNumber(input: string): number | null {
  let s = input.replace(/\s+/g, '');
  if (s === '') return null;
  if (s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, '');
  }
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  const value = Number(s);
  return Number.isFinite(value) ? value : null;
}

export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

/** Ganze Zahl bis auf Rundungsrest. */
export const isWhole = (v: number) => Math.abs(v - Math.round(v)) < 1e-9;

const realMinus = (text: string) => text.replace('-', '−');

/** Deutsch formatiert mit echtem Minuszeichen, ohne Plus: „−0,19“ · „0,79“. */
export const formatSigned = (v: number, digits = 0) => realMinus(formatNumber(v, digits));

/** Unterschied mit Vorzeichen: „+1,00“ · „−0,19“; gerundet null ohne Vorzeichen. */
export function formatDifference(v: number, digits = 0): string {
  const text = formatNumber(Math.abs(v), digits);
  if (!/[1-9]/.test(text)) return text;
  return `${v > 0 ? '+' : '−'}${text}`;
}

/** Gültige Stellen (Standard fünf), deutsch, mit echtem Minuszeichen. */
export const formatSignificant = (v: number, digits = 5) =>
  realMinus(new Intl.NumberFormat('de-DE', { maximumSignificantDigits: digits }).format(v));
