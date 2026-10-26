// Prüfer für GA4-E-Commerce-Events im dataLayer-Format
// { event, ecommerce: { transaction_id, value, currency, items: [...] } }.
// Die Regeln folgen der Google-Doku (Stand: Oktober 2026, Quellen in UnderTheHood.tsx).
// Meldungen sind reiner Text ohne Backticks: Die Demo zeigt sie unformatiert.

import { MAX_NAME_LENGTH } from './limits';

export type IssueCode =
  | 'name_format'
  | 'name_too_long'
  | 'name_reserved'
  | 'currency_missing'
  | 'currency_format'
  | 'value_not_number'
  | 'value_mismatch'
  | 'items_empty'
  | 'item_id_missing'
  | 'price_not_number'
  | 'quantity_not_number'
  | 'transaction_id_missing';

export interface Issue {
  /** Stelle im Event, z. B. ecommerce.items[1].price; '' für das ganze Event */
  path: string;
  code: IssueCode;
  message: string;
}

/** Schlüssel eines Issues: Code und Pfad zusammen, weil ein Pfad mehrere Issues haben kann. */
export const issueKey = (issue: Issue) => `${issue.code}@${issue.path}`;

/** Erlaubte Abweichung zwischen value und der Summe der Items, wegen Rundung */
export const VALUE_TOLERANCE = 0.01;
export { MAX_NAME_LENGTH };

/** Beginnt mit einem Buchstaben, danach Buchstaben, Ziffern, Unterstrich. Klein ist Konvention, keine Regel. */
export const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;
export const RESERVED_PREFIXES = ['google_', 'ga_', 'firebase_'];
/** Eine Auswahl; die Liste bei Google ist länger. */
export const RESERVED_NAMES = ['session_start', 'first_visit', 'user_engagement', 'first_open'];
/** Diese Events brauchen ein ecommerce-Objekt mit Items, auch wenn es fehlt. */
export const ECOMMERCE_EVENTS = ['view_item', 'add_to_cart', 'purchase'];

const CURRENCY_PATTERN = /^[A-Z]{3}$/;
/** Gleitkomma: 30,01 − 30 ist minimal mehr als 0,01 und soll noch durchgehen. */
const EPSILON = 1e-9;

type Obj = Record<string, unknown>;

const isObject = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isPresent = (v: unknown) => v !== undefined && v !== null && v !== '';

/** Wert für Meldungen: Texte in Anführungszeichen, damit man sie von Zahlen unterscheidet. */
function show(v: unknown): string {
  if (v === undefined) return 'undefined';
  if (typeof v === 'number') return Number.isNaN(v) ? 'NaN' : String(v);
  try {
    return JSON.stringify(v) ?? String(v);
  } catch {
    return String(v);
  }
}

function kind(v: unknown): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'eine Liste';
  if (typeof v === 'string') return 'ein Text';
  if (typeof v === 'number') return 'keine gültige Zahl';
  return `vom Typ ${typeof v}`;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function checkName(name: unknown, issues: Issue[]): void {
  const add = (code: IssueCode, message: string) => issues.push({ path: 'event', code, message });
  if (typeof name !== 'string' || name === '') {
    add('name_format', `Der Eventname fehlt; event ist ${show(name)}.`);
    return;
  }
  if (!NAME_PATTERN.test(name)) {
    add(
      'name_format',
      `Der Eventname ${show(name)} ist ungültig: Er muss mit einem Buchstaben beginnen und darf nur Buchstaben, Ziffern und Unterstriche enthalten.`,
    );
  }
  if (name.length > MAX_NAME_LENGTH) {
    add('name_too_long', `Der Eventname hat ${name.length} Zeichen, erlaubt sind höchstens ${MAX_NAME_LENGTH}.`);
  }
  const prefix = RESERVED_PREFIXES.find((p) => name.startsWith(p));
  if (prefix) {
    add('name_reserved', `Der Eventname beginnt mit ${show(prefix)}; dieser Präfix ist für Google reserviert.`);
  } else if (RESERVED_NAMES.includes(name)) {
    add('name_reserved', `Den Eventnamen ${show(name)} verwendet GA4 selbst; er ist reserviert.`);
  }
}

/** Prüft ein Event und liefert alle gefundenen Issues; wirft nie. */
export function validateEvent(event: unknown): Issue[] {
  if (!isObject(event)) {
    return [
      {
        path: '',
        code: 'name_format',
        message: `Das Event muss ein Objekt mit dem Feld event sein, ist aber ${show(event)}.`,
      },
    ];
  }

  const issues: Issue[] = [];
  checkName(event.event, issues);

  const ecommerceGiven = event.ecommerce !== undefined && event.ecommerce !== null;
  // Kein String(): Ein Objekt ohne Prototyp oder mit werfendem toString soll nicht werfen.
  const isEcommerceName = typeof event.event === 'string' && ECOMMERCE_EVENTS.includes(event.event);
  if (!ecommerceGiven && !isEcommerceName) return issues;
  const ec: Obj = isObject(event.ecommerce) ? event.ecommerce : {};

  if (event.event === 'purchase' && !isPresent(ec.transaction_id)) {
    issues.push({
      path: 'ecommerce.transaction_id',
      code: 'transaction_id_missing',
      message: 'Ein purchase braucht eine transaction_id, die den Kauf eindeutig kennzeichnet.',
    });
  }

  if (ec.currency === undefined || ec.currency === null || ec.currency === '') {
    if (ec.value !== undefined) {
      issues.push({
        path: 'ecommerce.currency',
        code: 'currency_missing',
        message: 'Das Event sendet value, aber keine currency. Ohne Währung lässt sich der Umsatz nicht richtig zählen.',
      });
    }
  } else if (typeof ec.currency !== 'string' || !CURRENCY_PATTERN.test(ec.currency)) {
    issues.push({
      path: 'ecommerce.currency',
      code: 'currency_format',
      message: `currency ist ${show(ec.currency)}, erwartet ist ein dreistelliger Code in Großbuchstaben wie "EUR".`,
    });
  }

  const valueIsNumber = isNumber(ec.value);
  if (ec.value !== undefined && !valueIsNumber) {
    issues.push({
      path: 'ecommerce.value',
      code: 'value_not_number',
      message: `value ist ${show(ec.value)} und damit ${kind(ec.value)}, erwartet ist eine Zahl.`,
    });
  }

  const items = ec.items;
  if (!Array.isArray(items) || items.length === 0) {
    issues.push({
      path: 'ecommerce.items',
      code: 'items_empty',
      message: Array.isArray(items)
        ? 'Die Liste items ist leer; das Event braucht mindestens ein Item.'
        : 'Das Event hat keine Liste items; es braucht mindestens ein Item.',
    });
    return issues;
  }

  // Die Summe nur rechnen, wenn alle Preise und Mengen Zahlen sind; sonst gibt
  // es schon ein Issue, und ein zweites zur Summe hilft nicht weiter.
  let sum = 0;
  let sumKnown = true;
  items.forEach((raw, i) => {
    const at = `ecommerce.items[${i}]`;
    const item: Obj = isObject(raw) ? raw : {};
    if (!isPresent(item.item_id) && !isPresent(item.item_name)) {
      issues.push({
        path: `${at}.item_id`,
        code: 'item_id_missing',
        message: `Item ${i + 1} hat weder item_id noch item_name; mindestens eins davon ist Pflicht.`,
      });
    }
    let price = 0;
    if (item.price !== undefined) {
      if (isNumber(item.price)) price = item.price;
      else {
        sumKnown = false;
        issues.push({
          path: `${at}.price`,
          code: 'price_not_number',
          message: `Der Preis von Item ${i + 1} ist ${show(item.price)} und damit ${kind(item.price)}, erwartet ist eine Zahl.`,
        });
      }
    }
    let quantity = 1;
    if (item.quantity !== undefined) {
      if (isNumber(item.quantity)) quantity = item.quantity;
      else {
        sumKnown = false;
        issues.push({
          path: `${at}.quantity`,
          code: 'quantity_not_number',
          message: `Die Menge von Item ${i + 1} ist ${show(item.quantity)} und damit ${kind(item.quantity)}, erwartet ist eine Zahl.`,
        });
      }
    }
    sum += price * quantity;
  });

  if (valueIsNumber && sumKnown && Math.abs((ec.value as number) - sum) > VALUE_TOLERANCE + EPSILON) {
    issues.push({
      path: 'ecommerce.value',
      code: 'value_mismatch',
      message: `value ist ${show(ec.value)}, die Summe aus price mal quantity aber ${round2(sum)}. Versand und Steuer gehören nicht in value.`,
    });
  }

  return issues;
}
