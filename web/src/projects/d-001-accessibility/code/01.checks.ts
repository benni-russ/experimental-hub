import { CheckFailure, formatValue } from '../../../codeTask/assert';
import type { Check, CheckModule } from '../../../codeTask/types';

type ContrastRatio = (a: string, b: string) => unknown;

/** Die Aufgabe verlangt zwei Stellen nach dem Komma. */
const TOLERANCE = 0.01;

/** Ruft `contrastRatio` auf und vergleicht mit Toleranz. */
function expectRatio(name: string, a: string, b: string, expected: number): Check {
  return {
    name,
    run({ exports }) {
      const fn = exports.contrastRatio;
      if (typeof fn !== 'function') {
        throw new CheckFailure(`\`contrastRatio\` soll eine Funktion sein, ist aber ${formatValue(fn)}.`);
      }
      const result = (fn as ContrastRatio)(a, b);
      if (typeof result !== 'number' || Number.isNaN(result) || Math.abs(result - expected) > TOLERANCE) {
        throw new CheckFailure(`\`contrastRatio('${a}', '${b}')\`: erwartet etwa ${expected}, bekommen ${formatValue(result)}`);
      }
    },
  };
}

// Erwartete Werte aus der WCAG-Formel, in code.test.ts gegen contrastRatio aus dem Kern geprüft.
const module: CheckModule = {
  exportsNeeded: ['contrastRatio'],
  checks: [
    expectRatio('Schwarz auf Weiß ergibt `21`', '#000000', '#ffffff', 21),
    expectRatio('Gleiche Farbe ergibt `1`', '#767676', '#767676', 1),
    expectRatio('Hellgrau `#9a9a9a` auf Weiß ergibt `2.81`', '#9a9a9a', '#ffffff', 2.81),
    expectRatio('Die Reihenfolge ist egal: Weiß und `#9a9a9a`', '#ffffff', '#9a9a9a', 2.81),
    expectRatio('Dunkelgrau `#595959` auf Weiß ergibt `7.00`', '#595959', '#ffffff', 7.0),
    expectRatio('Mittelgrau `#767676` auf Weiß ergibt `4.54`', '#767676', '#ffffff', 4.54),
    expectRatio('Kurzform `#fff` auf `#000` ergibt `21`', '#fff', '#000', 21),
  ],
};

export default module;
