import { describe, expect, it } from 'vitest';
import { calculateSampleSize, inverseStandardNormal } from './sampleSize';

// Referenzfälle aus dem früheren MDE Visualizer (Versuch A-001),
// unverändert in den Werten (geprüft gegen R stats::power.prop.test).
describe('calculateSampleSize', () => {
  it.each([
    ['Standard 10 % → 11 %', { baseline: 10, mde: 1, alpha: 0.05, power: 0.8 }, 14750.790469, 14751],
    ['R-Doku 50 % → 75 %, Power .90', { baseline: 50, mde: 25, alpha: 0.05, power: 0.9 }, 76.706928, 77],
    ['10 % → 15 %', { baseline: 10, mde: 5, alpha: 0.05, power: 0.8 }, 685.596858, 686],
  ])('%s', (_n, input, raw, perVariant) => {
    const r = calculateSampleSize(input)!;
    expect(Math.abs(r.raw - raw)).toBeLessThan(0.0001);
    expect(r.perVariant).toBe(perVariant);
    expect(r.total).toBe(perVariant * 2);
  });

  it('lehnt Zielrate ≥ 100 % ab', () =>
    expect(calculateSampleSize({ baseline: 99, mde: 2, alpha: 0.05, power: 0.8 })).toBeNull());

  it('lehnt nicht endliche oder unsinnige Eingaben ab', () => {
    expect(calculateSampleSize({ baseline: Number.NaN, mde: 1, alpha: 0.05, power: 0.8 })).toBeNull();
    expect(calculateSampleSize({ baseline: 10, mde: 0, alpha: 0.05, power: 0.8 })).toBeNull();
    expect(calculateSampleSize({ baseline: 0, mde: 1, alpha: 0.05, power: 0.8 })).toBeNull();
    expect(calculateSampleSize({ baseline: 10, mde: 1, alpha: 0, power: 0.8 })).toBeNull();
    expect(calculateSampleSize({ baseline: 10, mde: 1, alpha: 0.05, power: 1 })).toBeNull();
  });
});

describe('inverseStandardNormal', () => {
  it('liefert bekannte z-Werte', () => {
    expect(inverseStandardNormal(0.5)).toBeCloseTo(0, 9);
    expect(inverseStandardNormal(0.975)).toBeCloseTo(1.959964, 5);
    expect(inverseStandardNormal(0.8)).toBeCloseTo(0.841621, 5);
    expect(inverseStandardNormal(0.01)).toBeCloseTo(-2.326348, 5);
  });

  it('wirft außerhalb von (0, 1)', () => {
    expect(() => inverseStandardNormal(0)).toThrow(RangeError);
    expect(() => inverseStandardNormal(1)).toThrow(RangeError);
  });
});
