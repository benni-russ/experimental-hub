import { describe, expect, it } from 'vitest';
import { DEFAULT_SEED, simulateIntervals } from './simulate';

describe('simulateIntervals', () => {
  it('gleicher Aufruf zweimal ergibt dasselbe Ergebnis', () => {
    const input = { seed: DEFAULT_SEED, visitorsPerVariant: 1000, tests: 50, level: 0.95 };
    expect(simulateIntervals(input)).toEqual(simulateIntervals(input));
  });

  it('liefert je Test ein Intervall und zählt die Treffer', () => {
    const result = simulateIntervals({ seed: DEFAULT_SEED, visitorsPerVariant: 1000, tests: 120, level: 0.95 });
    expect(result.intervals).toHaveLength(120);
    expect(result.covered).toBe(result.intervals.filter((i) => i.covers).length);
  });

  it('mehr Besucher ergeben schmalere Intervalle', () => {
    const meanWidth = (visitorsPerVariant: number) => {
      const { intervals } = simulateIntervals({ seed: DEFAULT_SEED, visitorsPerVariant, tests: 50, level: 0.95 });
      return intervals.reduce((sum, i) => sum + (i.upper - i.lower), 0) / intervals.length;
    };
    const ratio = meanWidth(40000) / meanWidth(10000);
    expect(ratio).toBeGreaterThan(0.45);
    expect(ratio).toBeLessThan(0.55);
  });

  it('Trefferquote liegt nahe am Konfidenzniveau (95 %)', () => {
    const { covered } = simulateIntervals({ seed: DEFAULT_SEED, visitorsPerVariant: 2000, tests: 2000, level: 0.95 });
    expect(covered / 2000).toBeGreaterThanOrEqual(0.93);
    expect(covered / 2000).toBeLessThanOrEqual(0.97);
  });

  it('Trefferquote liegt nahe am Konfidenzniveau (90 %)', () => {
    const { covered } = simulateIntervals({ seed: DEFAULT_SEED, visitorsPerVariant: 2000, tests: 2000, level: 0.9 });
    expect(covered / 2000).toBeGreaterThanOrEqual(0.875);
    expect(covered / 2000).toBeLessThanOrEqual(0.925);
  });
});
