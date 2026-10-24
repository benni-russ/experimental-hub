/**
 * Erste sichtbare Karte, auf den Seitenanfang gerundet und auf die letzte
 * Seite begrenzt. So bleibt beim Wechsel der Spaltenzahl die bisher erste
 * Karte im Bild.
 */
export function alignFirst(first: number, total: number, perPage: number): number {
  if (total <= 0) return 0;
  const lastStart = Math.floor((total - 1) / perPage) * perPage;
  const aligned = Math.floor(Math.max(0, first) / perPage) * perPage;
  return Math.min(aligned, lastStart);
}

export function isOnPage(index: number, first: number, perPage: number): boolean {
  return index >= first && index < first + perPage;
}

/** „3–4 von 12“, bei nur einer Karte auf der Seite „3 von 12“. */
export function pageLabel(first: number, perPage: number, total: number): string {
  const last = Math.min(first + perPage, total);
  return last - first > 1 ? `${first + 1}–${last} von ${total}` : `${first + 1} von ${total}`;
}
