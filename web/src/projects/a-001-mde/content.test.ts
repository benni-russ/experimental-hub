import { describe, expect, it } from 'vitest';
import { meta } from './content';
import { calculateSampleSize } from './sampleSize';

const n = (baseline: number, mde: number, alpha = 0.05, power = 0.8) =>
  calculateSampleSize({ baseline, mde, alpha, power })!;

const allText = [
  meta.intro.text,
  ...meta.quiz.flatMap((q) => [q.prompt, q.explanation, ...(q.type === 'choice' ? q.options : [])]),
  ...meta.cards.flatMap((c) => [c.front, c.back]),
].join('\n');

// Jede Zahl, die ein Text nennt, wird hier nachgerechnet und im Text gesucht.
describe('A-001 Inhalte: zitierte Zahlen', () => {
  it('Schätzfrage: 10 % → 11 % sind 14.751 je Variante, 29.502 insgesamt', () => {
    const r = n(10, 1);
    const estimate = meta.quiz.find((q) => q.id === 'A-001-quiz-01');
    expect(estimate?.type === 'estimate' && estimate.answer).toBe(r.perVariant);
    expect(r.raw.toFixed(2)).toBe('14750.79');
    expect(r.total).toBe(29502);
    expect(allText).toContain('14.750,79');
    expect(allText).toContain('14.751');
    expect(allText).toContain('29.502');
  });

  it('halber MDE ≈ vierfache Stichprobe: 2 → 1 Prozentpunkt sind 3.841 → 14.751 (3,84-fach)', () => {
    expect(n(10, 2).perVariant).toBe(3841);
    expect((n(10, 1).perVariant / n(10, 2).perVariant).toFixed(2)).toBe('3.84');
    expect(allText).toContain('3.841');
    expect(allText).toContain('3,84');
  });

  it('Power 90 % statt 80 %: 19.747 je Variante', () => {
    expect(n(10, 1, 0.05, 0.9).perVariant).toBe(19747);
    expect(allText).toContain('19.747');
  });

  it('kleiner MDE ist teuer: 5 / 1 / 0,2 Prozentpunkte → 686 / 14.751 / 356.335', () => {
    expect(n(10, 5).perVariant).toBe(686);
    expect(n(10, 0.2).perVariant).toBe(356335);
    expect(allText).toContain('5 Prozentpunkten 686 Personen je Variante');
    expect(allText).toContain('356.335');
  });

  it('+10 % relativ bei 20 % Baseline sind 2 Prozentpunkte und 6.510 je Variante', () => {
    const r = n(20, 2);
    expect(r.relativeUplift).toBeCloseTo(10, 9);
    expect(n(10, 1).relativeUplift).toBeCloseTo(10, 9);
    expect(r.perVariant).toBe(6510);
    expect(allText).toContain('6.510');
  });
});

describe('A-001 Inhalte: Aufbau', () => {
  it('IDs folgen dem Schema und sind eindeutig', () => {
    const ids = [...meta.quiz, ...meta.reflection, ...meta.cards].map((x) => x.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const q of meta.quiz) expect(q.id).toMatch(/^A-001-quiz-\d{2}$/);
    for (const r of meta.reflection) expect(r.id).toMatch(/^A-001-refl-\d{2}$/);
    for (const c of meta.cards) expect(c.id).toMatch(/^A-001-card-\d{2}$/);
  });

  it('Einstieg verweist auf die Schätzfrage im Quiz', () => {
    const q = meta.quiz.find((x) => x.id === meta.intro.estimateQuestionId);
    expect(q?.type).toBe('estimate');
  });

  it('Umfang wie geplant: 4 Quizfragen, 2 Reflexionen, 6–8 Karten', () => {
    expect(meta.quiz).toHaveLength(4);
    expect(meta.reflection).toHaveLength(2);
    expect(meta.cards.length).toBeGreaterThanOrEqual(6);
    expect(meta.cards.length).toBeLessThanOrEqual(8);
  });
});
