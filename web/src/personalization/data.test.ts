import { describe, expect, it } from 'vitest';
import { CATALOG, CATEGORIES } from './catalog';
import { EXAMPLE_VISITOR_ID, NOW, VISITORS } from './visitors';
import { FEED_DATE, RAW_FEED } from './rawFeed';
import { cleanFeed, inspectFeed, readFeedNaively } from './inspectFeed';

const DAY = 24 * 60 * 60 * 1000;

describe('CATALOG', () => {
  it('hat 24 Produkte, je Kategorie 6', () => {
    expect(CATALOG.length).toBe(24);
    for (const c of CATEGORIES) expect(CATALOG.filter((p) => p.category === c).length).toBe(6);
  });

  it('IDs sind eindeutig und laufen von P01 bis P24', () => {
    const ids = CATALOG.map((p) => p.id);
    expect(new Set(ids).size).toBe(24);
    expect(ids[0]).toBe('P01');
    expect(ids[23]).toBe('P24');
  });

  it('erfüllt die Datenvorgaben', () => {
    expect(CATALOG.filter((p) => p.availability === 'out_of_stock').length).toBeGreaterThanOrEqual(2);
    expect(CATALOG.filter((p) => !p.imageLink).length).toBe(1);
    const feed = Date.parse(FEED_DATE);
    for (const p of CATALOG) {
      expect(p.tags.length).toBeGreaterThanOrEqual(3);
      expect(p.tags.length).toBeLessThanOrEqual(5);
      expect(feed - Date.parse(p.updatedAt)).toBeLessThanOrEqual(7 * DAY);
      expect(Date.parse(p.updatedAt)).toBeLessThanOrEqual(feed);
    }
  });
});

describe('VISITORS', () => {
  it('hat 6 Besucher; jede productId existiert im Katalog', () => {
    expect(VISITORS.length).toBe(6);
    const ids = new Set(CATALOG.map((p) => p.id));
    for (const v of VISITORS) for (const e of v.events) expect(ids.has(e.productId)).toBe(true);
  });

  it('genau ein Besucher ohne Ereignisse, und der ist neu', () => {
    const empty = VISITORS.filter((v) => v.events.length === 0);
    expect(empty.length).toBe(1);
    expect(empty[0]!.traits.customer).toBe('new');
  });

  it('alle Ereignisse liegen vor NOW, höchstens 30 Tage', () => {
    const now = Date.parse(NOW);
    for (const v of VISITORS)
      for (const e of v.events) {
        expect(Date.parse(e.at)).toBeLessThan(now);
        expect(now - Date.parse(e.at)).toBeLessThanOrEqual(30 * DAY);
      }
  });

  it('mindestens ein Besucher hat einen Kauf', () => {
    expect(VISITORS.some((v) => v.events.some((e) => e.type === 'purchase'))).toBe(true);
  });

  it('Beispielbesucher: gemischter Verlauf mit Kauf, zuletzt angesehen ist lieferbar', () => {
    const v = VISITORS.find((x) => x.id === EXAMPLE_VISITOR_ID)!;
    expect(v).toBeDefined();
    const cats = new Set(v.events.map((e) => CATALOG.find((p) => p.id === e.productId)!.category));
    expect(cats.size).toBeGreaterThanOrEqual(2);
    expect(v.events.some((e) => e.type === 'purchase')).toBe(true);
    const lastView = [...v.events].filter((e) => e.type === 'view').sort((a, b) => b.at.localeCompare(a.at))[0]!;
    expect(CATALOG.find((p) => p.id === lastView.productId)!.availability).toBe('in_stock');
  });
});

describe('RAW_FEED', () => {
  const feed = JSON.parse(RAW_FEED) as { generatedAt: string; products: Record<string, unknown>[] };

  it('hat 28 Einträge und das Feed-Datum', () => {
    expect(feed.generatedAt).toBe(FEED_DATE);
    expect(feed.products.length).toBe(28);
  });

  it('enthält die vorgesehenen Defekte auf verschiedenen Einträgen', () => {
    const p = feed.products;
    expect(p.filter((x) => x.category === 'laufschuhe' || x.category === 'Jacken ').length).toBe(2);
    expect(p.filter((x) => x.availability === 'Out of Stock').length).toBe(1);
    expect(p.filter((x) => x.price === undefined).length).toBe(1);
    expect(p.filter((x) => x.price === '49,90 €').length).toBe(1);
    expect(p.filter((x) => !x.imageLink).length).toBe(1);
    const ids = p.map((x) => x.id);
    expect(ids.length - new Set(ids).size).toBe(1);
    const stale = p.filter((x) => Date.parse(FEED_DATE) - Date.parse(String(x.updatedAt)) > 7 * DAY);
    expect(stale.length).toBe(1);
  });

  it('bereinigt zum Katalog zurück', () => {
    const { products, issues } = inspectFeed(RAW_FEED, FEED_DATE);
    expect(cleanFeed(products, issues)).toEqual(CATALOG);
  });

  it('naives Lesen behält 26 Einträge (28 ohne Preis und ohne Preis als Zahl)', () => {
    expect(readFeedNaively(RAW_FEED).length).toBe(26);
  });
});
