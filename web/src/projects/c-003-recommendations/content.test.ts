import { describe, expect, it } from 'vitest';
import { EVENT_WEIGHTS, HALF_LIFE_DAYS, categoryAffinity } from '../../personalization/affinity';
import { CATALOG } from '../../personalization/catalog';
import { PRESETS, rankProducts, scoreProduct } from '../../personalization/recommend';
import { EXAMPLE_VISITOR_ID, NOW, VISITORS } from '../../personalization/visitors';
import { allText, checkStructure } from '../contentChecks';
import { EXAMPLE, meta } from './content';

const text = allText(meta);
const choice = (id: string) => {
  const q = meta.quiz.find((x) => x.id === id);
  if (q?.type !== 'choice') throw new Error(`${id} ist keine Auswahlfrage`);
  return q;
};
const anna = VISITORS.find((v) => v.id === EXAMPLE_VISITOR_ID)!;
const newcomer = VISITORS.find((v) => v.events.length === 0)!;
const round2 = (n: number) => Math.round(n * 100) / 100;
const options = { hideOutOfStock: true, hidePurchased: true, n: 8 };

describe('C-003 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 4, reflection: [2, 3], cards: [6, 8] })).toEqual([]);
  });

  it('gehört zu Personalization, baut auf C-002 auf, führt nirgends hin, die Schätzfrage ist die erste', () => {
    expect(meta.id).toBe('C-003');
    expect(meta.track).toBe('personalization');
    expect(meta.kind).toBe('project');
    expect(meta.buildsOn).toEqual(['C-002']);
    expect(meta.leadsTo).toEqual([]);
    expect(meta.quiz.map((q) => q.id)).toEqual(['C-003-quiz-01', 'C-003-quiz-02', 'C-003-quiz-03', 'C-003-quiz-04']);
    expect(meta.intro.estimateQuestionId).toBe('C-003-quiz-01');
  });

  it('drei Code-Aufgaben mit Vorlage, zwei Tipps und Musterlösung', () => {
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['C-003-code-01', 'C-003-code-02', 'C-003-code-03']);
    const names = ['scoreProduct', 'rankProducts', 'categoryAffinity'];
    meta.codeTasks?.forEach((task, i) => {
      expect(task.hints).toHaveLength(2);
      expect(task.starter).toContain('// dein Code');
      expect(task.starter.trimEnd()).toMatch(new RegExp(`return \\{ ${names[i]} \\};$`));
      expect(task.solution.trimEnd()).toMatch(new RegExp(`return \\{ ${names[i]} \\};$`));
      expect(task.prompt).toContain(`\`${names[i]}(`);
    });
  });
});

describe('C-003 Inhalte: Antwortpositionen', () => {
  it('die richtige Option steht nicht immer an derselben Stelle', () => {
    const idx = ['C-003-quiz-02', 'C-003-quiz-03', 'C-003-quiz-04'].map((id) => choice(id).correctIndex);
    expect(idx).toEqual([1, 3, 0]);
    expect(new Set(idx).size).toBeGreaterThan(1);
  });
});

describe('C-003 Inhalte: zitierte Zahlen', () => {
  it('Schätzfrage: ein Aufruf von vor 14 Tagen zählt noch 25 Prozent', () => {
    const q = meta.quiz[0];
    expect(HALF_LIFE_DAYS).toBe(7);
    expect(100 * 0.5 ** (14 / HALF_LIFE_DAYS)).toBe(25);
    expect(q?.type === 'estimate' && q.answer).toBe(25);
    expect(q?.type === 'estimate' && q.tolerance).toBe(0.25);
    expect(q?.type === 'estimate' && q.unit).toBe('%');
    expect(q?.prompt).toContain('alle 7 Tage');
    expect(q?.prompt).toContain('14 Tagen');
  });

  it('Ereignisgewichte in den Aufgaben: Aufruf 1, Warenkorb 3, Kauf 5', () => {
    expect(EVENT_WEIGHTS).toEqual({ view: 1, cart: 3, purchase: 5 });
    const task = meta.codeTasks?.[2];
    expect(task?.prompt).toContain('`view` zählt `1`');
    expect(task?.prompt).toContain('`cart` `3`');
    expect(task?.prompt).toContain('`purchase` `5`');
    expect(task?.prompt).toContain('`7` Tage');
  });

  it('Aufgabe 1 nennt die Zahlen des Rechenbeispiels', () => {
    const prompt = meta.codeTasks?.[0]?.prompt ?? '';
    const { signals, weights, score } = EXAMPLE;
    for (const n of [signals.affinity, signals.popularity, signals.similarity, weights.affinity, weights.popularity, score]) {
      expect(prompt).toContain(`\`${n}\``);
    }
  });

  it('der Text nennt nur geprüfte Zahlen', () => {
    // 7 Tage Halbwertszeit, 14 Tage in der Schätzfrage, 25 Prozent als Antwort; in den Aufgaben
    // 0, 1, 3, 5 (Gewichte, Mindestwerte), 7, das Rechenbeispiel 0.3 / 0.9 / 1 / 0.6 / 0.2 / 0.56
    // und die Millisekunden eines Tages; sonst keine Ziffern.
    expect([...new Set(text.match(/\d+/g))].sort()).toEqual(['0', '1', '14', '2', '25', '3', '5', '56', '6', '7', '86400000', '9']);
    expect(86_400_000).toBe(24 * 60 * 60 * 1000);
    expect(text).toContain('fast nur aus einer Kategorie');
  });

  it('das Beispiel aus „Unter der Haube“ stimmt mit rankProducts für Anna überein', () => {
    const [first] = rankProducts(CATALOG, anna, PRESETS.personal.weights, options, NOW);
    expect(first?.product.id).toBe(EXAMPLE.productId);
    expect(EXAMPLE.weights).toEqual(PRESETS.personal.weights);
    const { profile } = categoryAffinity(anna.events, NOW, CATALOG);
    const w = PRESETS.personal.weights;
    expect(round2(profile[first!.product.category]!)).toBe(EXAMPLE.signals.affinity);
    expect(round2(first!.parts.popularity / w.popularity)).toBe(EXAMPLE.signals.popularity);
    expect(round2(first!.parts.similarity / w.similarity)).toBe(EXAMPLE.signals.similarity);
    expect(round2(first!.score)).toBe(EXAMPLE.score);
    // Die gerundeten Signale ergeben mit denselben Gewichten dieselbe gerundete Summe.
    expect(round2(scoreProduct(EXAMPLE.signals, EXAMPLE.weights))).toBe(EXAMPLE.score);
  });
});

describe('C-003 Inhalte: Aussagen über das Ranking', () => {
  it('Kaltstart: ohne Verlauf sieht jeder Neue dieselbe Liste, nur die Beliebtheit wirkt', () => {
    const lists = VISITORS.filter((v) => v.events.length === 0).map((v) =>
      rankProducts(CATALOG, v, PRESETS.personal.weights, options, NOW).map((r) => r.product.id),
    );
    expect(lists.length).toBeGreaterThan(0);
    expect(new Set(lists.map((l) => l.join())).size).toBe(1);
    const ranked = rankProducts(CATALOG, newcomer, PRESETS.balanced.weights, options, NOW);
    expect(ranked.every((r) => r.parts.affinity === 0 && r.parts.similarity === 0)).toBe(true);
    expect(ranked[0]?.parts.popularity).toBeGreaterThan(0);
  });

  it('Filter: nach dem Ausblenden bleibt die Liste voll, das nächste Produkt rückt nach', () => {
    const open = rankProducts(CATALOG, anna, PRESETS.popular.weights, { ...options, hideOutOfStock: false, n: 24 }, NOW);
    const filtered = rankProducts(CATALOG, anna, PRESETS.popular.weights, options, NOW);
    expect(filtered).toHaveLength(8);
    expect(filtered.every((r) => r.product.availability === 'in_stock')).toBe(true);
    expect(open.some((r) => r.product.availability === 'out_of_stock')).toBe(true);
  });

  it('Ähnlich: die vorderen Plätze kommen fast nur aus einer Kategorie', () => {
    const list = rankProducts(CATALOG, anna, PRESETS.similar.weights, options, NOW);
    const lastViewed = CATALOG.find((p) => p.id === 'P01')!;
    expect(list.slice(0, 4).every((r) => r.product.category === lastViewed.category)).toBe(true);
    expect(text).not.toContain('aus einer einzigen');
  });
});
