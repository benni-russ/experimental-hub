// Verbindung zwischen Feedprüfung und Empfehlungsvergleich (C-002): welches Produkt der
// naiv gelesenen Liste stammt aus welchem Feedeintrag, und was ist an diesem Eintrag kaputt.
import type { Product } from '../../personalization/catalog';
import type { FeedEntry, FeedIssue, IssueCode } from '../../personalization/inspectFeed';

// Wort für die Markierung einer kaputten Empfehlung, je Fehlerart.
export const FLAW_WORDS: Partial<Record<IssueCode, string>> = {
  duplicate_id: 'doppelt',
  stale: 'veraltet',
  availability_value: 'ausverkauft',
  category_variant: 'Kategorie falsch geschrieben',
  price_format: 'Preis ungültig',
  missing_field: 'unvollständig',
};

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/**
 * `readFeedNaively` übernimmt jeden Eintrag, der ein Objekt mit Zahl als Preis ist, in
 * Feedreihenfolge. Diese Einträge in derselben Reihenfolge ergeben die Zuordnung zur naiven Liste.
 */
export function naiveEntries(entries: FeedEntry[]): FeedEntry[] {
  return entries.filter((e) => isRecord(e.data) && typeof e.data.price === 'number');
}

/** Wörter für ein Eintrag mit `repair`- oder `drop`-Issues; `warn` zählt nicht als kaputt. */
export function flawWords(issues: FeedIssue[]): string[] {
  const words: string[] = [];
  for (const issue of issues) {
    if (issue.action !== 'repair' && issue.action !== 'drop') continue;
    const word = FLAW_WORDS[issue.code];
    if (word && !words.includes(word)) words.push(word);
  }
  return words;
}

/** Je Produkt der naiv gelesenen Liste die Wörter seiner Mängel (leer = fehlerfrei). */
export function naiveFlaws(naive: Product[], entries: FeedEntry[], issues: FeedIssue[]): Map<Product, string[]> {
  const matched = naiveEntries(entries);
  const result = new Map<Product, string[]>();
  naive.forEach((product, i) => {
    const entry = matched[i];
    result.set(product, entry ? flawWords(issues.filter((x) => x.index === entry.index)) : []);
  });
  return result;
}
