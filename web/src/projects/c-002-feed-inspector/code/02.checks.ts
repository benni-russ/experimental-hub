import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { Check, CheckModule } from '../../../codeTask/types';

type FindDuplicateIds = (products: unknown) => unknown;

const entries = (...ids: string[]) => ids.map((id) => ({ id, title: `Titel ${id}` }));

/** Prüft die Rückgabe gegen die erwartete, sortierte Liste und dass die Eingabe unverändert bleibt. */
function expectDuplicates(name: string, ids: string[], expected: string[]): Check {
  return {
    name,
    run({ exports }) {
      const fn = exports.findDuplicateIds;
      if (typeof fn !== 'function') {
        throw new CheckFailure(`\`findDuplicateIds\` soll eine Funktion sein, ist aber ${formatValue(fn)}.`);
      }
      const input = entries(...ids);
      const before = structuredClone(input);
      const result = (fn as FindDuplicateIds)(input);
      expectEqual(result, expected, 'doppelte IDs');
      expectEqual(input, before, 'Eingabe nach dem Aufruf');
    },
  };
}

const module: CheckModule = {
  exportsNeeded: ['findDuplicateIds'],
  checks: [
    expectDuplicates('Keine Dubletten ergibt `[]`', ['A', 'B', 'C'], []),
    expectDuplicates('Eine doppelte ID wird einmal genannt', ['A', 'B', 'A'], ['A']),
    expectDuplicates('Eine dreifache ID wird trotzdem nur einmal genannt', ['A', 'B', 'B', 'B'], ['B']),
    expectDuplicates('Mehrere Dubletten kommen sortiert zurück', ['D', 'B', 'D', 'A', 'B', 'C'], ['B', 'D']),
    expectDuplicates('Eine leere Liste ergibt `[]`', [], []),
    expectDuplicates('Die Eingabe bleibt unverändert, auch ihre Reihenfolge', ['C', 'A', 'C', 'B'], ['C']),
  ],
};

export default module;
