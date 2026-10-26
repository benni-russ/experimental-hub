import { describe, expect, it } from 'vitest';
import { applyCause, CAUSES, measuredUplift } from './causes';
import { srmTest } from './srm';

describe('applyCause', () => {
  it.each([
    ['redirect', 0.01, 0.8081, false],
    ['redirect', 0.05, 4.2105, true],
    ['bots', 0.02, 2.0, false],
    ['bots', 0.05, 5.0, true],
    ['crossover', 0.01, 2.0206, false],
    ['crossover', 0.02, 4.085, true],
  ] as const)('%s %s: Scheineffekt %s %%', (cause, s, uplift, mismatch) => {
    const c = applyCause(cause, s);
    expect(measuredUplift(c)).toBeCloseTo(uplift, 3);
    expect(srmTest({ visitorsA: c.visitorsA, visitorsB: c.visitorsB, plannedShareA: 50 })!.mismatch).toBe(mismatch);
  });

  it('Stärke 0: keine Verschiebung, kein Effekt', () => {
    for (const id of ['redirect', 'bots', 'crossover'] as const) {
      expect(measuredUplift(applyCause(id, 0))).toBeCloseTo(0, 9);
    }
  });

  it('liefert ganze Zahlen und gültige Zählwerte', () => {
    for (const { id } of CAUSES) {
      const c = applyCause(id, 0.037);
      for (const v of Object.values(c)) expect(Number.isInteger(v)).toBe(true);
      expect(c.conversionsA).toBeLessThanOrEqual(c.visitorsA);
      expect(c.conversionsB).toBeLessThanOrEqual(c.visitorsB);
    }
  });
});

describe('CAUSES', () => {
  it('hat drei Ursachen mit Texten', () => {
    expect(CAUSES.map((c) => c.id)).toEqual(['redirect', 'bots', 'crossover']);
    for (const c of CAUSES) {
      expect(c.label).toBeTruthy();
      expect(c.strengthLabel).toBeTruthy();
      expect(c.description).toBeTruthy();
    }
  });
});
