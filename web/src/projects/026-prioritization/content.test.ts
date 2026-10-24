import { describe, expect, it } from 'vitest';
import { formatNumber } from '../../learning/numbers';
import { allText, checkStructure } from '../contentChecks';
import { projects } from '../index';
import { meta } from './content';
import { IDEAS, pieScore, rankIdeas } from './Explanation';
import { tiedFlags } from './ties';

describe('026 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 0, reflection: [1, 2], cards: [3, 5] })).toEqual([]);
  });

  it('hängt als Einheit an 001 und steht direkt nach 001 in der Registrierung', () => {
    expect(meta.kind).toBe('unit');
    expect(meta.attachedTo).toBe('001');
    const ids = projects.map((p) => p.meta.id);
    expect(ids.indexOf('026')).toBe(ids.indexOf('001') + 1);
    expect(ids.indexOf('001')).toBeGreaterThanOrEqual(0);
  });

  it('Karten und Fragen nennen keine ungeprüften Zahlen', () => {
    // Die Mittelwerte stehen nur in der Tabelle, die sie aus IDEAS berechnet.
    expect(allText(meta).replaceAll('1 bis 10', '')).not.toMatch(/\d/);
  });
});

describe('026 Tabelle: Testideen', () => {
  it('es sind drei Ideen mit Werten von 1 bis 10', () => {
    expect(IDEAS).toHaveLength(3);
    for (const idea of IDEAS) {
      for (const v of [idea.p, idea.i, idea.e]) {
        expect(Number.isInteger(v)).toBe(true);
        expect(v).toBeGreaterThanOrEqual(1);
        expect(v).toBeLessThanOrEqual(10);
      }
    }
  });

  it('der PIE-Wert ist der Mittelwert der drei Punkte', () => {
    expect(IDEAS.map((x) => formatNumber(pieScore(x), 2))).toEqual(['7,67', '6,67', '6,67']);
  });

  it('keine einzelne Spalte ergibt die Rangfolge', () => {
    const first = rankIdeas(IDEAS)[0]!;
    expect(first.p).toBeLessThan(Math.max(...IDEAS.map((x) => x.p)));
    expect(first.e).toBeLessThan(Math.max(...IDEAS.map((x) => x.e)));
  });

  it('Gleichstand: mehr Potential zuerst, wie im Text der Erklärung', () => {
    const ranked = rankIdeas(IDEAS);
    expect(ranked.map((x) => x.name)).toEqual([
      'Größere Produktfotos auf der Produktseite',
      'Express-Kauf mit einem Klick',
      'Neue Farbe für den Kaufen-Knopf',
    ]);
    expect(pieScore(ranked[1]!)).toBeCloseTo(pieScore(ranked[2]!), 9);
    expect(ranked[1]!.p).toBeGreaterThan(ranked[2]!.p);
  });
});

describe('026 Gleichstand', () => {
  it('markiert genau die Ideen mit gleichem Wert', () => {
    expect(tiedFlags([8, 7, 7])).toEqual([false, true, true]);
    expect(tiedFlags([7, 7, 7])).toEqual([true, true, true]);
    expect(tiedFlags([5, 6, 7])).toEqual([false, false, false]);
    expect(tiedFlags([])).toEqual([]);
  });

  it('in der Beispieltabelle stehen Express-Kauf und Farbwechsel gleichauf', () => {
    const ranked = rankIdeas(IDEAS);
    const flags = tiedFlags(ranked.map(pieScore));
    expect(ranked.map((idea, i) => (flags[i] ? idea.name : null)).filter(Boolean)).toEqual([
      'Express-Kauf mit einem Klick',
      'Neue Farbe für den Kaufen-Knopf',
    ]);
  });
});
