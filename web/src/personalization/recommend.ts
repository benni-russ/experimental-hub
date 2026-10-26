// Ranking: gewichtete Summe aus Affinität, Beliebtheit und Ähnlichkeit (Track C).
import type { Product } from './catalog';
import type { Visitor } from './visitors';
import { categoryAffinity } from './affinity';

export interface Weights {
  affinity: number;
  popularity: number;
  similarity: number;
}
export type Signals = Weights;
export type PresetId = 'popular' | 'personal' | 'similar' | 'balanced';

export const PRESETS: Record<PresetId, { label: string; weights: Weights }> = {
  popular: { label: 'Beliebt', weights: { affinity: 0, popularity: 1, similarity: 0 } },
  personal: { label: 'Persönlich', weights: { affinity: 0.6, popularity: 0.2, similarity: 0.2 } },
  similar: { label: 'Ähnlich', weights: { affinity: 0.1, popularity: 0.1, similarity: 0.8 } },
  balanced: { label: 'Ausgewogen', weights: { affinity: 1 / 3, popularity: 1 / 3, similarity: 1 / 3 } },
};

// Überschneidung durch Vereinigung; zwei leere Mengen ergeben 0.
export function jaccard(a: string[], b: string[]): number {
  const sa = new Set(a);
  const sb = new Set(b);
  const union = new Set([...sa, ...sb]).size;
  if (union === 0) return 0;
  let common = 0;
  for (const x of sa) if (sb.has(x)) common += 1;
  return common / union;
}

export function scoreProduct(signals: Signals, weights: Weights): number {
  return (
    signals.affinity * weights.affinity +
    signals.popularity * weights.popularity +
    signals.similarity * weights.similarity
  );
}

export interface RankOptions {
  hideOutOfStock: boolean;
  hidePurchased: boolean;
  n: number;
}

export interface RankedItem {
  product: Product;
  score: number;
  parts: Signals; // Gewicht × Signal
}

export function rankProducts(
  products: Product[],
  visitor: Visitor,
  weights: Weights,
  options: RankOptions,
  now: string,
): RankedItem[] {
  const { profile } = categoryAffinity(visitor.events, now, products);
  const maxSales = Math.max(0, ...products.map((p) => p.sales30d));

  // Ähnlichkeit gegen das Produkt des jüngsten Aufrufs; ohne Aufruf oder Produkt: 0.
  const views = visitor.events.filter((e) => e.type === 'view');
  const lastView = views.reduce<(typeof views)[number] | undefined>(
    (latest, e) => (!latest || Date.parse(e.at) > Date.parse(latest.at) ? e : latest),
    undefined,
  );
  const reference = lastView ? products.find((p) => p.id === lastView.productId) : undefined;

  const purchased = new Set(visitor.events.filter((e) => e.type === 'purchase').map((e) => e.productId));

  return products
    .filter((p) => !(options.hideOutOfStock && p.availability === 'out_of_stock'))
    .filter((p) => !(options.hidePurchased && purchased.has(p.id)))
    .filter((p) => p.id !== reference?.id) // das gerade angesehene Produkt ist der Anker, kein Kandidat
    .map((product) => {
      const signals: Signals = {
        affinity: profile[product.category] ?? 0,
        popularity: maxSales > 0 ? product.sales30d / maxSales : 0,
        similarity: reference ? jaccard(product.tags, reference.tags) : 0,
      };
      const parts: Signals = {
        affinity: signals.affinity * weights.affinity,
        popularity: signals.popularity * weights.popularity,
        similarity: signals.similarity * weights.similarity,
      };
      return { product, score: scoreProduct(signals, weights), parts };
    })
    .sort((a, b) => b.score - a.score || a.product.id.localeCompare(b.product.id))
    .slice(0, options.n);
}

// Platzänderung je Produkt: +2 = zwei Plätze hoch, 'new' = vorher nicht in der Liste.
export function rankChanges(prev: string[], next: string[]): Record<string, number | 'new'> {
  const result: Record<string, number | 'new'> = {};
  next.forEach((id, index) => {
    const before = prev.indexOf(id);
    result[id] = before === -1 ? 'new' : before - index;
  });
  return result;
}
