import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { allText, checkStructure } from '../contentChecks';
import { projects } from '../index';
import Explanation from './Explanation';
import { meta } from './content';

describe('C-003.2 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 0, reflection: [1, 2], cards: [3, 5] })).toEqual([]);
  });

  it('hängt als Einheit an C-003 und steht nach C-003.1 in der Registrierung', () => {
    expect(meta.kind).toBe('unit');
    expect(meta.attachedTo).toBe('C-003');
    expect(meta.track).toBe('personalization');
    const ids = projects.map((p) => p.meta.id);
    expect(ids.indexOf('C-003.2')).toBe(ids.indexOf('C-003') + 2);
  });

  it('Texte nennen keine Zahlen, keine Werkzeugnamen, keine Backticks', () => {
    expect(allText(meta)).not.toMatch(/\d|Dynamic Yield|Optimizely|Adobe Target|`/);
  });
});

describe('C-003.2 Erklärung', () => {
  const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Explanation)));

  it('zeigt sechs Prüfpunkte, jeweils mit „Woran merke ich es?“ und „Was stattdessen?“', () => {
    expect((html.match(/data-check="item"/g) ?? []).length).toBe(6);
    expect((html.match(/Woran merke ich es\?/g) ?? []).length).toBe(6);
    expect((html.match(/Was stattdessen\?/g) ?? []).length).toBe(6);
    for (const topic of ['Kaltstart', 'Kleines Sortiment', 'Gleiche Bedürfnisse', 'Pflegeaufwand', 'Einwilligung', 'Filterblase']) {
      expect(html).toContain(topic);
    }
  });

  it('hat eine beschriftete Zeichnung der Waage und verweist auf C-003', () => {
    expect(html).toMatch(/<svg[^>]*role="img"[^>]*aria-label="[^"]+"/);
    expect(html).toContain('href="/projekt/C-003"');
  });
});
