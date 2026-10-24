import { describe, expect, it } from 'vitest';
import { differenceInterval, twoProportionZTest } from './proportions';

const c = (visitorsA: number, conversionsA: number, visitorsB: number, conversionsB: number) => ({
  visitorsA,
  conversionsA,
  visitorsB,
  conversionsB,
});

describe('differenceInterval', () => {
  it.each([
    ['10.000 je Seite, 10 % → 11 %, 95 %', c(10000, 1000, 10000, 1100), 0.95, 1.0, 0.433474, 0.150406, 1.849594],
    ['2.000 je Seite, 5 % → 6,5 %, 90 %', c(2000, 100, 2000, 130), 0.9, 1.5, 0.735782, 0.289746, 2.710254],
    ['50.000 je Seite, 10 % → 10,3 %, 99 %', c(50000, 5000, 50000, 5150), 0.99, 0.3, 0.190993, -0.191965, 0.791965],
  ])('%s', (_n, counts, level, diff, se, lo, hi) => {
    const r = differenceInterval(counts, level)!;
    expect(r.difference).toBeCloseTo(diff, 6);
    expect(r.standardError).toBeCloseTo(se, 5);
    expect(r.lower).toBeCloseTo(lo, 4);
    expect(r.upper).toBeCloseTo(hi, 4);
  });

  it('Schätzfrage 006: halbe Breite 0,8496 Prozentpunkte', () => {
    const r = differenceInterval(c(10000, 1000, 10000, 1100), 0.95)!;
    expect((r.upper - r.difference).toFixed(4)).toBe('0.8496');
  });

  it('0 Käufe: endlich und als schwach markiert', () => {
    const r = differenceInterval(c(500, 0, 500, 3), 0.95)!;
    expect(Number.isFinite(r.lower) && Number.isFinite(r.upper)).toBe(true);
    expect(r.approximationWeak).toBe(true);
  });

  it.each([
    ['beide 0 %', c(200, 0, 300, 0)],
    ['beide 100 %', c(200, 200, 300, 300)],
  ])('Standardfehler 0 (%s): Intervall der Breite 0, endlich, als schwach markiert', (_, k) => {
    const r = differenceInterval(k, 0.95)!;
    expect(r.standardError).toBe(0);
    expect(r.difference).toBe(0);
    expect(r.lower).toBe(0);
    expect(r.upper).toBe(0);
    expect(r.approximationWeak).toBe(true);
  });

  it('große Zahlen: nicht schwach', () => {
    expect(differenceInterval(c(10000, 1000, 10000, 1100), 0.95)!.approximationWeak).toBe(false);
  });

  it.each([c(0, 0, 100, 5), c(100, 101, 100, 5), c(100.5, 5, 100, 5), c(100, 5, 100, Number.NaN)])(
    'ungültig: %o',
    (k) => {
      expect(differenceInterval(k, 0.95)).toBeNull();
      expect(twoProportionZTest(k)).toBeNull();
    },
  );

  it('Niveau außerhalb (0, 1)', () => {
    expect(differenceInterval(c(100, 5, 100, 6), 1)).toBeNull();
  });
});

describe('twoProportionZTest', () => {
  it.each([
    [c(10000, 1000, 10000, 1100), 2.3066347738, 0.0210751893],
    [c(2000, 100, 2000, 130), 2.0375893278, 0.0415910202],
  ])('z-Test %#', (k, z, p) => {
    const r = twoProportionZTest(k)!;
    expect(r.z).toBeCloseTo(z, 5);
    expect(r.pValue).toBeCloseTo(p, 6);
  });

  it('z-Test ohne Käufe: p = 1', () => {
    expect(twoProportionZTest(c(100, 0, 100, 0))).toEqual({ z: 0, pValue: 1 });
  });
});
