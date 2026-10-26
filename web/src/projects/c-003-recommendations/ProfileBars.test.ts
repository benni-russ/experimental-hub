import { describe, expect, it } from 'vitest';
import { categoryAffinity } from '../../personalization/affinity';
import { CATALOG } from '../../personalization/catalog';
import { readFeedNaively } from '../../personalization/inspectFeed';
import { RAW_FEED } from '../../personalization/rawFeed';
import { EXAMPLE_VISITOR_ID, NOW, VISITORS } from '../../personalization/visitors';
import { profileRows } from './ProfileBars';

const anna = VISITORS.find((v) => v.id === EXAMPLE_VISITOR_ID)!;

describe('C-003 Profilzeilen', () => {
  it('bereinigter Feed: nur bekannte Kategorien, kein Hinweis auf falsche Schreibweise', () => {
    const rows = profileRows(categoryAffinity(anna.events, NOW, CATALOG).profile);
    expect(rows.map((r) => r.name).sort()).toEqual(['Jacken', 'Laufschuhe', 'Rucksäcke', 'Zubehör']);
    expect(rows.some((r) => r.unknown)).toBe(false);
  });

  it('roher Feed: die falsch geschriebene Kategorie bekommt eine eigene Zeile und ist markiert', () => {
    const rows = profileRows(categoryAffinity(anna.events, NOW, readFeedNaively(RAW_FEED)).profile);
    const wrong = rows.filter((r) => r.unknown);
    expect(wrong.map((r) => r.name)).toEqual(['laufschuhe']);
    expect(wrong[0]!.value).toBeGreaterThan(0);
    // Das Profil zerfällt: die richtig geschriebene Kategorie verliert den Anteil des Aufrufs von P02.
    const clean = profileRows(categoryAffinity(anna.events, NOW, CATALOG).profile);
    const laufschuhe = (list: typeof rows) => list.find((r) => r.name === 'Laufschuhe')!.value;
    expect(laufschuhe(rows)).toBeLessThan(laufschuhe(clean));
    expect(rows.reduce((sum, r) => sum + r.value, 0)).toBeCloseTo(1, 9);
  });

  it('absteigend nach Anteil sortiert', () => {
    const rows = profileRows(categoryAffinity(anna.events, NOW, readFeedNaively(RAW_FEED)).profile);
    for (let i = 1; i < rows.length; i += 1) expect(rows[i - 1]!.value).toBeGreaterThanOrEqual(rows[i]!.value);
  });
});
