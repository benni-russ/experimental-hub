import { describe, expect, it } from 'vitest';
import { BROKEN, VALID_ADD_TO_CART, VALID_PURCHASE } from './fixtures';
import { emptyItem, itemSum, parseLiteral, showLiteral, toDraft, toEvent } from './draft';

describe('parseLiteral: Eingabe im Formular → Wert im Event', () => {
  it('leer → fehlt', () => {
    expect(parseLiteral('')).toBeUndefined();
    expect(parseLiteral('   ')).toBeUndefined();
  });

  it('Zahl mit Punkt → Zahl', () => {
    expect(parseLiteral('12.50')).toBe(12.5);
    expect(parseLiteral(' 2 ')).toBe(2);
    expect(parseLiteral('-1')).toBe(-1);
  });

  it('in Anführungszeichen → Text, auch wenn er wie eine Zahl aussieht', () => {
    expect(parseLiteral('"9.99"')).toBe('9.99');
    expect(parseLiteral('""')).toBe('');
  });

  it('alles andere bleibt Text, etwa das deutsche Komma', () => {
    expect(parseLiteral('9,99')).toBe('9,99');
    expect(parseLiteral('zwei')).toBe('zwei');
  });

  it('showLiteral ist die Umkehrung', () => {
    for (const v of [undefined, 12.5, 2, '9.99', '9,99', '', 'zwei']) {
      expect(parseLiteral(showLiteral(v)), String(v)).toBe(v);
    }
    expect(showLiteral('9.99')).toBe('"9.99"');
    expect(showLiteral('9,99')).toBe('9,99');
  });
});

describe('toDraft und toEvent', () => {
  const examples: [string, object][] = [
    ['VALID_PURCHASE', VALID_PURCHASE],
    ['VALID_ADD_TO_CART', VALID_ADD_TO_CART],
    ...Object.entries(BROKEN),
  ];

  for (const [name, event] of examples) {
    it(`${name}: Hin und zurück ergibt dasselbe Event, auch in der Reihenfolge der Felder`, () => {
      expect(JSON.stringify(toEvent(toDraft(event)))).toBe(JSON.stringify(event));
    });
  }

  it('leere Felder fehlen im Event', () => {
    const draft = toDraft(VALID_ADD_TO_CART);
    const event = toEvent({ ...draft, currency: '', value: '', items: [emptyItem()] });
    expect(event).toEqual({ event: 'add_to_cart', ecommerce: { items: [{}] } });
  });

  it('transaction_id und shipping nur beim purchase', () => {
    const draft = { ...toDraft(VALID_PURCHASE), name: 'add_to_cart' };
    const event = toEvent(draft) as { ecommerce: Record<string, unknown> };
    expect(event.ecommerce.transaction_id).toBeUndefined();
    expect(event.ecommerce.shipping).toBeUndefined();
  });

  it('ein Preis mit Komma wird zum Text', () => {
    const draft = toDraft(VALID_ADD_TO_CART);
    const event = toEvent({ ...draft, items: [{ ...draft.items[0]!, price: '12,50' }] }) as {
      ecommerce: { items: { price: unknown }[] };
    };
    expect(event.ecommerce.items[0]?.price).toBe('12,50');
  });
});

describe('itemSum', () => {
  it('rechnet price mal quantity, fehlende Menge zählt 1, gerundet auf Cent', () => {
    expect(itemSum(toDraft(VALID_PURCHASE).items)).toBe(VALID_PURCHASE.ecommerce.value);
    expect(itemSum([{ ...emptyItem(), price: '0.1' }, { ...emptyItem(), price: '0.2' }])).toBe(0.3);
    expect(itemSum([])).toBe(0);
  });

  it('ist nicht berechenbar, sobald ein Preis oder eine Menge Text ist', () => {
    expect(itemSum(toDraft(BROKEN['price-string']).items)).toBeNull();
    expect(itemSum([{ ...emptyItem(), price: '1', quantity: 'zwei' }])).toBeNull();
  });
});
