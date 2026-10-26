import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { Check, CheckModule } from '../../../codeTask/types';

type ClsFromShifts = (shifts: Shift[]) => unknown;

interface Shift {
  time: number;
  value: number;
}

/** Summen wie 0.05 + 0.12 sind nicht exakt 0.17; geprüft wird auf drei Stellen. */
const TOLERANCE = 0.0005;

/** Ruft `clsFromShifts` auf, vergleicht mit Toleranz und prüft, dass die Eingabe unverändert bleibt. */
function expectCls(name: string, shifts: Shift[], expected: number): Check {
  return {
    name,
    run({ exports }) {
      const fn = exports.clsFromShifts;
      if (typeof fn !== 'function') {
        throw new CheckFailure(`\`clsFromShifts\` soll eine Funktion sein, ist aber ${formatValue(fn)}.`);
      }
      const before = structuredClone(shifts);
      const result = (fn as ClsFromShifts)(shifts);
      if (typeof result !== 'number' || Number.isNaN(result) || Math.abs(result - expected) > TOLERANCE) {
        throw new CheckFailure(`CLS für ${formatValue(shifts)}: erwartet ${expected}, bekommen ${formatValue(result)}`);
      }
      expectEqual(shifts, before, 'Eingabe nach dem Aufruf');
    },
  };
}

const s = (time: number, value: number): Shift => ({ time, value });

// Erwartete Werte in code.test.ts gegen clsFromShifts aus dem Kern geprüft.
const module: CheckModule = {
  exportsNeeded: ['clsFromShifts'],
  checks: [
    expectCls('Keine Verschiebung ergibt `0`', [], 0),
    expectCls('Ein Fenster: `0.05 + 0.12`', [s(0.818, 0.05), s(1.338, 0.12)], 0.17),
    expectCls('Eine Lücke von genau `1` s trennt', [s(1, 0.1), s(2, 0.2)], 0.2),
    expectCls('Ein Fenster darf höchstens `5` s lang werden', [0, 0.9, 1.8, 2.7, 3.6, 4.5, 5.4].map((t) => s(t, 0.1)), 0.6),
    expectCls('Das größte Fenster gewinnt, nicht das erste', [s(0.818, 0.05), s(1.338, 0.12), s(4.53, 0.15), s(4.9, 0.1)], 0.25),
    expectCls('Unsortierte Eingabe', [s(1.338, 0.12), s(4.53, 0.15), s(0.818, 0.05)], 0.17),
    expectCls('Drei Verschiebungen nah beieinander', [s(0.818, 0.05), s(1.17, 0.15), s(1.338, 0.12)], 0.32),
  ],
};

export default module;
