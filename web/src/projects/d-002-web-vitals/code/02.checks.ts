import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { Check, CheckModule } from '../../../codeTask/types';

type Percentile75 = (values: number[]) => unknown;

/** Ruft `percentile75` auf, vergleicht und prüft, dass die Eingabe unverändert bleibt. */
function expectP75(name: string, values: number[], expected: number): Check {
  return {
    name,
    run({ exports }) {
      const fn = exports.percentile75;
      if (typeof fn !== 'function') {
        throw new CheckFailure(`\`percentile75\` soll eine Funktion sein, ist aber ${formatValue(fn)}.`);
      }
      const before = structuredClone(values);
      const result = (fn as Percentile75)(values);
      expectEqual(result, expected, `75. Perzentil von ${formatValue(values)}`);
      expectEqual(values, before, 'Eingabe nach dem Aufruf');
    },
  };
}

// Die 20 INP-Werte der Feldbesuche im Startstand (ms), in Besuchsreihenfolge; code.test.ts prüft
// sie gegen fieldResults({}) und den Erwartungswert gegen percentile75 aus dem Kern.
export const FIELD_INP = [576, 296, 856, 576, 576, 856, 408, 1136, 856, 576, 576, 1136, 856, 408, 576, 576, 856, 1696, 296, 1136];

const module: CheckModule = {
  exportsNeeded: ['percentile75'],
  checks: [
    expectP75('Vier Werte: der 3.', [1, 2, 3, 4], 3),
    expectP75('Unsortierte Eingabe wird erst sortiert', [40, 10, 30, 20], 30),
    expectP75('Ein einzelner Wert ist sein eigenes Perzentil', [7], 7),
    expectP75('20 Werte: der 15.', Array.from({ length: 20 }, (_, i) => (i * 7) % 20), 14),
    expectP75('Die 20 INP-Werte der Feldbesuche ergeben `856`', FIELD_INP, 856),
    expectP75('Fünf Werte: Stelle aufgerundet, also der 4.', [5, 1, 4, 2, 3], 4),
  ],
};

export default module;
