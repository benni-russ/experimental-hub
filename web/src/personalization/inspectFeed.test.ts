import { describe, expect, it } from 'vitest';
import { EFFECTS, STALE_DAYS, cleanFeed, inspectFeed, readFeedNaively } from './inspectFeed';
import { FEED_DATE, RAW_FEED } from './rawFeed';

const good = {
  id: 'X1', title: 'Test', category: 'Jacken', brand: 'B', price: 10, availability: 'in_stock',
  imageLink: 'https://x.example/x1.jpg', tags: ['a'], sales30d: 1, updatedAt: '2026-10-25T00:00:00Z',
};
const feed = (...entries: unknown[]) => JSON.stringify({ products: entries });
const run = (...entries: unknown[]) => inspectFeed(feed(...entries), FEED_DATE);

describe('inspectFeed: je Regel', () => {
  it('fehlerfreier Eintrag ergibt keine Issues', () => {
    expect(run(good).issues).toEqual([]);
  });

  it('invalid_json: kaputter Text und products kein Array', () => {
    for (const text of ['{', '[]', '{"products": 5}', 'null']) {
      const r = inspectFeed(text, FEED_DATE);
      expect(r.products).toEqual([]);
      expect(r.issues).toHaveLength(1);
      expect(r.issues[0]).toMatchObject({ index: -1, code: 'invalid_json' });
      expect(r.issues[0]!.action).toBeUndefined();
    }
  });

  it('duplicate_id trifft nur den späteren Eintrag', () => {
    const { issues } = run(good, { ...good });
    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ index: 1, code: 'duplicate_id', action: 'drop', productId: 'X1' });
  });

  it('missing_field: fehlender Titel, Preis, Verfügbarkeit, Kategorie, id', () => {
    for (const field of ['id', 'title', 'price', 'availability', 'category']) {
      const e: Record<string, unknown> = { ...good };
      delete e[field];
      const { issues } = run(e);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({ field, code: 'missing_field', action: 'drop' });
    }
  });

  it('price_format: Text, 0 und negativ', () => {
    for (const price of ['49,90 €', 0, -3]) {
      const { issues } = run({ ...good, price });
      expect(issues).toHaveLength(1);
      expect(issues[0]).toMatchObject({ code: 'price_format', action: 'drop' });
    }
  });

  it('availability_value: bekannte Schreibweise wird repariert, unbekannter Wert fällt heraus', () => {
    expect(run({ ...good, availability: 'In Stock' }).issues[0]).toMatchObject({
      code: 'availability_value',
      action: 'repair',
    });
    expect(run({ ...good, availability: 'out of stock' }).issues[0]).toMatchObject({ action: 'repair' });
    expect(run({ ...good, availability: 'maybe' }).issues[0]).toMatchObject({
      code: 'availability_value',
      action: 'drop',
    });
  });

  it('category_variant: Schreibweise repair, unbekannte Kategorie drop', () => {
    expect(run({ ...good, category: ' jacken' }).issues[0]).toMatchObject({ code: 'category_variant', action: 'repair' });
    expect(run({ ...good, category: 'Hüte' }).issues[0]).toMatchObject({ code: 'category_variant', action: 'drop' });
  });

  it('stale: genau 7 Tage ist noch frisch, mehr ist veraltet', () => {
    expect(STALE_DAYS).toBe(7);
    expect(run({ ...good, updatedAt: '2026-10-19T03:00:00Z' }).issues).toEqual([]);
    expect(run({ ...good, updatedAt: '2026-10-19T02:59:59Z' }).issues[0]).toMatchObject({
      code: 'stale',
      action: 'drop',
    });
  });

  it('image_missing: warn, Produkt bleibt erhalten', () => {
    for (const imageLink of [undefined, '']) {
      const r = run({ ...good, imageLink });
      expect(r.issues).toHaveLength(1);
      expect(r.issues[0]).toMatchObject({ code: 'image_missing', action: 'warn' });
      expect(cleanFeed(r.products, r.issues)).toHaveLength(1);
    }
  });

  it('hat zu jedem Code eine Wirkung', () => {
    expect(Object.keys(EFFECTS)).toHaveLength(8);
    expect(EFFECTS.invalid_json).toBe('gar keine Empfehlungen');
  });
});

describe('inspectFeed: Robustheit', () => {
  it('wirft nie bei Müll-Einträgen', () => {
    const r = run(null, [], 5, 'text', { ...good, price: null }, { ...good, id: 5 });
    expect(r.issues[0]).toMatchObject({ index: 0, code: 'missing_field', action: 'drop' });
    expect(r.issues.filter((i) => i.index === 1 || i.index === 2 || i.index === 3)).toHaveLength(3);
    expect(r.issues.find((i) => i.index === 4)).toMatchObject({ field: 'price', code: 'missing_field' });
    expect(r.issues.find((i) => i.index === 5)).toMatchObject({ field: 'id', code: 'missing_field' });
    expect(cleanFeed(r.products, r.issues)).toEqual([]);
  });

  it('line: Startzeile je Eintrag, auch mit Klammern in Strings', () => {
    const text = [
      '{',
      '  "note": "[{ nicht zählen",',
      '  "other": [1, 2],',
      '  "products": [',
      '    { "id": "A", "title": "x}" },',
      '    {',
      '      "id": "B"',
      '    },',
      '    null',
      '  ]',
      '}',
    ].join('\n');
    const r = inspectFeed(text, FEED_DATE);
    expect(r.products.map((p) => p.line)).toEqual([5, 6, 9]);
    expect(r.products.map((p) => p.index)).toEqual([0, 1, 2]);
  });

  it('readFeedNaively wirft nie', () => {
    expect(readFeedNaively('{')).toEqual([]);
    expect(readFeedNaively('{"products": 1}')).toEqual([]);
  });
});

describe('RAW_FEED', () => {
  const { products, issues } = inspectFeed(RAW_FEED, FEED_DATE);
  const byEntry = (action: string) => new Set(issues.filter((i) => i.action === action).map((i) => i.index));

  it('hat feste Zahlen: 28 Einträge, 4 aussortiert, 3 repariert, 1 Hinweis, 20 fehlerfrei', () => {
    expect(products).toHaveLength(28);
    expect(byEntry('drop').size).toBe(4);
    expect(byEntry('repair').size).toBe(3);
    expect(byEntry('warn').size).toBe(1);
    expect(new Set(issues.map((i) => i.index)).size).toBe(8);
    expect(products.length - new Set(issues.map((i) => i.index)).size).toBe(20);
  });

  it('meldet die erwarteten Codes', () => {
    const codes = issues.map((i) => i.code).sort();
    expect(codes).toEqual(
      ['availability_value', 'category_variant', 'category_variant', 'duplicate_id', 'image_missing', 'missing_field', 'price_format', 'stale'].sort(),
    );
  });

  it('Zeilennummern zeigen auf den Eintrag im Text', () => {
    const lines = RAW_FEED.split('\n');
    for (const p of products) expect(lines[p.line - 1]!.trim()).toBe('{');
  });
});
