import { describe, expect, it } from 'vitest';
import { BROKEN, VALID_ADD_TO_CART, VALID_PURCHASE } from '../b-004-ga4-event-builder/fixtures';
import { issueKey, validateEvent } from '../b-004-ga4-event-builder/validateEvent';
import { MUTANT_IDS, MUTANTS, recomputeSum, type MutantId } from './mutants';
import { killMatrix, PRESET_TESTS } from './presetTests';

const codes = (issues: { code: string }[]) => issues.map((i) => i.code).sort();

/** 3 × 0,10 € ergibt in Gleitkomma 0.30000000000000004. */
const DIMES = {
  event: 'add_to_cart',
  ecommerce: { value: 0.3, currency: 'EUR', items: [{ item_id: 'SKU-400', price: 0.1, quantity: 3 }] },
};

/** Je Variante ein Event, bei dem sie anders urteilt als das Original. */
const DIFFERS_AT: Record<MutantId, [string, unknown, string[]]> = {
  'no-tolerance': ['3 × 0,10 € mit value 0.3', DIMES, ['value_mismatch']],
  'ignore-quantity': ['der gültige Kauf (Becher mit Menge 2)', VALID_PURCHASE, ['value_mismatch']],
  'lax-name': ['Eventname mit Bindestrich', BROKEN['name-dash'], []],
  'no-transaction-id': ['Kauf ohne transaction_id', BROKEN['purchase-no-id'], []],
};

/** Events, bei denen alle Varianten wie das Original urteilen sollen. */
const SAME_FOR_ALL: [string, unknown][] = [
  ['kein Objekt', null],
  ['Text statt Event', 'purchase'],
  ['Preis als Text', BROKEN['price-string']],
  // Menge 1: Hier urteilt auch ignore-quantity wie das Original.
  ['Währung fehlt', { event: 'view_item', ecommerce: { value: 9.99, items: [{ item_id: 'SKU-205', price: 9.99, quantity: 1 }] } }],
  ['value enthält Versand', BROKEN['value-mismatch']],
  ['reservierter Präfix', { event: 'google_test' }],
];

describe('MUTANTS', () => {
  it('sind genau die vier Varianten, jede mit Beschriftung', () => {
    expect(MUTANT_IDS).toEqual(['no-tolerance', 'ignore-quantity', 'lax-name', 'no-transaction-id']);
    expect(Object.keys(MUTANTS).sort()).toEqual([...MUTANT_IDS].sort());
    for (const id of MUTANT_IDS) expect(MUTANTS[id].label.length).toBeGreaterThan(0);
  });

  for (const id of Object.keys(DIFFERS_AT) as MutantId[]) {
    const [label, event, mutantCodes] = DIFFERS_AT[id];
    it(`${id} urteilt anders als validateEvent bei: ${label}`, () => {
      expect(codes(validateEvent(event))).not.toEqual(codes(MUTANTS[id].validate(event)));
      expect(codes(MUTANTS[id].validate(event))).toEqual(mutantCodes);
    });
  }

  for (const [label, event] of SAME_FOR_ALL) {
    it(`alle Varianten urteilen wie das Original bei: ${label}`, () => {
      for (const id of MUTANT_IDS) {
        expect(MUTANTS[id].validate(event).map(issueKey), id).toEqual(validateEvent(event).map(issueKey));
      }
    });
  }

  it('die nachgebaute Summenregel urteilt wie das Original, bis in die Meldung', () => {
    const events = [...Object.values(BROKEN), VALID_PURCHASE, VALID_ADD_TO_CART, DIMES, ...SAME_FOR_ALL.map((e) => e[1])];
    for (const event of events) expect(recomputeSum(event, validateEvent(event))).toEqual(validateEvent(event));
  });

  it('Varianten weichen nur in ihrer eigenen Regel ab', () => {
    // Wo eine Variante abweicht, betrifft es nur Issues ihres Codes.
    const own: Record<MutantId, string> = {
      'no-tolerance': 'value_mismatch',
      'ignore-quantity': 'value_mismatch',
      'lax-name': 'name_format',
      'no-transaction-id': 'transaction_id_missing',
    };
    const events = [...Object.values(BROKEN), VALID_PURCHASE, VALID_ADD_TO_CART, DIMES, ...SAME_FOR_ALL.map((e) => e[1])];
    for (const id of MUTANT_IDS) {
      for (const event of events) {
        const others = (list: { code: string }[]) => codes(list.filter((i) => i.code !== own[id]));
        expect(others(MUTANTS[id].validate(event)), id).toEqual(others(validateEvent(event)));
      }
    }
  });

  it('no-tolerance meldet auch eine Abweichung unter einem Cent', () => {
    const event = { ...VALID_PURCHASE, ecommerce: { ...VALID_PURCHASE.ecommerce, value: 35 } };
    expect(codes(validateEvent(event))).toEqual([]);
    expect(codes(MUTANTS['no-tolerance'].validate(event))).toEqual(['value_mismatch']);
  });

  it('ignore-quantity übersieht einen value ohne Menge', () => {
    const event = { ...VALID_ADD_TO_CART, ecommerce: { ...VALID_ADD_TO_CART.ecommerce, value: 12.5 } };
    expect(codes(validateEvent(event))).toEqual(['value_mismatch']);
    expect(codes(MUTANTS['ignore-quantity'].validate(event))).toEqual([]);
  });

  it('lax-name lässt einen fehlenden Namen nicht durch', () => {
    expect(codes(MUTANTS['lax-name'].validate({ ecommerce: VALID_PURCHASE.ecommerce }))).toEqual(
      codes(validateEvent({ ecommerce: VALID_PURCHASE.ecommerce })),
    );
  });
});

describe('PRESET_TESTS', () => {
  it('sind zehn mit eindeutigen IDs und Namen', () => {
    expect(PRESET_TESTS).toHaveLength(10);
    expect(new Set(PRESET_TESTS.map((t) => t.id)).size).toBe(10);
    expect(new Set(PRESET_TESTS.map((t) => t.name)).size).toBe(10);
  });

  it('alle bestehen gegen das Original', async () => {
    const matrix = await killMatrix(PRESET_TESTS);
    for (const t of PRESET_TESTS) expect(matrix[t.id]?.original, t.name).toBe(true);
  });

  it('jede Variante wird von mindestens einem Test erwischt', async () => {
    const matrix = await killMatrix(PRESET_TESTS);
    for (const id of MUTANT_IDS) {
      expect(PRESET_TESTS.some((t) => matrix[t.id]?.[id] === false), id).toBe(true);
    }
  });

  it('mindestens ein Test erwischt keine Variante (Lehrstück: prüft nichts)', async () => {
    const matrix = await killMatrix(PRESET_TESTS);
    const catchesNothing = PRESET_TESTS.filter((t) => MUTANT_IDS.every((id) => matrix[t.id]?.[id] === true));
    expect(catchesNothing.length).toBeGreaterThan(0);
    expect(catchesNothing.map((t) => t.id)).toContain('runs-through');
  });

  it('die Matrix hat je Test eine Zeile mit Original und vier Varianten', async () => {
    const matrix = await killMatrix(PRESET_TESTS);
    expect(Object.keys(matrix)).toEqual(PRESET_TESTS.map((t) => t.id));
    for (const row of Object.values(matrix)) {
      expect(Object.keys(row).sort()).toEqual(['original', ...MUTANT_IDS].sort());
    }
  });

  it('killMatrix meldet einen Test, der schon am Original scheitert', async () => {
    const matrix = await killMatrix([
      { id: 'red', name: 'immer rot', fn: (api) => api.expect(1).toBe(2) },
    ]);
    expect(matrix.red).toEqual({
      original: false,
      'no-tolerance': false,
      'ignore-quantity': false,
      'lax-name': false,
      'no-transaction-id': false,
    });
  });
});
