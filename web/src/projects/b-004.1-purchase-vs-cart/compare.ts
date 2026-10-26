import { VALID_ADD_TO_CART, VALID_PURCHASE } from '../b-004-ga4-event-builder/fixtures';

// Die Vergleichstabelle und die Rechnung der Erklärung. Alle Werte kommen aus den
// Beispielobjekten, damit content.test.ts sie nachrechnen kann.

type Obj = Record<string, unknown>;

/** Zahl deutsch mit zwei Nachkommastellen: 4.9 wird "4,90". */
export const fmt = (n: number) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const round2 = (n: number) => Math.round(n * 100) / 100;

interface Item {
  price: number;
  quantity: number;
}

/** Summe aus Preis mal Menge, wie GA4 value definiert. */
export const itemSum = (items: Item[]) => round2(items.reduce((sum, i) => sum + i.price * i.quantity, 0));

/** Die Rechnung als Text, z. B. "12,50 × 2 + 9,99 × 1 = 34,99". */
export const valueFormula = (items: Item[]) =>
  `${items.map((i) => `${fmt(i.price)} × ${i.quantity}`).join(' + ')} = ${fmt(itemSum(items))}`;

const ecommerce = (e: object) => (e as { ecommerce: Obj }).ecommerce;

function cell(value: unknown): string {
  if (value === undefined) return 'fehlt';
  if (typeof value === 'number') return fmt(value);
  return String(value);
}

export interface FieldRow {
  label: string;
  cart: string;
  purchase: string;
}

const field = (label: string, key: string): FieldRow => ({
  label,
  cart: cell(ecommerce(VALID_ADD_TO_CART)[key]),
  purchase: cell(ecommerce(VALID_PURCHASE)[key]),
});

export const FIELD_ROWS: FieldRow[] = [
  { label: 'Eventname', cart: VALID_ADD_TO_CART.event, purchase: VALID_PURCHASE.event },
  field('transaction_id', 'transaction_id'),
  field('value', 'value'),
  field('shipping', 'shipping'),
  field('currency', 'currency'),
  {
    label: 'Items',
    cart: String(VALID_ADD_TO_CART.ecommerce.items.length),
    purchase: String(VALID_PURCHASE.ecommerce.items.length),
  },
];

/** Derselbe Kauf zweimal gesendet, etwa weil die Bestätigungsseite neu geladen wurde. */
export const DOUBLE_PUSH = [VALID_PURCHASE, VALID_PURCHASE];
