import { NAME_PATTERN, VALUE_TOLERANCE, validateEvent, type Issue } from '../b-004-ga4-event-builder/validateEvent';

// Vier absichtlich kaputte Fassungen von validateEvent („Fehlervarianten“).
// Jede nimmt das echte Ergebnis und ändert genau eine Regel; alles andere
// urteilt wie das Original (mutants.test.ts prüft das).

export type MutantId = 'no-tolerance' | 'ignore-quantity' | 'lax-name' | 'no-transaction-id';

export const MUTANT_IDS: MutantId[] = ['no-tolerance', 'ignore-quantity', 'lax-name', 'no-transaction-id'];

type Obj = Record<string, unknown>;
const isObject = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Gleitkomma-Spielraum wie im Original, damit 30,01 − 30 noch als ein Cent zählt */
const EPSILON = 1e-9;

interface SumRule {
  /** erlaubte Abweichung zwischen value und Summe */
  tolerance: number;
  /** false: Summe nur aus den Preisen, die Menge fällt unter den Tisch */
  useQuantity: boolean;
}

/**
 * Ersetzt das Issue value_mismatch durch eines nach der angegebenen Regel.
 * Gerechnet wird nur, wenn das Original rechnen konnte: value und alle
 * Preise und Mengen sind Zahlen.
 */
function withSumRule(event: unknown, issues: Issue[], rule: SumRule): Issue[] {
  const rest = issues.filter((i) => i.code !== 'value_mismatch');
  if (!isObject(event) || !isObject(event.ecommerce)) return rest;
  const { value, items } = event.ecommerce;
  if (!isNumber(value) || !Array.isArray(items) || items.length === 0) return rest;
  let sum = 0;
  for (const raw of items) {
    const item: Obj = isObject(raw) ? raw : {};
    if (item.price !== undefined && !isNumber(item.price)) return rest;
    if (item.quantity !== undefined && !isNumber(item.quantity)) return rest;
    const price = isNumber(item.price) ? item.price : 0;
    const quantity = rule.useQuantity && isNumber(item.quantity) ? item.quantity : 1;
    sum += price * quantity;
  }
  if (Math.abs(value - sum) <= rule.tolerance) return rest;
  return [
    ...rest,
    {
      path: 'ecommerce.value',
      code: 'value_mismatch',
      message: `value ist ${value}, die Summe aus price mal quantity aber ${Math.round(sum * 100) / 100}. Versand und Steuer gehören nicht in value.`,
    },
  ];
}

/** Die Regel des Originals, nachgebaut; dient dem Test als Gegenprobe für withSumRule. */
export const ORIGINAL_SUM_RULE: SumRule = { tolerance: VALUE_TOLERANCE + EPSILON, useQuantity: true };
export const recomputeSum = (event: unknown, issues: Issue[]) => withSumRule(event, issues, ORIGINAL_SUM_RULE);

/** Erlaubt zusätzlich den Bindestrich im Eventnamen. */
const LAX_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_-]*$/;

export const MUTANTS: Record<MutantId, { label: string; validate: typeof validateEvent }> = {
  // value muss exakt der Summe entsprechen; 3 × 0,10 ist in Gleitkomma aber 0.30000000000000004.
  'no-tolerance': {
    label: 'Toleranz vergessen',
    validate: (event) => withSumRule(event, validateEvent(event), { tolerance: 0, useQuantity: true }),
  },
  'ignore-quantity': {
    label: 'Menge ignoriert',
    validate: (event) => withSumRule(event, validateEvent(event), { ...ORIGINAL_SUM_RULE, useQuantity: false }),
  },
  // Bindestriche gehen durch; ein fehlender Name wird weiter gemeldet.
  'lax-name': {
    label: 'Namensregel zu lasch',
    validate: (event) => {
      const issues = validateEvent(event);
      const name = isObject(event) ? event.event : undefined;
      const lax = typeof name === 'string' && !NAME_PATTERN.test(name) && LAX_NAME_PATTERN.test(name);
      return lax ? issues.filter((i) => i.code !== 'name_format') : issues;
    },
  },
  'no-transaction-id': {
    label: 'transaction_id nicht geprüft',
    validate: (event) => validateEvent(event).filter((i) => i.code !== 'transaction_id_missing'),
  },
};
