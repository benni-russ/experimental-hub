import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { Check, CheckModule } from '../../../codeTask/types';

interface Pair {
  conversionRate: number;
  revenue: number;
}
type Direction = 'up' | 'down' | 'same';
type CompareKpis = (before: Pair, after: Pair) => unknown;

/** Ruft `compareKpis` auf und vergleicht das ganze Ergebnis. */
function expectComparison(name: string, before: Pair, after: Pair, cr: Direction, revenue: Direction, conflict: boolean): Check {
  return {
    name,
    run({ exports }) {
      const fn = exports.compareKpis;
      if (typeof fn !== 'function') {
        throw new CheckFailure(`\`compareKpis\` soll eine Funktion sein, ist aber ${formatValue(fn)}.`);
      }
      expectEqual(
        (fn as CompareKpis)({ ...before }, { ...after }),
        { conversionRate: cr, revenue, conflict },
        `\`compareKpis(${formatValue(before)}, ${formatValue(after)})\``,
      );
    },
  };
}

const start: Pair = { conversionRate: 0.026, revenue: 47825 };

// Werte aus den Szenarien der Demo, gerundet; code.test.ts prüft die Richtungen gegen compareKpis aus dem Kern.
const module: CheckModule = {
  exportsNeeded: ['compareKpis'],
  checks: [
    expectComparison('Beide steigen: kein Widerspruch', start, { conversionRate: 0.0299, revenue: 54999 }, 'up', 'up', false),
    expectComparison('Rate steigt, Umsatz fällt: Widerspruch', start, { conversionRate: 0.0291, revenue: 45529 }, 'up', 'down', true),
    expectComparison('Rate fällt, Umsatz steigt: Widerspruch', start, { conversionRate: 0.0219, revenue: 50309 }, 'down', 'up', true),
    expectComparison('Beide fallen: kein Widerspruch', start, { conversionRate: 0.02, revenue: 40000 }, 'down', 'down', false),
    expectComparison('Rate bleibt gleich: kein Widerspruch', start, { conversionRate: 0.026, revenue: 50000 }, 'same', 'up', false),
    expectComparison('Alles bleibt gleich', start, { ...start }, 'same', 'same', false),
  ],
};

export default module;
