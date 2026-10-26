import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { Check, CheckModule } from '../../../codeTask/types';

type Signals = Record<string, number>;
type ScoreProduct = (signals: Signals, weights: Signals) => unknown;

const TOLERANCE = 1e-9;

/** Ruft `scoreProduct` auf, vergleicht mit Toleranz und prüft, dass die Eingaben unverändert bleiben. */
function expectScore(name: string, signals: Signals, weights: Signals, expected: number): Check {
  return {
    name,
    run({ exports }) {
      const fn = exports.scoreProduct;
      if (typeof fn !== 'function') {
        throw new CheckFailure(`\`scoreProduct\` soll eine Funktion sein, ist aber ${formatValue(fn)}.`);
      }
      const before = structuredClone({ signals, weights });
      const result = (fn as ScoreProduct)(signals, weights);
      if (typeof result !== 'number' || Number.isNaN(result) || Math.abs(result - expected) > TOLERANCE) {
        throw new CheckFailure(`Punkte: erwartet ${expected}, bekommen ${formatValue(result)}`);
      }
      expectEqual({ signals, weights }, before, 'Eingaben nach dem Aufruf');
    },
  };
}

const module: CheckModule = {
  exportsNeeded: ['scoreProduct'],
  checks: [
    // Das Beispiel aus „Unter der Haube“: 0,6 · 0,33 + 0,2 · 0,95 + 0,2 · 0,40 = 0,468
    expectScore(
      'Das Beispiel aus „Unter der Haube“ ergibt `0.468`',
      { affinity: 0.33, popularity: 0.95, similarity: 0.4 },
      { affinity: 0.6, popularity: 0.2, similarity: 0.2 },
      0.468,
    ),
    expectScore('Nullgewichte ergeben `0`', { affinity: 0.7, popularity: 0.4, similarity: 1 }, { affinity: 0, popularity: 0, similarity: 0 }, 0),
    expectScore(
      'Nur die Beliebtheit gewichtet: ihr Signal ist das Ergebnis',
      { affinity: 0.9, popularity: 0.25, similarity: 0.5 },
      { affinity: 0, popularity: 1, similarity: 0 },
      0.25,
    ),
    expectScore(
      'Ein Signal fehlt: es zählt als `0`',
      { affinity: 0.5, popularity: 0.5 },
      { affinity: 0.5, popularity: 0.5, similarity: 0.5 },
      0.5,
    ),
    expectScore('Alle Signale fehlen: `0`', {}, { affinity: 1, popularity: 1, similarity: 1 }, 0),
    expectScore(
      'Gleiche Gewichte: Mittelwert der Signale',
      { affinity: 0.3, popularity: 0.6, similarity: 0.9 },
      { affinity: 1 / 3, popularity: 1 / 3, similarity: 1 / 3 },
      0.6,
    ),
  ],
};

export default module;
