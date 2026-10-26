import { describe, expect, it } from 'vitest';
import { CATALOG } from './catalog';
import { EXAMPLE_VISITOR_ID, NOW, VISITORS, type VisitorEvent } from './visitors';
import { EVENT_WEIGHTS, HALF_LIFE_DAYS, categoryAffinity } from './affinity';

const ev = (type: VisitorEvent['type'], productId: string, at: string): VisitorEvent => ({ type, productId, at });

describe('Konstanten', () => {
  it('Ereignisgewichte und Halbwertszeit', () => {
    expect(EVENT_WEIGHTS).toEqual({ view: 1, cart: 3, purchase: 5 });
    expect(HALF_LIFE_DAYS).toBe(7);
  });
});

describe('categoryAffinity', () => {
  it('ein Ereignis ergibt ein Profil mit einer Kategorie', () => {
    const { profile, contributions } = categoryAffinity([ev('view', 'P01', NOW)], NOW, CATALOG);
    expect(profile).toEqual({ Laufschuhe: 1 });
    expect(contributions).toHaveLength(1);
    expect(contributions[0]!).toMatchObject({ category: 'Laufschuhe', ageDays: 0, weight: 1, decay: 1, value: 1 });
  });

  it('ein Aufruf vor 7 Tagen zählt halb so viel wie heute', () => {
    const { contributions } = categoryAffinity(
      [ev('view', 'P01', NOW), ev('view', 'P07', '2026-10-19T12:00:00Z')],
      NOW,
      CATALOG,
    );
    const [today, weekAgo] = contributions;
    expect(weekAgo!.ageDays).toBeCloseTo(7, 9);
    expect(weekAgo!.value).toBeCloseTo(today!.value / 2, 9);
  });

  it('ein Kauf zählt fünfmal so viel wie ein Aufruf', () => {
    const { profile } = categoryAffinity([ev('purchase', 'P01', NOW), ev('view', 'P07', NOW)], NOW, CATALOG);
    expect(profile.Laufschuhe! / profile.Jacken!).toBeCloseTo(5, 9);
  });

  it('leerer Verlauf ergibt ein leeres Profil', () => {
    expect(categoryAffinity([], NOW, CATALOG)).toEqual({ profile: {}, contributions: [] });
  });

  it('Ereignisse auf unbekannte Produkte werden übersprungen', () => {
    const { profile, contributions } = categoryAffinity([ev('view', 'P99', NOW), ev('view', 'P01', NOW)], NOW, CATALOG);
    expect(contributions).toHaveLength(1);
    expect(profile).toEqual({ Laufschuhe: 1 });
  });

  it('das Profil summiert sich bei jedem Besucher mit Verlauf auf 1', () => {
    for (const v of VISITORS.filter((x) => x.events.length > 0)) {
      const { profile } = categoryAffinity(v.events, NOW, CATALOG);
      const sum = Object.values(profile).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 9);
    }
  });

  it('Wert für den Beispielbesucher (C-003.1)', () => {
    const visitor = VISITORS.find((v) => v.id === EXAMPLE_VISITOR_ID)!;
    const { profile, contributions } = categoryAffinity(visitor.events, NOW, CATALOG);
    expect(contributions).toHaveLength(5);
    expect(profile.Jacken).toBeCloseTo(0.3636, 3);
    expect(profile['Zubehör']).toBeCloseTo(0.3345, 3);
    expect(profile.Laufschuhe).toBeCloseTo(0.3019, 3);
  });
});
