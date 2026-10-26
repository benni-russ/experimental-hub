import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { Check, CheckModule } from '../../../codeTask/types';

type CheckProduct = (product: unknown) => unknown;

const VALID = {
  id: 'A',
  title: 'Trailschuh',
  category: 'Laufschuhe',
  price: 99.9,
  availability: 'in_stock',
};

/** Ein gültiges Produkt mit Änderungen; `undefined` entfernt das Feld. */
function product(changes: Record<string, unknown> = {}): Record<string, unknown> {
  const p: Record<string, unknown> = { ...VALID, ...changes };
  for (const key of Object.keys(p)) if (p[key] === undefined) delete p[key];
  return p;
}

/** Vergleicht die Codes als Menge: Reihenfolge egal, aber jeder Code höchstens einmal. */
function expectCodes(name: string, input: Record<string, unknown>, expected: string[]): Check {
  return {
    name,
    run({ exports }) {
      const fn = exports.checkProduct;
      if (typeof fn !== 'function') {
        throw new CheckFailure(`\`checkProduct\` soll eine Funktion sein, ist aber ${formatValue(fn)}.`);
      }
      const before = structuredClone(input);
      const result = (fn as CheckProduct)(input);
      if (!Array.isArray(result) || result.some((c) => typeof c !== 'string')) {
        throw new CheckFailure(`\`checkProduct\` soll eine Liste von Texten zurückgeben, liefert aber ${formatValue(result)}.`);
      }
      expectEqual([...result].sort(), [...expected].sort(), 'gemeldete Codes');
      expectEqual(input, before, 'Eingabe nach dem Aufruf');
    },
  };
}

const module: CheckModule = {
  exportsNeeded: ['checkProduct'],
  checks: [
    expectCodes('Ein gültiges Produkt ergibt `[]`', product(), []),
    expectCodes('Titel fehlt: `missing_field`', product({ title: undefined }), ['missing_field']),
    expectCodes('Leere Kategorie: `missing_field`', product({ category: '' }), ['missing_field']),
    expectCodes('Preis fehlt: nur `missing_field`, kein `price_format`', product({ price: undefined }), ['missing_field']),
    expectCodes('Preis als Text: `price_format`', product({ price: '49,90 €' }), ['price_format']),
    expectCodes('Preis `0`: `price_format`', product({ price: 0 }), ['price_format']),
    expectCodes('Negativer Preis: `price_format`', product({ price: -5 }), ['price_format']),
    expectCodes('Verfügbarkeit „Out of Stock“: `availability_value`', product({ availability: 'Out of Stock' }), [
      'availability_value',
    ]),
    expectCodes('`out_of_stock` ist ein gültiger Wert', product({ availability: 'out_of_stock' }), []),
    expectCodes('Mehrere Fehler zugleich: alle drei Codes', product({ id: undefined, price: 'gratis', availability: 'bald' }), [
      'missing_field',
      'price_format',
      'availability_value',
    ]),
    expectCodes('Zwei fehlende Felder: `missing_field` nur einmal', product({ id: undefined, title: undefined }), ['missing_field']),
  ],
};

export default module;
