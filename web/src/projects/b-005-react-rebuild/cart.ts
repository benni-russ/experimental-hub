// Der Warenkorb als Zustand: ein Reducer berechnet aus altem Zustand und
// Aktion den neuen, toEvent leitet daraus das add_to_cart-Event ab. Beide
// Fassungen der Demo nutzen dieselben Funktionen; die klassische nur, um zu
// wissen, was sich geändert hat.

export interface CartItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export type CartAction =
  | { type: 'add'; item: CartItem }
  | { type: 'remove'; item_id: string }
  | { type: 'setQuantity'; item_id: string; quantity: number };

export interface CartEvent {
  event: 'add_to_cart';
  ecommerce: { currency: 'EUR'; value: number; items: CartItem[] };
}

export const EMPTY_CART: CartState = { items: [] };

/** Die Artikel der Demo, je mit Menge 1. Becher und Teedose wie in B-004. */
export const CATALOG: CartItem[] = [
  { item_id: 'SKU-101', item_name: 'Kaffeebecher', price: 12.5, quantity: 1 },
  { item_id: 'SKU-205', item_name: 'Teedose', price: 9.99, quantity: 1 },
  { item_id: 'SKU-310', item_name: 'Teesieb', price: 4.5, quantity: 1 },
];

const copy = (item: CartItem): CartItem => ({
  item_id: item.item_id,
  item_name: item.item_name,
  price: item.price,
  quantity: item.quantity,
});

/** Neuer Zustand aus altem Zustand und Aktion; der alte bleibt unverändert. */
export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add': {
      const id = action.item.item_id;
      if (!state.items.some((item) => item.item_id === id)) {
        return { ...state, items: [...state.items, copy(action.item)] };
      }
      return {
        ...state,
        items: state.items.map((item) =>
          item.item_id === id ? { ...item, quantity: item.quantity + action.item.quantity } : item,
        ),
      };
    }
    case 'remove':
      if (!state.items.some((item) => item.item_id === action.item_id)) return state;
      return { ...state, items: state.items.filter((item) => item.item_id !== action.item_id) };
    case 'setQuantity':
      if (!state.items.some((item) => item.item_id === action.item_id)) return state;
      if (action.quantity <= 0) return cartReducer(state, { type: 'remove', item_id: action.item_id });
      return {
        ...state,
        items: state.items.map((item) => (item.item_id === action.item_id ? { ...item, quantity: action.quantity } : item)),
      };
    default:
      return state;
  }
}

/** Summe aus price × quantity, auf Cent gerundet. */
export function cartTotal(state: CartState): number {
  const sum = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
  return Math.round(sum * 100) / 100;
}

/** Das add_to_cart-Event zum Zustand; die Items sind Kopien. */
export function toEvent(state: CartState): CartEvent {
  return {
    event: 'add_to_cart',
    ecommerce: { currency: 'EUR', value: cartTotal(state), items: state.items.map(copy) },
  };
}

/** 34.99 → „34,99 €“ */
export const euro = (n: number) => `${n.toFixed(2).replace('.', ',')} €`;

/** Kurzbeschreibung einer Aktion für das Protokoll */
export function describeAction(state: CartState, action: CartAction): string {
  const name = (id: string) => state.items.find((item) => item.item_id === id)?.item_name ?? id;
  switch (action.type) {
    case 'add':
      return `add „${action.item.item_name}“`;
    case 'remove':
      return `remove „${name(action.item_id)}“`;
    case 'setQuantity':
      return `setQuantity „${name(action.item_id)}“ auf ${action.quantity}`;
  }
}

const articles = (n: number) => (n === 1 ? '1 Zeile' : `${n} Zeilen`);

/** Protokoll der React-Fassung: Aktion → neuer Zustand → Ansicht neu berechnet. */
export function reactSteps(state: CartState, action: CartAction): string[] {
  const next = cartReducer(state, action);
  const pieces = next.items.reduce((n, item) => n + item.quantity, 0);
  return [
    `Aktion: ${describeAction(state, action)}`,
    next === state ? 'Neuer Zustand: derselbe wie vorher, nichts geändert' : `Neuer Zustand: ${pieces} Stück in ${articles(next.items.length)}`,
    `Ansicht neu berechnet: ${articles(next.items.length)}, Summe ${euro(cartTotal(next))}, Event`,
  ];
}
