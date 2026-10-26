// Feedprüfung für den Product Feed Inspector (C-002): findet Fehler im Produktfeed,
// sagt, was sie für Empfehlungen bedeuten, und bereinigt den Feed. Wirft nie.
import { CATEGORIES, type Availability, type Product } from './catalog';

export type IssueCode =
  | 'invalid_json'
  | 'duplicate_id'
  | 'missing_field'
  | 'price_format'
  | 'availability_value'
  | 'category_variant'
  | 'stale'
  | 'image_missing';
export type IssueAction = 'repair' | 'drop' | 'warn';

/** Ein Feedeintrag samt Position: `line` ist die 1-basierte Startzeile im Text. */
export interface FeedEntry {
  index: number;
  line: number;
  data: unknown;
}

export interface FeedIssue {
  index: number;
  productId?: string;
  field: string;
  code: IssueCode;
  message: string;
  action?: IssueAction;
}

// Spalte „Wirkung auf Empfehlungen“ aus der Spezifikation.
export const EFFECTS: Record<IssueCode, string> = {
  invalid_json: 'gar keine Empfehlungen',
  duplicate_id: 'Produkt doppelt im Ranking, Verlauf landet beim falschen',
  missing_field: 'Produkt fällt still heraus',
  price_format: 'Preisfilter und Sortierung falsch',
  availability_value: 'Ausverkauftes wird empfohlen',
  category_variant: 'Vorlieben zerfallen in mehrere Kategorien',
  stale: 'falscher Preis oder Bestand angezeigt',
  image_missing: 'Empfehlung ohne Bild wird kaum geklickt',
};

export const STALE_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

const AVAILABILITIES: readonly Availability[] = ['in_stock', 'out_of_stock'];

type Raw = Record<string, unknown>;

const isRecord = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v);

const isBlank = (v: unknown): boolean => v === undefined || v === null || (typeof v === 'string' && v.trim() === '');

/** Bekannte Kategorie, die sich nur in Groß-/Kleinschreibung oder Leerzeichen unterscheidet. */
function repairedCategory(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const key = value.trim().toLowerCase();
  return CATEGORIES.find((c) => c.toLowerCase() === key);
}

export function repairedAvailability(value: unknown): Availability | undefined {
  if (typeof value !== 'string') return undefined;
  const key = value.trim().toLowerCase().replace(/\s+/g, '_');
  return AVAILABILITIES.find((a) => a === key);
}

/**
 * Startzeilen der Einträge im `products`-Array. Zählt Klammertiefe außerhalb von
 * Strings; ein Eintrag beginnt dort, wo auf Tiefe 2 (innerhalb von `products`) ein Wert anfängt.
 */
function entryLines(text: string): number[] {
  const lines: number[] = [];
  let depth = 0;
  let line = 1;
  let inString = false;
  let escaped = false;
  let stringStart = -1;
  let lastKey = '';
  let productsDepth = -1; // Tiefe innerhalb des products-Arrays, sonst -1
  let expectValue = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') {
        inString = false;
        if (depth === 1) {
          // Schlüssel auf Wurzelebene merken (folgt ein Doppelpunkt?)
          const rest = text.slice(i + 1).trimStart();
          if (rest.startsWith(':')) lastKey = JSON.parse(text.slice(stringStart, i + 1)) as string;
        }
      } else if (ch === '\n') line++;
      continue;
    }
    if (ch === '\n') {
      line++;
      continue;
    }
    if (ch === ' ' || ch === '\t' || ch === '\r') continue;
    if (productsDepth === depth && depth > 0 && expectValue && ch !== ']' && ch !== ',') {
      lines.push(line);
      expectValue = false;
    }
    if (ch === '"') {
      inString = true;
      stringStart = i;
    } else if (ch === '{' || ch === '[') {
      if (ch === '[' && depth === 1 && lastKey === 'products' && productsDepth < 0) {
        productsDepth = 2;
        expectValue = true;
      }
      depth++;
    } else if (ch === '}' || ch === ']') {
      depth--;
      if (ch === ']' && productsDepth === 2 && depth === 1) productsDepth = -2; // Array zu Ende
    } else if (ch === ',' && depth === productsDepth) {
      expectValue = true;
    }
  }
  return lines;
}

/** Liest den Text; `undefined`, wenn er kein Objekt mit `products`-Array ist. */
function parseProducts(text: string): unknown[] | undefined {
  try {
    const root: unknown = JSON.parse(text);
    if (isRecord(root) && Array.isArray(root.products)) return root.products;
  } catch {
    // ungültiges JSON: unten gemeldet
  }
  return undefined;
}

export function inspectFeed(text: string, feedDate: string): { products: FeedEntry[]; issues: FeedIssue[] } {
  const list = parseProducts(text);
  if (!list) {
    return {
      products: [],
      issues: [
        {
          index: -1,
          field: 'products',
          code: 'invalid_json',
          message: 'Der Feed lässt sich nicht lesen oder „products“ ist kein Array.',
        },
      ],
    };
  }

  const lines = entryLines(text);
  const products: FeedEntry[] = list.map((data, index) => ({ index, line: lines[index] ?? 1, data }));
  const issues: FeedIssue[] = [];
  const seen = new Set<string>();
  const feedTime = Date.parse(feedDate);

  for (const entry of products) {
    const { index, data } = entry;
    if (!isRecord(data)) {
      issues.push({ index, field: '(Eintrag)', code: 'missing_field', message: 'Der Eintrag ist kein Objekt.', action: 'drop' });
      continue;
    }
    const id = typeof data.id === 'string' && data.id.trim() !== '' ? data.id : undefined;
    const add = (field: string, code: IssueCode, message: string, action: IssueAction) =>
      issues.push({ index, productId: id, field, code, message, action });

    if (id === undefined) add('id', 'missing_field', 'Die id fehlt oder ist keine Zeichenkette.', 'drop');
    else if (seen.has(id)) add('id', 'duplicate_id', `Die id ${id} kam schon in einem früheren Eintrag vor.`, 'drop');
    if (id !== undefined) seen.add(id);

    if (isBlank(data.title) || typeof data.title !== 'string') add('title', 'missing_field', 'Der Titel fehlt.', 'drop');

    if (data.price === undefined || data.price === null) add('price', 'missing_field', 'Der Preis fehlt.', 'drop');
    else if (typeof data.price !== 'number' || !Number.isFinite(data.price) || data.price <= 0)
      add('price', 'price_format', 'Der Preis ist keine Zahl größer als 0.', 'drop');

    if (data.availability === undefined || data.availability === null)
      add('availability', 'missing_field', 'Die Verfügbarkeit fehlt.', 'drop');
    else if (!AVAILABILITIES.some((a) => a === data.availability)) {
      if (repairedAvailability(data.availability))
        add('availability', 'availability_value', 'Die Schreibweise der Verfügbarkeit weicht ab.', 'repair');
      else add('availability', 'availability_value', 'Die Verfügbarkeit hat einen unbekannten Wert.', 'drop');
    }

    if (isBlank(data.category)) add('category', 'missing_field', 'Die Kategorie fehlt.', 'drop');
    else if (!CATEGORIES.some((c) => c === data.category)) {
      if (repairedCategory(data.category))
        add('category', 'category_variant', 'Die Kategorie weicht nur in Schreibweise oder Leerzeichen ab.', 'repair');
      else add('category', 'category_variant', 'Die Kategorie ist unbekannt.', 'drop');
    }

    if (typeof data.updatedAt === 'string') {
      const age = feedTime - Date.parse(data.updatedAt);
      if (Number.isFinite(age) && age > STALE_DAYS * DAY_MS)
        add('updatedAt', 'stale', `Der Eintrag ist älter als ${STALE_DAYS} Tage.`, 'drop');
    }

    if (isBlank(data.imageLink)) add('imageLink', 'image_missing', 'Es gibt keinen Bildlink.', 'warn');
  }

  return { products, issues };
}

/** Wendet die Aktionen an: Einträge mit `drop` entfallen, `repair` wird übernommen. */
export function cleanFeed(products: FeedEntry[], issues: FeedIssue[]): Product[] {
  const dropped = new Set(issues.filter((i) => i.action === 'drop').map((i) => i.index));
  const result: Product[] = [];
  for (const { index, data } of products) {
    if (dropped.has(index) || !isRecord(data)) continue;
    const product: Product = {
      id: String(data.id),
      title: String(data.title),
      category: repairedCategory(data.category) ?? String(data.category),
      brand: typeof data.brand === 'string' ? data.brand : '',
      price: Number(data.price),
      availability: repairedAvailability(data.availability) ?? 'in_stock',
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      sales30d: typeof data.sales30d === 'number' ? data.sales30d : 0,
      updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : '',
    };
    if (typeof data.imageLink === 'string' && data.imageLink.trim() !== '') product.imageLink = data.imageLink;
    result.push(product);
  }
  return result;
}

/**
 * Liest den Feed so, wie ein unachtsames System es täte: jeder Eintrag mit Zahl als Preis
 * zählt, Dubletten und Kategorien bleiben wie geschrieben, unbekannte Verfügbarkeit gilt als lieferbar.
 */
export function readFeedNaively(text: string): Product[] {
  const list = parseProducts(text);
  if (!list) return [];
  const result: Product[] = [];
  for (const data of list) {
    if (!isRecord(data) || typeof data.price !== 'number') continue;
    const product: Product = {
      id: String(data.id),
      title: String(data.title),
      category: String(data.category),
      brand: typeof data.brand === 'string' ? data.brand : '',
      price: data.price,
      availability: data.availability === 'out_of_stock' ? 'out_of_stock' : 'in_stock',
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      sales30d: typeof data.sales30d === 'number' ? data.sales30d : 0,
      updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : '',
    };
    if (typeof data.imageLink === 'string' && data.imageLink !== '') product.imageLink = data.imageLink;
    result.push(product);
  }
  return result;
}
