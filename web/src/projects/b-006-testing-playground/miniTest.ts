import { formatValue } from '../../codeTask/assert';

// Ein Mini-Testläufer mit test/expect wie in Vitest oder Jest, aber nur mit
// toBe, toEqual und toThrow. Er läuft in der Demo und im Worker der
// Code-Aufgabe; deshalb ohne DOM und ohne Abhängigkeiten außer formatValue.
// Meldungen sind reiner Text ohne Backticks.

export interface TestOutcome {
  name: string;
  passed: boolean;
  message?: string;
}

export interface Matchers {
  /** gleich nach Object.is: gleiche Zahl, gleicher Text, dasselbe Objekt */
  toBe(expected: unknown): void;
  /** gleich nach Inhalt: Listen und einfache Objekte Stück für Stück, NaN gleich NaN */
  toEqual(expected: unknown): void;
  /** actual ist eine Funktion, die beim Aufruf wirft */
  toThrow(): void;
}

export interface TestApi {
  test(name: string, fn: () => void | Promise<void>): void;
  expect(actual: unknown): Matchers;
  /** führt alle registrierten Tests nacheinander aus, jeden für sich in try/catch */
  runAll(): Promise<TestOutcome[]>;
}

/** Fehlschlag einer Erwartung; die Meldung geht unverändert in das Ergebnis. */
class ExpectationFailure extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ExpectationFailure';
  }
}

/**
 * Tiefer Vergleich nach Inhalt. Listen und Objekte werden nicht verwechselt,
 * fehlende und zusätzliche Schlüssel zählen. Für Grundwerte gilt Object.is,
 * also ist NaN gleich NaN (wie toEqual in Vitest), 0 und -0 aber verschieden.
 * Klassen wie Date oder Map vergleicht er nur über ihre eigenen Felder; die
 * kommen in validateEvent nicht vor.
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every(
    (k) =>
      Object.prototype.hasOwnProperty.call(b, k) &&
      deepEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]),
  );
}

function mismatch(expected: unknown, actual: unknown): string {
  return `erwartet ${formatValue(expected)}, bekommen ${formatValue(actual)}`;
}

/** Lesbare Meldung auch für Würfe ohne Error, etwa throw 'kaputt'. */
function describeThrow(err: unknown): string {
  if (err instanceof Error) return err.message || err.name;
  return `Der Test hat ${formatValue(err)} geworfen.`;
}

function expectValue(actual: unknown): Matchers {
  return {
    toBe(expected) {
      if (Object.is(actual, expected)) return;
      const sameContent = typeof actual === 'object' && actual !== null && deepEqual(actual, expected);
      throw new ExpectationFailure(
        sameContent
          ? `${mismatch(expected, actual)}; der Inhalt ist gleich, aber es ist ein anderes Objekt. Für Inhalte gibt es toEqual.`
          : mismatch(expected, actual),
      );
    },
    toEqual(expected) {
      if (!deepEqual(actual, expected)) throw new ExpectationFailure(mismatch(expected, actual));
    },
    toThrow() {
      if (typeof actual !== 'function') {
        throw new ExpectationFailure(`toThrow braucht eine Funktion, bekommen ${formatValue(actual)}`);
      }
      try {
        (actual as () => unknown)();
      } catch {
        return;
      }
      throw new ExpectationFailure('erwartet, dass die Funktion wirft; sie lief ohne Fehler durch');
    },
  };
}

/**
 * Neue, leere Test-Sammlung. Jede Instanz hat ihre eigene Liste; die
 * Methoden hängen nicht an this und lassen sich einzeln weitergeben.
 */
export function createTestApi(): TestApi {
  const tests: { name: string; fn: unknown }[] = [];
  return {
    test(name, fn) {
      tests.push({ name: String(name), fn });
    },
    expect: expectValue,
    async runAll() {
      const outcomes: TestOutcome[] = [];
      // Kopie: Ein Test, der selbst test() aufruft, verlängert nicht diesen Lauf.
      for (const { name, fn } of [...tests]) {
        if (typeof fn !== 'function') {
          outcomes.push({
            name,
            passed: false,
            message: `test braucht als zweites Argument eine Funktion, bekommen ${formatValue(fn)}`,
          });
          continue;
        }
        try {
          await (fn as () => unknown)();
          outcomes.push({ name, passed: true });
        } catch (err) {
          outcomes.push({ name, passed: false, message: describeThrow(err) });
        }
      }
      return outcomes;
    },
  };
}
