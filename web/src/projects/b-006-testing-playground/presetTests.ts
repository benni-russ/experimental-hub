import { BROKEN, VALID_ADD_TO_CART, VALID_PURCHASE } from '../b-004-ga4-event-builder/fixtures';
import { validateEvent } from '../b-004-ga4-event-builder/validateEvent';
import { createTestApi } from './miniTest';
import { MUTANT_IDS, MUTANTS, type MutantId } from './mutants';

// Zehn vorbereitete Tests für die Demo. Jeder ist der Rumpf eines test(…):
// Er bekommt die Test-API und die zu prüfende Fassung von validateEvent.
// Welche Variante welcher Test erwischt, rechnet killMatrix aus; die Texte in
// content.ts stützen sich darauf (content.test.ts).

export interface PresetTest {
  id: string;
  name: string;
  fn: (api: ReturnType<typeof createTestApi>, validate: typeof validateEvent) => void;
}

const codes = (issues: { code: string }[]) => issues.map((i) => i.code);
const has = (issues: { code: string }[], code: string) => codes(issues).includes(code);

export const PRESET_TESTS: PresetTest[] = [
  {
    id: 'valid-purchase',
    name: 'Ein gültiger Kauf hat keine Issues',
    fn: ({ expect }, validate) => expect(validate(VALID_PURCHASE)).toEqual([]),
  },
  {
    id: 'reserved-prefix',
    name: 'Der Präfix google_ wird gemeldet',
    fn: ({ expect }, validate) => expect(has(validate({ event: 'google_test' }), 'name_reserved')).toBe(true),
  },
  {
    id: 'purchase-no-id',
    name: 'Ein Kauf ohne transaction_id wird gemeldet',
    fn: ({ expect }, validate) => expect(has(validate(BROKEN['purchase-no-id']), 'transaction_id_missing')).toBe(true),
  },
  {
    id: 'name-dash',
    name: 'Ein Bindestrich im Eventnamen wird gemeldet',
    fn: ({ expect }, validate) => expect(has(validate(BROKEN['name-dash']), 'name_format')).toBe(true),
  },
  {
    id: 'value-with-shipping',
    name: 'value mit Versand passt nicht zur Summe',
    fn: ({ expect }, validate) => expect(has(validate(BROKEN['value-mismatch']), 'value_mismatch')).toBe(true),
  },
  {
    id: 'dimes',
    name: '3 × 0,10 € mit value 0.3 ist gültig',
    fn: ({ expect }, validate) =>
      expect(
        validate({
          event: 'add_to_cart',
          ecommerce: { value: 0.3, currency: 'EUR', items: [{ item_id: 'SKU-400', price: 0.1, quantity: 3 }] },
        }),
      ).toEqual([]),
  },
  {
    id: 'one-cent',
    name: 'Ein Cent Abweichung ist erlaubt',
    fn: ({ expect }, validate) =>
      expect(
        validate({
          event: 'add_to_cart',
          ecommerce: { value: 10.01, currency: 'EUR', items: [{ item_id: 'SKU-500', price: 10, quantity: 1 }] },
        }),
      ).toEqual([]),
  },
  {
    id: 'quantity-counts',
    name: 'Die Menge zählt in der Summe mit',
    fn: ({ expect }, validate) =>
      expect(
        has(validate({ ...VALID_ADD_TO_CART, ecommerce: { ...VALID_ADD_TO_CART.ecommerce, value: 12.5 } }), 'value_mismatch'),
      ).toBe(true),
  },
  {
    id: 'no-object',
    name: 'Kein Objekt: validateEvent liefert trotzdem eine Liste',
    fn: ({ expect }, validate) => expect(Array.isArray(validate(null))).toBe(true),
  },
  {
    // Lehrstück: ruft validateEvent auf, schaut sich das Ergebnis aber nicht an.
    id: 'runs-through',
    name: 'Ein gültiger Kauf läuft durch',
    fn: ({ expect }, validate) => {
      validate(VALID_PURCHASE);
      expect(true).toBe(true);
    },
  },
];

export type MatrixRow = Record<MutantId | 'original', boolean>;

/**
 * Lässt jeden Test gegen das Original und jede Variante laufen. Ein Eintrag
 * ist true, wenn der Test bestanden hat; false heißt gescheitert, bei einer
 * Variante also: Der Test hat sie erwischt.
 */
export async function killMatrix(tests: PresetTest[]): Promise<Record<string, MatrixRow>> {
  const variants: [MutantId | 'original', typeof validateEvent][] = [
    ['original', validateEvent],
    ...MUTANT_IDS.map((id): [MutantId, typeof validateEvent] => [id, MUTANTS[id].validate]),
  ];
  const matrix: Record<string, MatrixRow> = {};
  for (const t of tests) {
    const row = {} as MatrixRow;
    for (const [variant, validate] of variants) {
      const api = createTestApi();
      api.test(t.name, () => t.fn(api, validate));
      const [outcome] = await api.runAll();
      row[variant] = outcome?.passed ?? false;
    }
    matrix[t.id] = row;
  }
  return matrix;
}
