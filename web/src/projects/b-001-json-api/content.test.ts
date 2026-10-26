import { describe, expect, it } from 'vitest';
import { createFakeFetch } from '../../http/fakeFetch';
import { allText, checkStructure } from '../contentChecks';
import { meta } from './content';
import { PRODUCTS } from './products';
import { walkStations } from './stations';

const text = allText(meta);

describe('B-001 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 4, reflection: [2, 3], cards: [5, 8] })).toEqual([]);
  });

  it('drei Code-Aufgaben mit Vorlage, zwei Tipps und Musterlösung', () => {
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['B-001-code-01', 'B-001-code-02', 'B-001-code-03']);
    for (const t of meta.codeTasks ?? []) {
      expect(t.hints).toHaveLength(2);
      expect(t.starter).toContain('// dein Code');
      expect(t.starter.trimEnd()).toMatch(/return \{ \w+ \};$/);
      expect(t.solution.trimEnd()).toMatch(/return \{ \w+ \};$/);
    }
  });
});

describe('B-001 Inhalte: zitierte Zahlen', () => {
  // Jede Zahl im Text steht hier; jede wird unten nachgerechnet oder geprüft.
  it('der Text nennt nur geprüfte Zahlen', () => {
    const numbers = [...new Set(text.match(/\d+(?:[.,]\d+)?/g))].sort();
    expect(numbers).toEqual(['1', '100', '200', '204', '299', '4.5', '404', '500', '599'].sort());
  });

  it('Schätzfrage: 100 der Codes 100 bis 599 zählen als ok, genau 200 bis 299', () => {
    let count = 0;
    for (let s = 100; s <= 599; s++) if (s >= 200 && s <= 299) count++;
    expect(count).toBe(100);
    const q = meta.quiz.find((x) => x.id === 'B-001-quiz-01');
    expect(q?.type === 'estimate' && q.answer).toBe(count);
    // Gegenprobe mit echten Response-Objekten (sie erlauben nur 200 bis 599).
    let viaResponse = 0;
    for (let s = 200; s <= 599; s++) if (new Response(null, { status: s }).ok) viaResponse++;
    expect(viaResponse).toBe(100);
    expect(new Response(null, { status: 299 }).ok).toBe(true);
    expect(new Response(null, { status: 300 }).ok).toBe(false);
    expect(text).toContain('100 bis 599');
    expect(text).toContain('200 und 299');
  });

  it('404 und 500 sind nicht ok, 204 schon', () => {
    expect(new Response(null, { status: 404 }).ok).toBe(false);
    expect(new Response(null, { status: 500 }).ok).toBe(false);
    expect(new Response(null, { status: 204 }).ok).toBe(true);
  });

  it('fetch wirft bei 404 nicht, nur bei Netzwerkausfall', async () => {
    const { fetch } = createFakeFetch([]);
    const res = await fetch('/missing');
    expect(res.status).toBe(404);
    expect(res.ok).toBe(false);
    const offline = createFakeFetch([], { failNetwork: true });
    await expect(offline.fetch('/products')).rejects.toThrow(TypeError);
  });

  it('Body nur einmal lesbar: nach text() wirft json()', async () => {
    const res = new Response('[]');
    await res.text();
    expect(res.bodyUsed).toBe(true);
    await expect(res.json()).rejects.toThrow(TypeError);
  });

  it('204: json() wirft einen SyntaxError', async () => {
    await expect(new Response(null, { status: 204 }).json()).rejects.toThrow(SyntaxError);
    expect(() => JSON.parse('')).toThrow(SyntaxError);
  });

  it('fünf Stationen', async () => {
    const { stations } = await walkStations('ok');
    expect(stations).toHaveLength(5);
    expect(text).toContain('fünf Stationen');
  });

  it('Beispielprodukt in Aufgabe 2 steht so in PRODUCTS', () => {
    expect(PRODUCTS).toContainEqual({ id: 1, name: 'Notizbuch', price: 4.5, inStock: true });
    expect(text).toContain("{ id: 1, name: 'Notizbuch', price: 4.5, inStock: true }");
  });
});
