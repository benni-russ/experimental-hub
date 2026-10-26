// Formularzustand der Demo und Umwandlung in das Event und zurück.
// Zahlenfelder nehmen die Eingabe wörtlich: 9.99 wird eine Zahl, "9.99" (mit
// Anführungszeichen) und 9,99 werden Text. So lassen sich auch kaputte Events bauen.

export interface ItemDraft {
  id: string;
  name: string;
  price: string;
  quantity: string;
}

export interface EventDraft {
  name: string;
  transactionId: string;
  value: string;
  shipping: string;
  currency: string;
  items: ItemDraft[];
}

const NUMBER = /^-?\d+(\.\d+)?$/;
const QUOTED = /^"(.*)"$/;

/** Eingabe → Wert: leer fehlt, Zahl mit Punkt wird Zahl, alles andere Text. */
export function parseLiteral(raw: string): unknown {
  const t = raw.trim();
  if (t === '') return undefined;
  if (NUMBER.test(t)) return Number(t);
  const quoted = QUOTED.exec(t);
  if (quoted) return quoted[1];
  return t;
}

/** Wert → Eingabe; Umkehrung von parseLiteral. */
export function showLiteral(v: unknown): string {
  if (v === undefined || v === null) return '';
  if (typeof v === 'number') return String(v);
  if (typeof v === 'string') return parseLiteral(v) === v ? v : JSON.stringify(v);
  return JSON.stringify(v) ?? '';
}

const text = (v: unknown) => (v === undefined || v === null ? '' : String(v));
const asObject = (v: unknown): Record<string, unknown> =>
  typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};

export const emptyItem = (): ItemDraft => ({ id: '', name: '', price: '', quantity: '' });

export function toDraft(event: object): EventDraft {
  const e = asObject(event);
  const ec = asObject(e.ecommerce);
  const items = Array.isArray(ec.items) ? ec.items : [];
  return {
    name: text(e.event),
    transactionId: text(ec.transaction_id),
    value: showLiteral(ec.value),
    shipping: showLiteral(ec.shipping),
    currency: text(ec.currency),
    items: items.map((raw) => {
      const item = asObject(raw);
      return {
        id: text(item.item_id),
        name: text(item.item_name),
        price: showLiteral(item.price),
        quantity: showLiteral(item.quantity),
      };
    }),
  };
}

/** Nur Felder mit Wert, in der Reihenfolge der Google-Doku. */
function compact(entries: [string, unknown][]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of entries) if (v !== undefined) out[k] = v;
  return out;
}

const textOrNothing = (s: string) => (s.trim() === '' ? undefined : s.trim());

export function toEvent(draft: EventDraft): object {
  const purchase = draft.name === 'purchase';
  return {
    event: draft.name,
    ecommerce: compact([
      ['transaction_id', purchase ? textOrNothing(draft.transactionId) : undefined],
      ['value', parseLiteral(draft.value)],
      ['shipping', purchase ? parseLiteral(draft.shipping) : undefined],
      ['currency', textOrNothing(draft.currency)],
      [
        'items',
        draft.items.map((item) =>
          compact([
            ['item_id', textOrNothing(item.id)],
            ['item_name', textOrNothing(item.name)],
            ['price', parseLiteral(item.price)],
            ['quantity', parseLiteral(item.quantity)],
          ]),
        ),
      ],
    ]),
  };
}

/** Summe aus price × quantity, wenn alle Preise und Mengen Zahlen sind; fehlende Menge zählt 1. */
export function itemSum(items: ItemDraft[]): number | null {
  let sum = 0;
  for (const item of items) {
    const price = parseLiteral(item.price);
    const quantity = parseLiteral(item.quantity);
    if (price !== undefined && typeof price !== 'number') return null;
    if (quantity !== undefined && typeof quantity !== 'number') return null;
    sum += (typeof price === 'number' ? price : 0) * (typeof quantity === 'number' ? quantity : 1);
  }
  return Math.round(sum * 100) / 100;
}
