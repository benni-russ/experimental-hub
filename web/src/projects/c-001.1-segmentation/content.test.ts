import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { allText, checkStructure } from '../contentChecks';
import { projects } from '../index';
import Explanation from './Explanation';
import { meta } from './content';

describe('C-001.1 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 0, reflection: [1, 2], cards: [3, 5] })).toEqual([]);
  });

  it('hängt als Einheit an C-001 und steht direkt nach C-001 in der Registrierung', () => {
    expect(meta.kind).toBe('unit');
    expect(meta.attachedTo).toBe('C-001');
    expect(meta.track).toBe('personalization');
    const ids = projects.map((p) => p.meta.id);
    expect(ids.indexOf('C-001')).toBeGreaterThanOrEqual(0);
    expect(ids.indexOf('C-001.1')).toBe(ids.indexOf('C-001') + 1);
  });

  it('Texte nennen keine Zahlen', () => {
    expect(allText(meta)).not.toMatch(/\d/);
  });

  it('Texte nutzen keine Werkzeugnamen', () => {
    expect(allText(meta)).not.toMatch(/Dynamic Yield|Optimizely|Adobe Target/);
  });
});

describe('C-001.1 Erklärung', () => {
  const html = renderToStaticMarkup(createElement(Explanation));

  it('zeigt die Tabelle mit Beschriftung und den sechs Zeilen', () => {
    expect(html).toContain('<caption>');
    for (const row of ['Grundlage', 'Wer entscheidet', 'Datenbedarf', 'Pflege', 'Erklärbarkeit', 'Testbarkeit']) {
      expect(html).toContain(`<th scope="row">${row}</th>`);
    }
    expect(html).toContain('table-scroll');
  });

  it('hat eine beschriftete Zeichnung', () => {
    expect(html).toMatch(/<svg[^>]*role="img"[^>]*aria-label="[^"]+"/);
  });

  it('verweist auf das spätere Projekt ohne Link', () => {
    expect(html).toContain('Recommendation Demo');
    expect(html).not.toMatch(/href="[^"]*C-003/);
  });
});
