import { describe, expect, it } from 'vitest';
import { CATALOG } from './catalog';
import { EXAMPLE_VISITOR_ID, NOW, VISITORS, type Visitor } from './visitors';
import { PRESETS, jaccard, rankChanges, rankProducts, scoreProduct } from './recommend';

const example = VISITORS.find((v) => v.id === EXAMPLE_VISITOR_ID)!;
const finn = VISITORS.find((v) => v.id === 'V6')!;
const open = { hideOutOfStock: false, hidePurchased: false, n: 24 };

describe('PRESETS', () => {
  it('Vorgaben laut Festlegung', () => {
    expect(PRESETS.popular.weights).toEqual({ affinity: 0, popularity: 1, similarity: 0 });
    expect(PRESETS.personal.weights).toEqual({ affinity: 0.6, popularity: 0.2, similarity: 0.2 });
    expect(PRESETS.similar.weights).toEqual({ affinity: 0.1, popularity: 0.1, similarity: 0.8 });
    const b = PRESETS.balanced.weights;
    expect(b.affinity).toBeCloseTo(1 / 3, 9);
    expect(b.popularity).toBeCloseTo(1 / 3, 9);
    expect(b.similarity).toBeCloseTo(1 / 3, 9);
  });
});

describe('jaccard und scoreProduct', () => {
  it('leere Mengen ergeben 0', () => {
    expect(jaccard([], [])).toBe(0);
  });
  it('Überschneidung durch Vereinigung', () => {
    expect(jaccard(['a', 'b'], ['b', 'c'])).toBeCloseTo(1 / 3, 9);
    expect(jaccard(['a'], ['a'])).toBe(1);
  });
  it('Nullgewichte ergeben 0', () => {
    expect(scoreProduct({ affinity: 1, popularity: 1, similarity: 1 }, { affinity: 0, popularity: 0, similarity: 0 })).toBe(0);
  });
  it('gewichtete Summe', () => {
    expect(
      scoreProduct({ affinity: 0.5, popularity: 1, similarity: 0 }, { affinity: 0.6, popularity: 0.2, similarity: 0.2 }),
    ).toBeCloseTo(0.5, 9);
  });
});

describe('rankProducts', () => {
  it('parts summieren sich zu score', () => {
    for (const item of rankProducts(CATALOG, example, PRESETS.personal.weights, open, NOW)) {
      expect(item.parts.affinity + item.parts.popularity + item.parts.similarity).toBeCloseTo(item.score, 9);
    }
  });

  it('Filter Nicht lieferbar', () => {
    const ids = rankProducts(CATALOG, example, PRESETS.balanced.weights, { ...open, hideOutOfStock: true }, NOW).map(
      (r) => r.product.id,
    );
    expect(ids).not.toContain('P03');
    expect(ids).not.toContain('P10');
    expect(ids).not.toContain('P17');
    expect(ids).toHaveLength(21);
  });

  it('Filter Bereits gekauft', () => {
    const ids = rankProducts(CATALOG, example, PRESETS.balanced.weights, { ...open, hidePurchased: true }, NOW).map(
      (r) => r.product.id,
    );
    expect(ids).not.toContain('P11');
    expect(ids).toHaveLength(23);
  });

  it('Gleichstand nach id, alle Gewichte 0 ergeben die Reihenfolge nach id', () => {
    const zero = { affinity: 0, popularity: 0, similarity: 0 };
    const ids = rankProducts([...CATALOG].reverse(), example, zero, open, NOW).map((r) => r.product.id);
    expect(ids).toEqual(CATALOG.map((p) => p.id));
  });

  it('n begrenzt die Liste, ein größeres n liefert alles', () => {
    expect(rankProducts(CATALOG, example, PRESETS.popular.weights, { ...open, n: 100 }, NOW)).toHaveLength(24);
    expect(rankProducts(CATALOG, example, PRESETS.popular.weights, { ...open, n: 8 }, NOW)).toHaveLength(8);
  });

  it('Besucher ohne Verlauf: Affinität und Ähnlichkeit 0, kein NaN', () => {
    const ranked = rankProducts(CATALOG, finn, PRESETS.balanced.weights, open, NOW);
    for (const r of ranked) {
      expect(r.parts.affinity).toBe(0);
      expect(r.parts.similarity).toBe(0);
      expect(Number.isNaN(r.score)).toBe(false);
    }
  });

  it('Beliebtheit relativ zum Spitzenreiter, bei Umsatz 0 überall 0', () => {
    const top = rankProducts(CATALOG, finn, PRESETS.popular.weights, open, NOW)[0]!;
    expect(top.product.id).toBe('P20');
    expect(top.parts.popularity).toBeCloseTo(1, 9);
    const none = CATALOG.map((p) => ({ ...p, sales30d: 0 }));
    for (const r of rankProducts(none, finn, PRESETS.popular.weights, open, NOW)) expect(r.score).toBe(0);
  });

  it('unter Beliebt bekommen alle Besucher ohne Kauf dieselbe Liste', () => {
    const opts = { hideOutOfStock: false, hidePurchased: true, n: 8 };
    const lists = VISITORS.filter((v) => !v.events.some((e) => e.type === 'purchase')).map((v) =>
      rankProducts(CATALOG, v, PRESETS.popular.weights, opts, NOW).map((r) => r.product.id),
    );
    expect(lists.length).toBeGreaterThan(1);
    for (const l of lists) expect(l).toEqual(lists[0]);
  });

  it('unter Ähnlich kommen die Plätze 1-4 aus der Kategorie des zuletzt angesehenen Produkts', () => {
    const lastView = example.events.filter((e) => e.type === 'view').sort((a, b) => b.at.localeCompare(a.at))[0]!;
    const category = CATALOG.find((p) => p.id === lastView.productId)!.category;
    const ranked = rankProducts(
      CATALOG,
      example,
      PRESETS.similar.weights,
      { hideOutOfStock: false, hidePurchased: true, n: 8 },
      NOW,
    );
    expect(ranked.slice(0, 4).map((r) => r.product.category)).toEqual([category, category, category, category]);
  });

  it('fehlt das zuletzt angesehene Produkt in der Liste, ist die Ähnlichkeit 0', () => {
    const without = CATALOG.filter((p) => p.id !== 'P01');
    for (const r of rankProducts(without, example, PRESETS.similar.weights, open, NOW)) expect(r.parts.similarity).toBe(0);
  });

  it('nur Aufrufe zählen für die Ähnlichkeit', () => {
    const cartOnly: Visitor = { ...finn, events: [{ type: 'cart', productId: 'P01', at: NOW }] };
    for (const r of rankProducts(CATALOG, cartOnly, PRESETS.similar.weights, open, NOW)) expect(r.parts.similarity).toBe(0);
  });
});

describe('rankChanges', () => {
  it('Plätze hoch, runter und neu', () => {
    expect(rankChanges(['a', 'b'], ['b', 'a', 'c'])).toEqual({ b: 1, a: -1, c: 'new' });
  });
});
