import { fmt } from '../b-004.1-purchase-vs-cart/compare';
import { BROKEN, VALID_PURCHASE, type BrokenId } from '../b-004-ga4-event-builder/fixtures';
import { validateEvent, type IssueCode } from '../b-004-ga4-event-builder/validateEvent';

// Die gezeigten Fehlerfälle: Beschriftung und Fehlercode kommen aus dem Prüfer, die
// Wirkung beschreibt nur, was die Google-Doku belegt (Stand: Oktober 2026).
// Was die Doku nicht beschreibt, steht ausdrücklich als nicht beschrieben da.

export { fmt };

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Um wie viel value im Fehlerfall value-mismatch über dem richtigen Wert liegt (der Versand). */
export const VALUE_EXCESS = round2(
  (BROKEN['value-mismatch'] as typeof VALID_PURCHASE).ecommerce.value - VALID_PURCHASE.ecommerce.value,
);

export interface Case {
  id: BrokenId;
  /** Der einzige Code, den validateEvent für diesen Fall meldet. */
  code: IssueCode;
  effect: string;
}

export const CASES: Case[] = [
  {
    id: 'price-string',
    code: 'price_not_number',
    effect:
      'Der Preis kommt als Text an. Wie GA4 das verbucht, beschreibt Google nicht; sicher ist nur, dass keine Fehlermeldung zurückkommt. Hier hilft ein Blick in den DebugView.',
  },
  {
    id: 'currency-missing',
    code: 'currency_missing',
    effect:
      'Google empfiehlt, die Währung auf Event-Ebene zu setzen, sobald value gesendet wird. Fehlt sie, rechnet GA4 den Umsatz nicht richtig.',
  },
  {
    id: 'value-mismatch',
    code: 'value_mismatch',
    effect: `value enthält den Versand und liegt um ${fmt(VALUE_EXCESS)} zu hoch: Laut Google ist value die Summe aus Preis mal Menge der Items, ohne Versand und Steuer.`,
  },
  {
    id: 'name-dash',
    code: 'name_format',
    effect:
      'Der Name verstößt gegen die Namensregeln, denn Bindestriche sind nicht erlaubt. Was GA4 mit so einem Event macht, beschreibt Google nicht.',
  },
  {
    id: 'purchase-no-id',
    code: 'transaction_id_missing',
    effect:
      'Die transaction_id ist für Käufe Pflicht. Mit ihr dedupliziert Analytics doppelt gesendete Käufe; ohne sie fehlt dieser Schutz.',
  },
];

export interface CheckItem {
  text: string;
  /** Welche Codes des Prüfers diesen Punkt abdecken. */
  codes: IssueCode[];
}

export const CHECKLIST: CheckItem[] = [
  { text: 'Der Eventname folgt den Namensregeln: Buchstabe am Anfang, nur Buchstaben, Ziffern und Unterstriche, nicht reserviert.', codes: ['name_format', 'name_too_long', 'name_reserved'] },
  { text: 'Jedes Event mit value sendet auch eine currency. Der Prüfer erwartet einen dreistelligen Code.', codes: ['currency_missing', 'currency_format'] },
  { text: 'value ist die Summe aus Preis mal Menge, ohne Versand und Steuer.', codes: ['value_mismatch', 'value_not_number'] },
  { text: 'Preise und Mengen sind Zahlen, keine Texte aus einem Formularfeld.', codes: ['price_not_number', 'quantity_not_number'] },
  { text: 'Jedes Item hat eine item_id oder einen item_name. Der Prüfer verlangt außerdem mindestens ein Item.', codes: ['item_id_missing', 'items_empty'] },
  { text: 'Jeder Kauf trägt eine eigene, nicht leere transaction_id.', codes: ['transaction_id_missing'] },
];

/** Die Codes, die der Prüfer für einen Fall tatsächlich meldet. */
export const codesOf = (id: BrokenId) => validateEvent(BROKEN[id]).map((i) => i.code);
