import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { Check, CheckModule } from '../../../codeTask/types';

type RateMetric = (name: string, value: number) => unknown;
type Rating = 'good' | 'needsImprovement' | 'poor';

/** Ruft `rateMetric` auf und vergleicht die Stufe. */
function expectRating(name: string, metric: 'lcp' | 'cls' | 'inp', value: number, expected: Rating): Check {
  return {
    name,
    run({ exports }) {
      const fn = exports.rateMetric;
      if (typeof fn !== 'function') {
        throw new CheckFailure(`\`rateMetric\` soll eine Funktion sein, ist aber ${formatValue(fn)}.`);
      }
      expectEqual((fn as RateMetric)(metric, value), expected, `\`rateMetric('${metric}', ${value})\``);
    },
  };
}

// Grenzen wie THRESHOLDS in vitals.ts; code.test.ts prüft jeden Fall gegen rateMetric aus dem Kern.
const module: CheckModule = {
  exportsNeeded: ['rateMetric'],
  checks: [
    expectRating('LCP `1.8` ist `good`', 'lcp', 1.8, 'good'),
    expectRating('LCP genau `2.5` ist noch `good`', 'lcp', 2.5, 'good'),
    expectRating('LCP `3.2` ist `needsImprovement`', 'lcp', 3.2, 'needsImprovement'),
    expectRating('LCP genau `4` ist noch `needsImprovement`', 'lcp', 4, 'needsImprovement'),
    expectRating('LCP `4.53` ist `poor`', 'lcp', 4.53, 'poor'),
    expectRating('CLS `0.05` ist `good`', 'cls', 0.05, 'good'),
    expectRating('CLS genau `0.1` ist noch `good`', 'cls', 0.1, 'good'),
    expectRating('CLS `0.17` ist `needsImprovement`', 'cls', 0.17, 'needsImprovement'),
    expectRating('CLS genau `0.25` ist noch `needsImprovement`', 'cls', 0.25, 'needsImprovement'),
    expectRating('CLS `0.32` ist `poor`', 'cls', 0.32, 'poor'),
    expectRating('INP `56` ist `good`', 'inp', 56, 'good'),
    expectRating('INP genau `200` ist noch `good`', 'inp', 200, 'good'),
    expectRating('INP `350` ist `needsImprovement`', 'inp', 350, 'needsImprovement'),
    expectRating('INP genau `500` ist noch `needsImprovement`', 'inp', 500, 'needsImprovement'),
    expectRating('INP `576` ist `poor`', 'inp', 576, 'poor'),
  ],
};

export default module;
