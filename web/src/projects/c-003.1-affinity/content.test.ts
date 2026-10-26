import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { EVENT_WEIGHTS, HALF_LIFE_DAYS, categoryAffinity } from '../../personalization/affinity';
import { CATALOG } from '../../personalization/catalog';
import { EXAMPLE_VISITOR_ID, NOW, VISITORS } from '../../personalization/visitors';
import { allText, checkStructure } from '../contentChecks';
import { projects } from '../index';
import Explanation from './Explanation';
import { meta } from './content';

const anna = VISITORS.find((v) => v.id === EXAMPLE_VISITOR_ID)!;
const { profile, contributions } = categoryAffinity(anna.events, NOW, CATALOG);
const de = (n: number, digits: number) => n.toLocaleString('de-DE', { minimumFractionDigits: digits, maximumFractionDigits: digits });

describe('C-003.1 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 0, reflection: [1, 2], cards: [3, 5] })).toEqual([]);
  });

  it('hängt als Einheit an C-003 und steht direkt nach C-003 in der Registrierung', () => {
    expect(meta.kind).toBe('unit');
    expect(meta.attachedTo).toBe('C-003');
    expect(meta.track).toBe('personalization');
    const ids = projects.map((p) => p.meta.id);
    expect(ids.indexOf('C-003')).toBeGreaterThanOrEqual(0);
    expect(ids.indexOf('C-003.1')).toBe(ids.indexOf('C-003') + 1);
  });

  it('jede Zahl im Text stammt aus den Konstanten', () => {
    const allowed = new Set<number>([HALF_LIFE_DAYS, ...Object.values(EVENT_WEIGHTS)]);
    const numbers = (allText(meta).match(/\d+/g) ?? []).map(Number);
    expect(numbers.length).toBeGreaterThan(0);
    for (const n of numbers) expect(allowed.has(n)).toBe(true);
    expect(allText(meta)).toContain(`${HALF_LIFE_DAYS} Tage`);
  });

  it('Texte nutzen keine Werkzeugnamen und keine Backticks', () => {
    expect(allText(meta)).not.toMatch(/Dynamic Yield|Optimizely|Adobe Target|`/);
  });
});

describe('C-003.1 Erklärung', () => {
  const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Explanation)));

  it('der Beispielbesucher hat fünf Beiträge und das gepinnte Profil', () => {
    expect(contributions).toHaveLength(5);
    expect(profile['Jacken']).toBeCloseTo(0.3636, 4);
    expect(profile['Zubehör']).toBeCloseTo(0.3345, 4);
    expect(profile['Laufschuhe']).toBeCloseTo(0.3019, 4);
  });

  it('zeigt Tabelle mit Beschriftung, eine Zeile je Beitrag und alle Werte deutsch formatiert', () => {
    expect(html).toContain('<caption>');
    expect(html).toContain('table-scroll');
    expect((html.match(/data-row="contribution"/g) ?? []).length).toBe(contributions.length);
    for (const c of contributions) {
      expect(html).toContain(de(c.ageDays, 1));
      expect(html).toContain(de(c.decay, 2));
      expect(html).toContain(de(c.value, 2));
      expect(html).toContain(CATALOG.find((p) => p.id === c.event.productId)!.title);
    }
  });

  it('das Gewicht steht in der Zeile des jeweiligen Ereignisses (Spalte Gewicht)', () => {
    const sorted = [...contributions].sort((a, b) => Date.parse(a.event.at) - Date.parse(b.event.at));
    const rowHtml = [...html.matchAll(/<tr data-row="contribution">(.*?)<\/tr>/g)].map((m) => m[1]!);
    expect(rowHtml).toHaveLength(sorted.length);
    sorted.forEach((c, i) => {
      const numbers = [...rowHtml[i]!.matchAll(/<td class="aff-num">(.*?)<\/td>/g)].map((m) => m[1]);
      expect(numbers[1], `Gewicht in Zeile ${i + 1}`).toBe(String(EVENT_WEIGHTS[c.event.type]));
    });
  });

  it('das Profil ergibt zusammen 100 Prozent, und nach drei Halbwertszeiten zählt ein Kauf 0,625', () => {
    expect(Object.values(profile).reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
    expect(html).toContain('ergibt');
    expect(html).toContain('100 %');
    // Kauf (5) nach 3 × 7 Tagen: 5 · 0,5³ = 0,625, ohne Runden auf 0,63 dargestellt.
    expect(EVENT_WEIGHTS.purchase * 0.5 ** 3).toBe(0.625);
    expect(html).toContain('Tag 21');
    expect(html).toContain('Tag 21: 0,625');
  });

  it('zeigt das normierte Profil je Kategorie als Prozent', () => {
    for (const [category, share] of Object.entries(profile)) {
      expect(html).toContain(category);
      expect(html).toContain(`${de(share * 100, 1)}\u00a0%`);
    }
  });

  it('hat eine beschriftete Zeichnung und den Absatz zu dem, was ein Profil nicht weiß', () => {
    expect(html).toMatch(/<svg[^>]*role="img"[^>]*aria-label="[^"]+"/);
    expect(html).toContain('Was ein Profil nicht weiß');
    expect(html).toContain('Geschenk');
    expect(html).toContain('href="/projekt/C-003"');
  });
});
