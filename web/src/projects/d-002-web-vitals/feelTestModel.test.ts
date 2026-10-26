import { describe, expect, it } from 'vitest';
import { rateMetric } from '../../experience/vitals';
import { BLOCK_DURATIONS, blockFor, measureNextPaint } from './feelTestModel';

describe('measureNextPaint', () => {
  it('rundet auf ganze Millisekunden', () => {
    expect(measureNextPaint(100, 316.4)).toBe(216);
    expect(measureNextPaint(100, 316.6)).toBe(217);
  });

  it('ist nie negativ (Review Focus 4)', () => {
    expect(measureNextPaint(10, 5)).toBe(0);
    expect(measureNextPaint(10, 10)).toBe(0);
  });
});

describe('blockFor', () => {
  it('blockiert mindestens die verlangte Zeit', () => {
    const start = performance.now();
    blockFor(20);
    expect(performance.now() - start).toBeGreaterThanOrEqual(20);
  });

  it('negative Dauer kehrt sofort zurück', () => {
    const start = performance.now();
    blockFor(-50);
    expect(performance.now() - start).toBeLessThan(20);
  });
});

describe('Knöpfe', () => {
  it('50, 200 und 600 ms; mit einem Bild dazu landen sie in den drei Stufen', () => {
    expect(BLOCK_DURATIONS).toEqual([50, 200, 600]);
    // Ein Bild bei 60 Hz dauert etwa 16 ms.
    expect(BLOCK_DURATIONS.map((ms) => rateMetric('inp', ms + 16))).toEqual(['good', 'needsImprovement', 'poor']);
  });
});
