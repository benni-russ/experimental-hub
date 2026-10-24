import { describe, expect, it } from 'vitest';
import { alignFirst, isOnPage, pageLabel } from './cardPages';

describe('alignFirst', () => {
  it('rundet auf den Anfang der Seite ab', () => {
    expect(alignFirst(3, 10, 2)).toBe(2);
    expect(alignFirst(4, 10, 2)).toBe(4);
    expect(alignFirst(3, 10, 1)).toBe(3);
  });

  it('behält beim Wechsel von einer auf zwei Spalten die zuerst sichtbare Karte im Bild', () => {
    expect(alignFirst(5, 10, 2)).toBe(4);
  });

  it('bleibt in den Grenzen der Liste', () => {
    expect(alignFirst(12, 10, 2)).toBe(8);
    expect(alignFirst(10, 11, 2)).toBe(10);
    expect(alignFirst(-1, 10, 2)).toBe(0);
    expect(alignFirst(3, 0, 2)).toBe(0);
  });
});

describe('isOnPage', () => {
  it('zeigt die Karten ab first bis first + perPage - 1', () => {
    expect([0, 1, 2, 3, 4].map((i) => isOnPage(i, 2, 2))).toEqual([false, false, true, true, false]);
  });
});

describe('pageLabel', () => {
  it('nennt den Bereich mit Halbgeviertstrich', () => {
    expect(pageLabel(2, 2, 12)).toBe('3–4 von 12');
  });

  it('nennt eine einzelne Karte ohne Bereich', () => {
    expect(pageLabel(2, 1, 12)).toBe('3 von 12');
    expect(pageLabel(10, 2, 11)).toBe('11 von 11');
  });
});
