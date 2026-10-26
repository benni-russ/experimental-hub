import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';
import { allText, checkStructure } from '../contentChecks';
import { projects } from '../index';
import Explanation, { PATTERN, WEAKNESSES } from './Explanation';
import { meta } from './content';

const html = renderToStaticMarkup(createElement(MemoryRouter, null, createElement(Explanation)));

describe('D-003.1 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 0, reflection: [1, 2], cards: [3, 5] })).toEqual([]);
  });

  it('hängt als Einheit an D-003 und steht direkt nach D-003 in der Registrierung', () => {
    expect(meta.kind).toBe('unit');
    expect(meta.attachedTo).toBe('D-003');
    expect(meta.track).toBe('experience');
    expect(meta.quiz).toEqual([]);
    const ids = projects.map((p) => p.meta.id);
    expect(ids.indexOf('D-003')).toBeGreaterThanOrEqual(0);
    expect(ids.indexOf('D-003.1')).toBe(ids.indexOf('D-003') + 1);
  });

  it('Texte nennen keine Zahlen und keine Backticks', () => {
    expect(allText(meta)).not.toMatch(/\d|`/);
  });

  it('kein Buchtitel, weder in den Texten noch in der Erklärung', () => {
    expect(allText(meta)).not.toMatch(/Neuro/i);
    expect(html).not.toMatch(/Neuro/i);
  });
});

describe('D-003.1 Erklärung', () => {
  it('zeigt die Beispielbeobachtung vom Versandkosten-Hinweis an der Kasse', () => {
    expect(html).toContain('Viele zögern auf der Kassenseite am Versandkosten-Hinweis');
    expect(html).toMatch(/Usability-Test/);
    expect(html).toMatch(/Sitzungsaufnahme/);
  });

  it('der Satzbaustein ergibt den Mustersatz aus der Spec', () => {
    const sentence = PATTERN.map((p, i) => `${i > 0 && !p.text.startsWith(',') ? ' ' : ''}${p.text}${p.slot ? ' …' : ''}`).join('');
    expect(sentence).toBe(
      'Weil wir beobachtet haben, dass …, nehmen wir an, dass … bei … zu … führt. Wir messen das an … und achten darauf, dass … nicht schlechter wird.',
    );
    expect(meta.cards.some((c) => c.back.includes(sentence))).toBe(true);
    expect((html.match(/class="uh-slot"/g) ?? []).length).toBe(6);
    for (const slot of ['Primärkennzahl', 'Schutzkennzahl', 'Zielgruppe']) expect(html).toContain(slot);
  });

  it('Tabelle schwach gegen stark: fünf Zeilen in .table-scroll mit Beschriftung', () => {
    expect(WEAKNESSES.map((w) => w.weakness)).toEqual([
      'Vage Beobachtung',
      'Keine Zielgruppe',
      'Keine Kennzahl',
      'Keine Schutzkennzahl',
      'Nicht widerlegbar',
    ]);
    expect((html.match(/data-row="weakness"/g) ?? []).length).toBe(5);
    expect(html).toMatch(/<div class="uh-wrap table-scroll" tabindex="0" role="region" aria-label="[^"]+">/);
    expect(html).toMatch(/<caption>[^<]+<\/caption>/);
    for (const w of WEAKNESSES) {
      expect(w.weak).not.toBe(w.strong);
      expect(w.strong.length).toBeGreaterThan(w.weak.length);
    }
  });

  it('verweist auf D-003, A-001.1 und A-001', () => {
    for (const id of ['D-003', 'A-001.1', 'A-001']) expect(html).toContain(`href="/projekt/${id}"`);
  });

  it('hat eine beschriftete Zeichnung des Wegs Beobachtung, Vermutung, Hypothese, Test', () => {
    expect(html).toMatch(/<svg[^>]*role="img"[^>]*aria-label="[^"]+"/);
    const order = ['Beobachtung', 'Vermutung', 'Hypothese', 'Test'].map((w) => html.indexOf(`>${w}</text>`));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });
});
