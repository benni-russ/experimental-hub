import { describe, expect, it } from 'vitest';
import { binomial, createRandom } from './random';

describe('createRandom', () => {
  it('gleicher Startwert, gleiche Folge', () => {
    const a = createRandom(42), b = createRandom(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it('Fixwerte für Startwert 1 (Referenzfolge von mulberry32)', () => {
    const r = createRandom(1);
    expect([r(), r(), r()]).toEqual([0.6270739405881613, 0.002735721180215478, 0.5274470399599522]);
  });

  it('anderer Startwert, andere Folge', () => expect(createRandom(1)()).not.toBe(createRandom(2)()));

  it('Werte in [0, 1)', () => {
    const r = createRandom(7);
    for (let i = 0; i < 10_000; i++) {
      const v = r();
      expect(v >= 0 && v < 1).toBe(true);
    }
  });
});

describe('binomial', () => {
  it('Mittel und Streuung passen (n = 1.000, p = 0,1, 2.000 Züge)', () => {
    const r = createRandom(2026);
    const xs = Array.from({ length: 2000 }, () => binomial(r, 1000, 0.1));
    const mean = xs.reduce((s, x) => s + x, 0) / xs.length;
    const sd = Math.sqrt(xs.reduce((s, x) => s + (x - mean) ** 2, 0) / (xs.length - 1));
    expect(Math.abs(mean - 100)).toBeLessThan(1); // Standardfehler ≈ 0,21
    expect(Math.abs(sd - Math.sqrt(90))).toBeLessThan(0.6);
  });

  it('gleicher Startwert, gleiche Folge von Ziehungen', () => {
    const draw = (seed: number) => {
      const r = createRandom(seed);
      return Array.from({ length: 5 }, () => binomial(r, 1000, 0.1));
    };
    expect(draw(2026)).toEqual(draw(2026));
    expect(draw(2026)).not.toEqual(draw(2027));
  });

  it('Ränder', () => {
    const r = createRandom(1);
    expect(binomial(r, 0, 0.5)).toBe(0);
    expect(binomial(r, 50, 0)).toBe(0);
    expect(binomial(r, 50, 1)).toBe(50);
  });

  it('lehnt Unsinn ab', () => {
    const r = createRandom(1);
    expect(() => binomial(r, -1, 0.5)).toThrow(RangeError);
    expect(() => binomial(r, 1.5, 0.5)).toThrow(RangeError);
    expect(() => binomial(r, 10, 1.2)).toThrow(RangeError);
  });
});
