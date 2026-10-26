// Farbkontrast nach WCAG 2. Reine Rechnung, keine Browser-Abhängigkeit.

/** Liest '#fff' und '#ffffff'; alles andere ergibt null. */
export function parseHex(hex: string): [number, number, number] | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  let h = m[1] ?? '';
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

/** Relative Helligkeit (0 = Schwarz, 1 = Weiß). */
export function relativeLuminance(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) throw new Error(`Ungültige Farbe: ${hex}`);
  const lin = (v: number): number => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
}

/** Kontrastverhältnis zwischen 1 und 21; die Reihenfolge der Farben ist egal. */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const ratio = (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  // Gleitkomma-Rauschen wegrunden (21 soll genau 21 sein), ohne sichtbar zu runden.
  return Math.round(ratio * 1e9) / 1e9;
}

export type ContrastRating = 'AAA' | 'AA' | 'fail';

/** Grenzen: normaler Text 4,5 / 7, großer Text 3 / 4,5; der Grenzwert gehört zur besseren Stufe. */
export function rateContrast(ratio: number, largeText: boolean): ContrastRating {
  const [aa, aaa] = largeText ? [3, 4.5] : [4.5, 7];
  if (ratio >= aaa) return 'AAA';
  if (ratio >= aa) return 'AA';
  return 'fail';
}
