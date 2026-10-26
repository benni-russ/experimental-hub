import { describe, expect, it } from 'vitest';
import { allText, checkStructure } from '../contentChecks';
import { projects } from '../index';
import { BROKEN, VALID_ADD_TO_CART, VALID_PURCHASE } from '../b-004-ga4-event-builder/fixtures';
import { validateEvent } from '../b-004-ga4-event-builder/validateEvent';
import { meta } from './content';
import { DOUBLE_PUSH, FIELD_ROWS, itemSum, valueFormula } from './compare';

describe('B-004.1 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 0, reflection: [1, 2], cards: [3, 5] })).toEqual([]);
  });

  it('hängt als Einheit an B-004 und steht direkt nach B-004 in der Registrierung', () => {
    expect(meta.kind).toBe('unit');
    expect(meta.attachedTo).toBe('B-004');
    const ids = projects.map((p) => p.meta.id);
    expect(ids.indexOf('B-004')).toBeGreaterThanOrEqual(0);
    expect(ids.indexOf('B-004.1')).toBe(ids.indexOf('B-004') + 1);
  });

  it('Texte nennen keine Zahlen (außer im Namen GA4) und keine Backticks', () => {
    expect(allText(meta).replaceAll('GA4', '')).not.toMatch(/\d/);
    expect(allText(meta)).not.toContain('`');
  });
});

describe('B-004.1 Gezeigte Beispiele', () => {
  it('add_to_cart und purchase bestehen validateEvent ohne Issues', () => {
    expect(validateEvent(VALID_ADD_TO_CART)).toEqual([]);
    expect(validateEvent(VALID_PURCHASE)).toEqual([]);
  });

  it('Unterschiede der Felder stimmen mit den Objekten überein', () => {
    const row = (label: string) => FIELD_ROWS.find((r) => r.label === label);
    expect(row('Eventname')).toMatchObject({ cart: 'add_to_cart', purchase: 'purchase' });
    expect(row('transaction_id')).toMatchObject({ cart: 'fehlt', purchase: 'T-10027' });
    expect(row('shipping')).toMatchObject({ cart: 'fehlt', purchase: '4,90' });
    expect(row('value')).toMatchObject({ cart: '25,00', purchase: '34,99' });
    expect(row('currency')).toMatchObject({ cart: 'EUR', purchase: 'EUR' });
    expect(row('Items')).toMatchObject({ cart: '1', purchase: '2' });
  });

  it('value ist Preis mal Menge, ohne Versand', () => {
    expect(itemSum(VALID_ADD_TO_CART.ecommerce.items)).toBe(25);
    expect(itemSum(VALID_PURCHASE.ecommerce.items)).toBe(VALID_PURCHASE.ecommerce.value);
    expect(valueFormula(VALID_ADD_TO_CART.ecommerce.items)).toBe('12,50 × 2 = 25,00');
    expect(valueFormula(VALID_PURCHASE.ecommerce.items)).toBe('12,50 × 2 + 9,99 × 1 = 34,99');
    // Mit Versand wäre es der Fehlerfall value_mismatch aus B-004.
    expect(Math.round((VALID_PURCHASE.ecommerce.value + VALID_PURCHASE.ecommerce.shipping) * 100) / 100).toBe(39.89);
    expect(validateEvent(BROKEN['value-mismatch']).map((i) => i.code)).toEqual(['value_mismatch']);
  });

  it('zweimal derselbe Kauf: beide Pushes sind einzeln gültig und tragen dieselbe transaction_id', () => {
    expect(DOUBLE_PUSH).toHaveLength(2);
    for (const e of DOUBLE_PUSH) expect(validateEvent(e)).toEqual([]);
    const ids = DOUBLE_PUSH.map((e) => e.ecommerce.transaction_id);
    expect(ids).toEqual(['T-10027', 'T-10027']);
  });

  it('ein purchase ohne transaction_id ist ein Fehler', () => {
    expect(validateEvent(BROKEN['purchase-no-id']).map((i) => i.code)).toEqual(['transaction_id_missing']);
  });
});
