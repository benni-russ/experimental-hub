import { describe, expect, it } from 'vitest';
import { halveMde } from './halving';

const base = { alpha: 0.05, power: 0.8 };

describe('halveMde', () => {
  it('Standard 10 %, 1 → 0,5 Prozentpunkte: 57.763 statt 14.751, das 3,92-Fache', () => {
    const h = halveMde({ baseline: 10, mde: 1, ...base })!;
    expect(h.half.perVariant).toBe(57763);
    expect(h.ratio.toFixed(2)).toBe('3.92');
  });

  it('10 %, 0,5 → 0,25 Prozentpunkte: das 3,96-Fache', () => {
    expect(halveMde({ baseline: 10, mde: 0.5, ...base })!.ratio.toFixed(2)).toBe('3.96');
  });

  it('kleine Baseline, großer Unterschied (1 %, 5 Prozentpunkte): nur das 2,62-Fache', () => {
    expect(halveMde({ baseline: 1, mde: 5, ...base })!.ratio.toFixed(2)).toBe('2.62');
  });

  it('oberes Ende der Demo (50 %, 5 Prozentpunkte, α 0,01, Power 90 %): das 4,01-Fache', () => {
    expect(halveMde({ baseline: 50, mde: 5, alpha: 0.01, power: 0.9 })!.ratio.toFixed(2)).toBe('4.01');
  });

  it('ungültig → null', () => {
    expect(halveMde({ baseline: 99, mde: 2, ...base })).toBeNull();
  });
});
