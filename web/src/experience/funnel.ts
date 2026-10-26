// Funnel-Modell für D-003: wie viele Besucher in jeder Stufe bleiben und was das
// für Umsatz und Rohertrag heißt. Reine Logik; gerechnet wird ohne Runden, die Anzeige rundet.

export type StepId = 'visit' | 'product' | 'cart' | 'checkout' | 'purchase';

export const STEPS: { id: StepId; label: string }[] = [
  { id: 'visit', label: 'Besuch' },
  { id: 'product', label: 'Produktseite' },
  { id: 'cart', label: 'Warenkorb' },
  { id: 'checkout', label: 'Kasse' },
  { id: 'purchase', label: 'Kauf' },
];

export type SourceId = 'search' | 'social' | 'newsletter' | 'direct';

/** Besuche je Quelle und die vier Übergangsquoten (Besuch→Produktseite, →Warenkorb, →Kasse, →Kauf). */
export interface Source {
  id: SourceId;
  label: string;
  visits: number;
  rates: [number, number, number, number];
}

export const SOURCES: Source[] = [
  { id: 'search', label: 'Suche', visits: 8000, rates: [0.6, 0.15, 0.55, 0.6] },
  { id: 'social', label: 'Social', visits: 5000, rates: [0.4, 0.06, 0.45, 0.5] },
  { id: 'newsletter', label: 'Newsletter', visits: 2000, rates: [0.7, 0.2, 0.6, 0.7] },
  { id: 'direct', label: 'direkt', visits: 5000, rates: [0.55, 0.14, 0.55, 0.65] },
];

export interface Economy {
  averageOrderValue: number; // Listenwert einer Bestellung in Euro
  margin: number; // Warenmarge als Anteil
  shippingCost: number; // Versandkosten je Bestellung in Euro
  shippingBorneShare: number; // Anteil der Bestellungen, bei denen der Shop den Versand trägt
  discount: number; // Rabatt auf den Listenwert als Anteil
}

export const ECONOMY: Economy = { averageOrderValue: 92, margin: 0.4, shippingCost: 4.9, shippingBorneShare: 1, discount: 0 };

export interface FunnelResult {
  counts: number[]; // fünf Stufen
  rates: number[]; // vier Übergänge
  overall: number;
  bySource: Record<SourceId, { counts: number[]; rates: number[]; overall: number }>;
  biggestLeak: number; // Index des Übergangs mit der niedrigsten Quote
}

const ratio = (a: number, b: number) => (b > 0 ? a / b : 0);

function stagesOf(visits: number, rates: readonly number[]): { counts: number[]; rates: number[]; overall: number } {
  const counts = [visits];
  rates.forEach((r, i) => counts.push(counts[i]! * r));
  return { counts, rates: [...rates], overall: ratio(counts[4]!, counts[0]!) };
}

export function computeFunnel(sources: Source[]): FunnelResult {
  const bySource = {} as FunnelResult['bySource'];
  const counts = [0, 0, 0, 0, 0];
  for (const s of sources) {
    const part = stagesOf(s.visits, s.rates);
    bySource[s.id] = part;
    part.counts.forEach((c, i) => (counts[i]! += c));
  }
  const rates = [0, 1, 2, 3].map((i) => ratio(counts[i + 1]!, counts[i]!));
  // Bei 0 Besuchen gibt es kein Leck; Index 0 ist dann nur ein fester Rückfall.
  const biggestLeak = counts[0]! > 0 ? rates.indexOf(Math.min(...rates)) : 0;
  return { counts, rates, overall: ratio(counts[4]!, counts[0]!), bySource, biggestLeak };
}

export interface Kpis {
  visits: number;
  orders: number;
  conversionRate: number;
  averageOrderValue: number; // nach Rabatt
  revenue: number;
  revenuePerVisit: number;
  grossProfit: number;
}

export function kpis(funnel: FunnelResult, economy: Economy): Kpis {
  const visits = funnel.counts[0]!;
  const orders = funnel.counts[4]!;
  const listValue = orders * economy.averageOrderValue;
  const revenue = listValue * (1 - economy.discount);
  const shipping = orders * economy.shippingCost * economy.shippingBorneShare;
  return {
    visits,
    orders,
    conversionRate: ratio(orders, visits),
    averageOrderValue: economy.averageOrderValue * (1 - economy.discount),
    revenue,
    revenuePerVisit: ratio(revenue, visits),
    grossProfit: listValue * economy.margin - listValue * economy.discount - shipping,
  };
}

const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);

/** Relative Änderung je Übergang (0,1 = +10 %); jede Quote bleibt in [0, 1]. */
export function applyLifts(sources: Source[], lifts: [number, number, number, number]): Source[] {
  return sources.map((s) => ({
    ...s,
    rates: s.rates.map((r, i) => clamp01(r * (1 + lifts[i]!))) as Source['rates'],
  }));
}

export type ScenarioId = 'discount' | 'freeShipping' | 'socialCampaign' | 'guestCheckout';

export interface Scenario {
  id: ScenarioId;
  label: string;
  description: string;
  apply: (s: Source[], e: Economy) => { sources: Source[]; economy: Economy };
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'discount',
    label: '15 % Rabatt',
    description: 'Mehr Besucher legen etwas in den Warenkorb, dafür sinkt der Erlös je Bestellung. Effekte erfunden.',
    apply: (s, e) => ({ sources: applyLifts(s, [0, 0.12, 0, 0]), economy: { ...e, discount: 0.15 } }),
  },
  {
    id: 'freeShipping',
    label: 'Gratisversand nur noch ab 50 €',
    description:
      'Vorher war der Versand immer gratis. Nun springen einige an der Kasse ab, die Bestellungen werden größer, der Shop trägt seltener die Kosten. Effekte erfunden.',
    apply: (s, e) => ({
      sources: applyLifts(s, [0, 0, 0, -0.04]),
      economy: { ...e, averageOrderValue: 99, shippingBorneShare: 0.85 },
    }),
  },
  {
    id: 'socialCampaign',
    label: 'Social-Kampagne',
    description: 'Doppelt so viele Besuche aus Social, aber mit den bisherigen, niedrigen Quoten. Effekte erfunden.',
    apply: (s, e) => ({
      sources: s.map((x) => (x.id === 'social' ? { ...x, visits: x.visits * 2 } : { ...x })),
      economy: { ...e },
    }),
  },
  {
    id: 'guestCheckout',
    label: 'Kauf ohne Konto',
    description: 'Wer kein Konto anlegen muss, bricht an der Kasse seltener ab. Effekte erfunden.',
    apply: (s, e) => ({ sources: applyLifts(s, [0, 0, 0, 0.15]), economy: { ...e } }),
  },
];

export type Direction = 'up' | 'down' | 'same';

export interface KpiChange {
  before: number;
  after: number;
  change: number; // relativ zu before; 0, wenn before 0 ist
  direction: Direction;
}

export function compareKpis(before: Kpis, after: Kpis): { changes: Record<keyof Kpis, KpiChange>; conflict: boolean } {
  const changes = {} as Record<keyof Kpis, KpiChange>;
  for (const key of Object.keys(before) as (keyof Kpis)[]) {
    const diff = after[key] - before[key];
    const direction: Direction = Math.abs(diff) < 1e-9 ? 'same' : diff > 0 ? 'up' : 'down';
    changes[key] = { before: before[key], after: after[key], change: ratio(diff, Math.abs(before[key])), direction };
  }
  const cr = changes.conversionRate.direction;
  const differs = (other: Direction) => cr !== 'same' && other !== 'same' && cr !== other;
  return { changes, conflict: differs(changes.revenue.direction) || differs(changes.grossProfit.direction) };
}
