import { describe, expect, it } from 'vitest';
import { MOBILE_SHARE_A, SEGMENT_RATES, compare, overallRate, tippingPoint } from './simpson';

describe('overallRate', () => {
  it('A bei 50 % Mobil: 4,0', () => {
    expect(overallRate(SEGMENT_RATES.A, MOBILE_SHARE_A)).toBeCloseTo(4.0, 10);
  });
});

describe('tippingPoint', () => {
  it('(6,6 − 4,0) / (6,6 − 2,4) = 61,9048 %', () => {
    expect(tippingPoint()).toBeCloseTo(61.9048, 3);
  });
});

describe('compare', () => {
  it('50 % Mobil in B: B gewinnt mit 4,5, kein Paradox', () => {
    const r = compare(50);
    expect(r.overallA).toBeCloseTo(4.0, 10);
    expect(r.overallB).toBeCloseTo(4.5, 10);
    expect(r.overallWinner).toBe('B');
    expect(r.paradox).toBe(false);
  });

  it('70 % Mobil in B: B fällt auf 3,66, A gewinnt, Paradox', () => {
    const r = compare(70);
    expect(r.overallB).toBeCloseTo(3.66, 10);
    expect(r.overallWinner).toBe('A');
    expect(r.paradox).toBe(true);
  });

  it('genau am Kipppunkt: Gleichstand, kein Paradox', () => {
    const r = compare(tippingPoint());
    expect(Math.abs(r.overallB - r.overallA)).toBeLessThan(1e-9);
    expect(r.overallWinner).toBe('tie');
    expect(r.paradox).toBe(false);
  });

  it('knapp darunter und darüber kippt der Gewinner', () => {
    expect(compare(tippingPoint() - 0.01).overallWinner).toBe('B');
    expect(compare(tippingPoint() + 0.01).overallWinner).toBe('A');
  });
});
