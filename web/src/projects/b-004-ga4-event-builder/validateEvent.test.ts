import { describe, expect, it } from 'vitest';
import { BROKEN, VALID_ADD_TO_CART, VALID_PURCHASE, type BrokenId } from './fixtures';
import { MAX_NAME_LENGTH, VALUE_TOLERANCE, validateEvent, type IssueCode } from './validateEvent';

const codes = (event: unknown) => validateEvent(event).map((i) => i.code);

/** Kleines Event mit einem Item; `patch` ersetzt Felder im ecommerce-Objekt. */
function cart(patch: Record<string, unknown> = {}, event = 'add_to_cart') {
  return {
    event,
    ecommerce: {
      value: 30,
      currency: 'EUR',
      items: [{ item_id: 'A-1', item_name: 'Becher', price: 10, quantity: 3 }],
      ...patch,
    },
  };
}
const withItem = (item: Record<string, unknown>) => cart({ items: [item] });

describe('validateEvent: gültige Events', () => {
  it('VALID_PURCHASE hat keine Issues', () => {
    expect(validateEvent(VALID_PURCHASE)).toEqual([]);
  });

  it('VALID_ADD_TO_CART braucht keine transaction_id', () => {
    expect(validateEvent(VALID_ADD_TO_CART)).toEqual([]);
  });

  it('Großbuchstaben im Namen sind erlaubt, nur Konvention ist klein', () => {
    expect(codes(cart({}, 'Add_To_Cart'))).toEqual([]);
  });

  it('ein Event ohne ecommerce mit gültigem Namen ist in Ordnung', () => {
    expect(validateEvent({ event: 'newsletter_signup' })).toEqual([]);
  });

  it('quantity darf fehlen und zählt dann als 1', () => {
    expect(codes(cart({ value: 10, items: [{ item_id: 'A-1', price: 10 }] }))).toEqual([]);
  });

  it('item_name allein reicht', () => {
    expect(codes(withItem({ item_name: 'Becher', price: 10, quantity: 3 }))).toEqual([]);
  });
});

describe('validateEvent: die fünf kaputten Beispiele', () => {
  const expected: Record<BrokenId, { code: IssueCode; path: string }> = {
    'price-string': { code: 'price_not_number', path: 'ecommerce.items[1].price' },
    'currency-missing': { code: 'currency_missing', path: 'ecommerce.currency' },
    'value-mismatch': { code: 'value_mismatch', path: 'ecommerce.value' },
    'name-dash': { code: 'name_format', path: 'event' },
    'purchase-no-id': { code: 'transaction_id_missing', path: 'ecommerce.transaction_id' },
  };

  for (const [id, want] of Object.entries(expected) as [BrokenId, { code: IssueCode; path: string }][]) {
    it(`${id} → genau ein Issue ${want.code} an ${want.path}`, () => {
      const issues = validateEvent(BROKEN[id]);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject(want);
      expect(issues[0]?.message.length).toBeGreaterThan(0);
    });
  }
});

describe('validateEvent: Eventname', () => {
  it(`${MAX_NAME_LENGTH} Zeichen gehen, ${MAX_NAME_LENGTH + 1} nicht`, () => {
    expect(MAX_NAME_LENGTH).toBe(40);
    expect(codes(cart({}, 'a'.repeat(MAX_NAME_LENGTH)))).toEqual([]);
    expect(validateEvent(cart({}, 'a'.repeat(MAX_NAME_LENGTH + 1)))).toEqual([
      expect.objectContaining({ code: 'name_too_long', path: 'event' }),
    ]);
  });

  it('beginnt mit einer Ziffer, enthält Leerzeichen oder fehlt → name_format', () => {
    expect(codes(cart({}, '2nd_purchase'))).toEqual(['name_format']);
    expect(codes(cart({}, 'add to cart'))).toEqual(['name_format']);
    expect(codes(cart({}, ''))).toEqual(['name_format']);
    expect(codes({ ecommerce: cart().ecommerce })).toEqual(['name_format']);
    expect(codes({ event: 42 })).toEqual(['name_format']);
  });

  it('reservierte Präfixe und Namen → name_reserved', () => {
    for (const name of ['google_purchase', 'ga_add', 'firebase_event', 'session_start', 'first_visit', 'user_engagement', 'first_open']) {
      expect(validateEvent({ event: name }), name).toEqual([expect.objectContaining({ code: 'name_reserved', path: 'event' })]);
    }
    // nur am Anfang reserviert
    expect(codes({ event: 'my_google_event' })).toEqual([]);
  });
});

describe('validateEvent: Währung und value', () => {
  it('currency fehlt nur dann, wenn value gesendet wird', () => {
    expect(codes(cart({ currency: undefined }))).toEqual(['currency_missing']);
    expect(codes(cart({ currency: undefined, value: undefined }))).toEqual([]);
  });

  it('currency ist kein dreistelliger Code in Großbuchstaben → currency_format', () => {
    for (const currency of ['eur', 'EURO', '€', 978]) {
      expect(validateEvent(cart({ currency })), String(currency)).toEqual([
        expect.objectContaining({ code: 'currency_format', path: 'ecommerce.currency' }),
      ]);
    }
  });

  it('value als Text → value_not_number, ohne zusätzlich value_mismatch', () => {
    expect(validateEvent(cart({ value: '30' }))).toEqual([
      expect.objectContaining({ code: 'value_not_number', path: 'ecommerce.value' }),
    ]);
    expect(codes(cart({ value: Number.NaN }))).toEqual(['value_not_number']);
  });

  it(`Toleranz ${VALUE_TOLERANCE}: 30,005 bei Summe 30 geht, 30,02 nicht`, () => {
    expect(VALUE_TOLERANCE).toBe(0.01);
    expect(codes(cart({ value: 30.005 }))).toEqual([]);
    expect(codes(cart({ value: 30.01 }))).toEqual([]);
    expect(codes(cart({ value: 29.99 }))).toEqual([]);
    expect(codes(cart({ value: 30.02 }))).toEqual(['value_mismatch']);
    expect(codes(cart({ value: 10 }))).toEqual(['value_mismatch']);
  });
});

describe('validateEvent: Items', () => {
  it('items leer, fehlend oder kein Array → items_empty', () => {
    expect(validateEvent(cart({ items: [] }))).toEqual([
      expect.objectContaining({ code: 'items_empty', path: 'ecommerce.items' }),
    ]);
    expect(codes(cart({ items: undefined }))).toEqual(['items_empty']);
    expect(codes(cart({ items: 'Becher' }))).toEqual(['items_empty']);
  });

  it('ein E-Commerce-Event ganz ohne ecommerce → items_empty', () => {
    expect(codes({ event: 'view_item' })).toEqual(['items_empty']);
    expect(codes({ event: 'purchase' })).toEqual(['transaction_id_missing', 'items_empty']);
  });

  it('weder item_id noch item_name → item_id_missing', () => {
    expect(validateEvent(withItem({ price: 10, quantity: 3 }))).toEqual([
      expect.objectContaining({ code: 'item_id_missing', path: 'ecommerce.items[0].item_id' }),
    ]);
    expect(codes(withItem({ item_id: '', item_name: '', price: 10, quantity: 3 }))).toEqual(['item_id_missing']);
    expect(codes(cart({ value: undefined, items: [null] }))).toEqual(['item_id_missing']);
  });

  it('price als Text → price_not_number am richtigen Item', () => {
    expect(validateEvent(withItem({ item_id: 'A-1', price: '10', quantity: 3 }))).toEqual([
      expect.objectContaining({ code: 'price_not_number', path: 'ecommerce.items[0].price' }),
    ]);
  });

  it('quantity als Text → quantity_not_number, ohne zusätzlich value_mismatch', () => {
    expect(validateEvent(withItem({ item_id: 'A-1', price: 10, quantity: '3' }))).toEqual([
      expect.objectContaining({ code: 'quantity_not_number', path: 'ecommerce.items[0].quantity' }),
    ]);
  });
});

describe('validateEvent: transaction_id', () => {
  it('purchase ohne transaction_id oder mit leerer → transaction_id_missing', () => {
    expect(codes(cart({}, 'purchase'))).toEqual(['transaction_id_missing']);
    expect(codes(cart({ transaction_id: '' }, 'purchase'))).toEqual(['transaction_id_missing']);
    expect(codes(cart({ transaction_id: 'T-1' }, 'purchase'))).toEqual([]);
  });
});

describe('validateEvent: kein Objekt', () => {
  for (const event of [null, undefined, 'purchase', 42, ['purchase']]) {
    it(`${JSON.stringify(event) ?? 'undefined'} → ein Issue mit leerem Pfad, kein Wurf`, () => {
      const issues = validateEvent(event);
      expect(issues).toHaveLength(1);
      expect(issues[0]?.path).toBe('');
      expect(issues[0]?.message.length).toBeGreaterThan(0);
    });
  }
});

describe('validateEvent: jede Meldung', () => {
  it('ist deutscher Text ohne Backticks', () => {
    const events = [
      ...Object.values(BROKEN),
      cart({}, 'a'.repeat(41)),
      { event: 'ga_x' },
      cart({ currency: 'eur' }),
      cart({ value: '30' }),
      cart({ items: [] }),
      withItem({ price: 10, quantity: 3 }),
      withItem({ item_id: 'A', price: 10, quantity: 'x' }),
      null,
    ];
    for (const e of events) {
      for (const issue of validateEvent(e)) {
        expect(issue.message).not.toContain('`');
        expect(issue.message).toMatch(/\.$/);
      }
    }
  });
});
