import { describe, expect, it } from 'vitest';
import { inverseStandardNormal, standardNormalCdf } from './normal';

describe('standardNormalCdf', () => {
  it.each([
    [0, 0.5],
    [1.96, 0.9750021048517796],
    [-1, 0.15865525393145707],
    [3, 0.9986501019683699],
  ])('Φ(%s)', (x, p) => expect(Math.abs(standardNormalCdf(x) - p)).toBeLessThan(1e-6));

  it('Schwanz relativ genau: Φ(−4,5) = 3,3977e-6', () =>
    expect(Math.abs(standardNormalCdf(-4.5) / 3.397673124730062e-6 - 1)).toBeLessThan(1e-5));

  it('Schwanz bleibt positiv: Φ(−9) > 0', () => expect(standardNormalCdf(-9)).toBeGreaterThan(0));
});

describe('inverseStandardNormal (Umkehrung)', () => {
  it('Φ(inverse(p)) ≈ p', () => {
    for (const p of [0.001, 0.025, 0.5, 0.8, 0.975, 0.9995])
      expect(Math.abs(standardNormalCdf(inverseStandardNormal(p)) - p)).toBeLessThan(1e-6);
  });
});
