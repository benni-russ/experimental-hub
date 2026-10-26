import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { Check, CheckModule } from '../../../codeTask/types';

type CheckHeadingOrder = (levels: number[]) => unknown;

interface Jump {
  index: number;
  from: number;
  to: number;
}

/** Ruft `checkHeadingOrder` auf, vergleicht die Sprünge und prüft, dass die Eingabe unverändert bleibt. */
function expectJumps(name: string, levels: number[], expected: Jump[]): Check {
  return {
    name,
    run({ exports }) {
      const fn = exports.checkHeadingOrder;
      if (typeof fn !== 'function') {
        throw new CheckFailure(`\`checkHeadingOrder\` soll eine Funktion sein, ist aber ${formatValue(fn)}.`);
      }
      const before = structuredClone(levels);
      const result = (fn as CheckHeadingOrder)(levels);
      expectEqual(result, expected, `Sprünge für ${formatValue(levels)}`);
      expectEqual(levels, before, 'Eingabe nach dem Aufruf');
    },
  };
}

const module: CheckModule = {
  exportsNeeded: ['checkHeadingOrder'],
  checks: [
    expectJumps('Lückenlose Gliederung: keine Sprünge', [1, 2, 3, 2, 3], []),
    expectJumps('Von 1 direkt auf 4: ein Sprung an Position `1`', [1, 4], [{ index: 1, from: 1, to: 4 }]),
    expectJumps('Das Beispiel aus der Aufgabe', [1, 2, 4], [{ index: 2, from: 2, to: 4 }]),
    expectJumps('Mehrere Sprünge in einer Liste', [1, 3, 4, 6, 2, 4], [
      { index: 1, from: 1, to: 3 },
      { index: 3, from: 4, to: 6 },
      { index: 5, from: 2, to: 4 },
    ]),
    expectJumps('Nach oben springen ist erlaubt', [1, 2, 3, 4, 1, 2], []),
    expectJumps('Der erste Eintrag zählt nie als Sprung', [3, 4], []),
    expectJumps('Leere Liste: keine Sprünge', [], []),
  ],
};

export default module;
