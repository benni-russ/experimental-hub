import { describe, expect, it } from 'vitest';
import { validateEvent } from '../b-004-ga4-event-builder/validateEvent';
import { CATALOG, cartReducer, EMPTY_CART, euro, reactSteps, toEvent, type CartItem, type CartState } from './cart';

const cup: CartItem = { item_id: 'SKU-101', item_name: 'Kaffeebecher', price: 12.5, quantity: 1 };
const tin: CartItem = { item_id: 'SKU-205', item_name: 'Teedose', price: 9.99, quantity: 1 };

/** Friert den Zustand bis in die Items ein: Jede Veränderung wirft im strikten Modus. */
function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null) {
    for (const v of Object.values(value)) deepFreeze(v);
    Object.freeze(value);
  }
  return value;
}

const cart = (...items: CartItem[]): CartState => deepFreeze({ items: items.map((i) => ({ ...i })) });

describe('cartReducer', () => {
  it('add hängt ein neues Item hinten an', () => {
    const next = cartReducer(cart(cup), { type: 'add', item: tin });
    expect(next.items).toEqual([cup, tin]);
  });

  it('add mit gleicher item_id erhöht die Menge statt eine zweite Zeile anzulegen', () => {
    const next = cartReducer(cart(cup, tin), { type: 'add', item: { ...cup, quantity: 2 } });
    expect(next.items).toEqual([{ ...cup, quantity: 3 }, tin]);
  });

  it('add kopiert das Item: spätere Änderungen am Aktionsobjekt wirken nicht', () => {
    const item = { ...tin };
    const next = cartReducer(cart(), { type: 'add', item });
    item.quantity = 9;
    expect(next.items[0]?.quantity).toBe(1);
  });

  it('remove entfernt das Item', () => {
    expect(cartReducer(cart(cup, tin), { type: 'remove', item_id: cup.item_id }).items).toEqual([tin]);
  });

  it('setQuantity setzt die Menge', () => {
    expect(cartReducer(cart(cup, tin), { type: 'setQuantity', item_id: tin.item_id, quantity: 4 }).items).toEqual([
      cup,
      { ...tin, quantity: 4 },
    ]);
  });

  it('setQuantity 0 (oder weniger) entfernt das Item', () => {
    expect(cartReducer(cart(cup, tin), { type: 'setQuantity', item_id: cup.item_id, quantity: 0 }).items).toEqual([tin]);
    expect(cartReducer(cart(cup, tin), { type: 'setQuantity', item_id: cup.item_id, quantity: -1 }).items).toEqual([tin]);
  });

  it('unbekannte item_id ändert nichts', () => {
    const state = cart(cup);
    expect(cartReducer(state, { type: 'remove', item_id: 'gibt-es-nicht' })).toEqual(state);
    expect(cartReducer(state, { type: 'setQuantity', item_id: 'gibt-es-nicht', quantity: 3 })).toEqual(state);
  });

  it('der alte Zustand bleibt bei jeder Aktion unverändert (tief eingefroren)', () => {
    const state = cart(cup, tin);
    const snapshot = structuredClone(state);
    cartReducer(state, { type: 'add', item: cup });
    cartReducer(state, { type: 'add', item: { item_id: 'SKU-310', item_name: 'Teesieb', price: 4.5, quantity: 1 } });
    cartReducer(state, { type: 'remove', item_id: cup.item_id });
    cartReducer(state, { type: 'setQuantity', item_id: tin.item_id, quantity: 5 });
    cartReducer(state, { type: 'setQuantity', item_id: tin.item_id, quantity: 0 });
    expect(state).toEqual(snapshot);
  });

  it('jede Änderung liefert ein neues Objekt', () => {
    const state = cart(cup);
    expect(cartReducer(state, { type: 'setQuantity', item_id: cup.item_id, quantity: 2 })).not.toBe(state);
  });
});

describe('toEvent', () => {
  it('value ist die Summe aus price × quantity', () => {
    const event = toEvent(cart({ ...cup, quantity: 2 }, tin));
    expect(event.event).toBe('add_to_cart');
    expect(event.ecommerce.currency).toBe('EUR');
    expect(event.ecommerce.value).toBe(34.99);
  });

  it('value ist auf Cent gerundet', () => {
    // 3 × 0,1 ergibt in Gleitkomma 0.30000000000000004.
    const dime: CartItem = { item_id: 'X', item_name: 'Zehner', price: 0.1, quantity: 3 };
    expect(0.1 * 3).not.toBe(0.3);
    expect(toEvent(cart(dime)).ecommerce.value).toBe(0.3);
  });

  it('die Items sind Kopien ohne gemeinsame Referenzen', () => {
    const state = cart(cup);
    const event = toEvent(state);
    expect(event.ecommerce.items).toEqual(state.items);
    expect(event.ecommerce.items).not.toBe(state.items);
    expect(event.ecommerce.items[0]).not.toBe(state.items[0]);
  });

  it('besteht validateEvent aus B-004 ohne Issues', () => {
    expect(validateEvent(toEvent(cart({ ...cup, quantity: 2 }, tin)))).toEqual([]);
    expect(validateEvent(toEvent(cart(...CATALOG.map((c) => ({ ...c, quantity: 3 })))))).toEqual([]);
  });
});

describe('Hilfen', () => {
  it('euro schreibt deutsch mit Komma', () => {
    expect(euro(34.99)).toBe('34,99 €');
    expect(euro(0)).toBe('0,00 €');
  });

  it('der leere Warenkorb ist leer', () => {
    expect(EMPTY_CART).toEqual({ items: [] });
  });

  it('reactSteps: Aktion → neuer Zustand → Ansicht neu berechnet', () => {
    const steps = reactSteps(cart(), { type: 'add', item: cup });
    expect(steps).toHaveLength(3);
    expect(steps[0]).toMatch(/^Aktion: /);
    expect(steps[1]).toMatch(/^Neuer Zustand: /);
    expect(steps[2]).toMatch(/^Ansicht neu berechnet: /);
    expect(steps[2]).toContain(euro(12.5));
  });
});
