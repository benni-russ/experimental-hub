import { describe, expect, it } from 'vitest';
import { cleanFeed, inspectFeed, readFeedNaively } from './inspectFeed';
import { FEED_DATE, RAW_FEED } from './rawFeed';
import { PRESETS, rankProducts } from './recommend';
import { EXAMPLE_VISITOR_ID, NOW, VISITORS } from './visitors';
import { flawWords, naiveEntries, naiveFlaws } from './feedFlaws';

const { products, issues } = inspectFeed(RAW_FEED, FEED_DATE);
const naive = readFeedNaively(RAW_FEED);
const clean = cleanFeed(products, issues);
const flaws = naiveFlaws(naive, products, issues);
const OPTIONS = { hideOutOfStock: true, hidePurchased: true, n: 5 };

describe('Zuordnung der naiven Liste zu den Feedeinträgen', () => {
  it('jedes naive Produkt hat einen Eintrag mit gleicher id', () => {
    const entries = naiveEntries(products);
    expect(entries).toHaveLength(naive.length);
    entries.forEach((e, i) => expect((e.data as { id: string }).id).toBe(naive[i]!.id));
  });

  it('die vier Wörter: ausverkauft, doppelt, veraltet, Kategorie falsch geschrieben', () => {
    const wordsOf = (id: string, nth = 0) => flaws.get(naive.filter((p) => p.id === id)[nth]!);
    expect(wordsOf('P10')).toEqual(['ausverkauft']);
    expect(wordsOf('P05', 1)).toEqual(['doppelt']);
    expect(wordsOf('P05', 0)).toEqual([]);
    expect(wordsOf('P27')).toEqual(['veraltet']);
    expect(wordsOf('P02')).toEqual(['Kategorie falsch geschrieben']);
    expect(wordsOf('P08')).toEqual(['Kategorie falsch geschrieben']);
  });

  it('ein Hinweis (kein Bild) und fehlerfreie Einträge bekommen kein Wort', () => {
    expect(flaws.get(naive.find((p) => p.id === 'P21')!)).toEqual([]);
    expect(flawWords([])).toEqual([]);
    expect(flawWords([{ index: 0, field: 'imageLink', code: 'image_missing', message: '', action: 'warn' }])).toEqual([]);
  });

  it('die Wörter ergeben sich nur aus repair- und drop-Issues', () => {
    expect(flawWords([{ index: 0, field: 'id', code: 'duplicate_id', message: '', action: 'drop' }])).toEqual(['doppelt']);
  });
});

describe('Wirkung auf die Empfehlung', () => {
  const top = (list: typeof naive, visitorId: string) =>
    rankProducts(list, VISITORS.find((v) => v.id === visitorId)!, PRESETS.personal.weights, OPTIONS, NOW).map((r) => r.product);

  it('für mindestens einen Besucher steht links eine markierte Empfehlung, rechts nie', () => {
    const marked = VISITORS.filter((v) => top(naive, v.id).some((p) => (flaws.get(p) ?? []).length > 0)).map((v) => v.name);
    expect(marked).toEqual(expect.arrayContaining(['Anna', 'Clara', 'David', 'Finn']));
    // Die Startauswahl der Demo (Beispielbesucher Anna) zeigt sofort zwei Markierungen.
    const anna = top(naive, EXAMPLE_VISITOR_ID).flatMap((p) => flaws.get(p) ?? []);
    expect(anna.sort()).toEqual(['doppelt', 'veraltet']);
    const words = new Set(VISITORS.flatMap((v) => top(naive, v.id).flatMap((p) => flaws.get(p) ?? [])));
    for (const w of ['ausverkauft', 'doppelt', 'veraltet']) expect(words.has(w), w).toBe(true);
    for (const v of VISITORS) {
      const ids = top(clean, v.id).map((p) => p.id);
      expect(ids).not.toContain('P27');
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
