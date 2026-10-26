import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { Check, CheckModule } from '../../../codeTask/types';

type StepRates = (counts: number[]) => unknown;

/** Quoten sind Brüche wie 100 / 500; verglichen wird auf neun Stellen. */
const TOLERANCE = 1e-9;

const close = (a: unknown, b: number) => typeof a === 'number' && !Number.isNaN(a) && Math.abs(a - b) <= TOLERANCE;

/** Ruft `stepRates` auf, vergleicht `rates` und `overall` und prüft, dass die Eingabe unverändert bleibt. */
function expectRates(name: string, counts: number[], rates: number[], overall: number): Check {
  return {
    name,
    run({ exports }) {
      const fn = exports.stepRates;
      if (typeof fn !== 'function') {
        throw new CheckFailure(`\`stepRates\` soll eine Funktion sein, ist aber ${formatValue(fn)}.`);
      }
      const before = [...counts];
      const result = (fn as StepRates)(counts) as { rates?: unknown; overall?: unknown } | null;
      const got = result?.rates;
      if (!Array.isArray(got) || got.length !== rates.length || !got.every((r, i) => close(r, rates[i]!))) {
        throw new CheckFailure(`\`rates\` für ${formatValue(counts)}: erwartet ${formatValue(rates)}, bekommen ${formatValue(got)}`);
      }
      if (!close(result?.overall, overall)) {
        throw new CheckFailure(`\`overall\` für ${formatValue(counts)}: erwartet ${overall}, bekommen ${formatValue(result?.overall)}`);
      }
      expectEqual(counts, before, 'Eingabe nach dem Aufruf');
    },
  };
}

// Erwartete Werte in code.test.ts gegen computeFunnel aus dem Kern geprüft.
const module: CheckModule = {
  exportsNeeded: ['stepRates'],
  checks: [
    expectRates('Beispiel: `[1000, 500, 100, 50, 25]`', [1000, 500, 100, 50, 25], [0.5, 0.2, 0.5, 0.5], 0.025),
    expectRates('Suche aus der Demo: `[8000, 4800, 720, 396, 237.6]`', [8000, 4800, 720, 396, 237.6], [0.6, 0.15, 0.55, 0.6], 0.0297),
    expectRates('Null in einem Schritt ergibt Quote `0` statt `NaN`', [100, 50, 0, 0, 0], [0.5, 0, 0, 0], 0),
    expectRates('Ganz ohne Besuche überall `0`', [0, 0, 0, 0, 0], [0, 0, 0, 0], 0),
    expectRates('Ein Schritt ergibt eine leere Liste', [100], [], 1),
  ],
};

export default module;
