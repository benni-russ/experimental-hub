import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { Check, CheckModule } from '../../../codeTask/types';
import { BROKEN, VALID_ADD_TO_CART, VALID_PURCHASE } from '../fixtures';

type ValidateEvent = (event: unknown) => unknown;

/** Die Codes, die `validateEvent` für ein Event meldet: ohne Doppelte, sortiert. */
function codesFor(fn: unknown, event: object): string[] {
  if (typeof fn !== 'function') {
    throw new CheckFailure(`\`validateEvent\` soll eine Funktion sein, ist aber ${formatValue(fn)}.`);
  }
  // Jede Prüfung bekommt eine eigene Kopie, falls der Code das Event verändert.
  const result = (fn as ValidateEvent)(structuredClone(event));
  if (!Array.isArray(result)) {
    throw new CheckFailure(`\`validateEvent\` soll ein Array zurückgeben, liefert aber ${formatValue(result)}.`);
  }
  const codes = result.map((issue: unknown) =>
    typeof issue === 'object' && issue !== null ? (issue as { code?: unknown }).code : undefined,
  );
  if (codes.some((c) => typeof c !== 'string')) {
    throw new CheckFailure(
      `Jedes Issue soll ein Objekt mit \`code\` sein, etwa \`{ path, code, message }\`. Bekommen: ${formatValue(result)}.`,
    );
  }
  return [...new Set(codes as string[])].sort();
}

function expectCodes(name: string, event: object, expected: string[]): Check {
  return {
    name,
    run({ exports }) {
      expectEqual(codesFor(exports.validateEvent, event), expected, 'gemeldete Codes');
    },
  };
}

const purchase = VALID_PURCHASE.ecommerce;
/** 0,005 über der Summe: innerhalb der Toleranz von 0,01 */
const withinTolerance = { ...VALID_PURCHASE, ecommerce: { ...purchase, value: purchase.value + 0.005 } };

/** add_to_cart ohne value und currency: dann darf currency fehlen */
const { value: _value, currency: _currency, ...cartRest } = VALID_ADD_TO_CART.ecommerce;
const withoutValueAndCurrency = { ...VALID_ADD_TO_CART, ecommerce: cartRest };

/** Der zweite Artikel ohne quantity: zählt als 1, die Summe bleibt gleich. */
const [cup, tin] = purchase.items;
const { quantity: _quantity, ...tinWithoutQuantity } = tin!;
const withoutQuantity = { ...VALID_PURCHASE, ecommerce: { ...purchase, items: [cup!, tinWithoutQuantity] } };
/** Dasselbe mit falschem value: muss value_mismatch ergeben, nicht durch NaN durchrutschen. */
const withoutQuantityWrongValue = { ...withoutQuantity, ecommerce: { ...withoutQuantity.ecommerce, value: purchase.value + 5 } };

const module: CheckModule = {
  exportsNeeded: ['validateEvent'],
  checks: [
    expectCodes('Der gültige Kauf ergibt `[]`', VALID_PURCHASE, []),
    expectCodes('Ein gültiges `add_to_cart` ohne `transaction_id` ergibt `[]`', VALID_ADD_TO_CART, []),
    expectCodes('Eventname mit Bindestrich: nur `name_format`', BROKEN['name-dash'], ['name_format']),
    expectCodes('Währung fehlt: nur `currency_missing`', BROKEN['currency-missing'], ['currency_missing']),
    expectCodes('Preis als Text: nur `price_not_number`', BROKEN['price-string'], ['price_not_number']),
    expectCodes('`value` ≠ Summe: nur `value_mismatch`', BROKEN['value-mismatch'], ['value_mismatch']),
    expectCodes('Kauf ohne `transaction_id`: nur `transaction_id_missing`', BROKEN['purchase-no-id'], [
      'transaction_id_missing',
    ]),
    expectCodes('Toleranz: `value` 0,005 über der Summe ergibt `[]`', withinTolerance, []),
    expectCodes('Ein `add_to_cart` ohne `value` und `currency` ergibt `[]`', withoutValueAndCurrency, []),
    expectCodes('Ein Item ohne `quantity` zählt einmal: der Kauf ergibt `[]`', withoutQuantity, []),
    expectCodes('Item ohne `quantity` und `value` 5 zu hoch: nur `value_mismatch`', withoutQuantityWrongValue, ['value_mismatch']),
  ],
};

export default module;
