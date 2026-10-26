import { CheckFailure, formatValue } from '../../../codeTask/assert';
import type { Check, CheckModule } from '../../../codeTask/types';

type RevenuePerVisit = (input: { visits: number; orders: number; averageOrderValue: number }) => unknown;

/** Ungerundet verglichen, auf neun Stellen. */
const TOLERANCE = 1e-9;

/** Ruft `revenuePerVisit` auf und vergleicht mit Toleranz. */
function expectRpv(name: string, input: { visits: number; orders: number; averageOrderValue: number }, expected: number): Check {
  return {
    name,
    run({ exports }) {
      const fn = exports.revenuePerVisit;
      if (typeof fn !== 'function') {
        throw new CheckFailure(`\`revenuePerVisit\` soll eine Funktion sein, ist aber ${formatValue(fn)}.`);
      }
      const result = (fn as RevenuePerVisit)({ ...input });
      if (typeof result !== 'number' || Number.isNaN(result) || Math.abs(result - expected) > TOLERANCE) {
        throw new CheckFailure(`\`revenuePerVisit(${formatValue(input)})\`: erwartet ${expected}, bekommen ${formatValue(result)}`);
      }
    },
  };
}

// Erwartete Werte in code.test.ts gegen kpis aus dem Kern geprüft.
const module: CheckModule = {
  exportsNeeded: ['revenuePerVisit'],
  checks: [
    expectRpv('Beispiel: `20000` Besuche, `520` Käufe zu `92` €', { visits: 20000, orders: 520, averageOrderValue: 92 }, 2.392),
    expectRpv('Null Besuche ergeben `0`', { visits: 0, orders: 0, averageOrderValue: 92 }, 0),
    expectRpv('Null Besuche ergeben `0`, auch mit Käufen', { visits: 0, orders: 5, averageOrderValue: 92 }, 0),
    expectRpv('Nicht runden: `3` Besuche, `1` Kauf zu `10` €', { visits: 3, orders: 1, averageOrderValue: 10 }, 10 / 3),
  ],
};

export default module;
