// Kategorie-Affinität aus dem Verlauf eines Besuchers (Track C).
import type { Product } from './catalog';
import type { VisitorEvent } from './visitors';

export const EVENT_WEIGHTS = { view: 1, cart: 3, purchase: 5 } as const;
export const HALF_LIFE_DAYS = 7;

const MS_PER_DAY = 86_400_000;

export interface Contribution {
  event: VisitorEvent;
  category: string;
  ageDays: number;
  weight: number;
  decay: number;
  value: number; // weight × decay
}

// Jedes Ereignis zählt mit seinem Gewicht, halbiert alle HALF_LIFE_DAYS Tage.
// Ereignisse auf unbekannte Produkte werden übersprungen; das Profil ist auf Summe 1 normiert.
export function categoryAffinity(
  events: VisitorEvent[],
  now: string,
  products: Product[],
): { profile: Record<string, number>; contributions: Contribution[] } {
  const byId = new Map(products.map((p) => [p.id, p]));
  const nowMs = Date.parse(now);
  const contributions: Contribution[] = [];
  for (const event of events) {
    const product = byId.get(event.productId);
    if (!product) continue;
    const ageDays = (nowMs - Date.parse(event.at)) / MS_PER_DAY;
    const weight = EVENT_WEIGHTS[event.type];
    const decay = 0.5 ** (ageDays / HALF_LIFE_DAYS);
    contributions.push({ event, category: product.category, ageDays, weight, decay, value: weight * decay });
  }

  const sums: Record<string, number> = {};
  let total = 0;
  for (const c of contributions) {
    sums[c.category] = (sums[c.category] ?? 0) + c.value;
    total += c.value;
  }
  const profile: Record<string, number> = {};
  if (total > 0) for (const [category, sum] of Object.entries(sums)) profile[category] = sum / total;
  return { profile, contributions };
}
