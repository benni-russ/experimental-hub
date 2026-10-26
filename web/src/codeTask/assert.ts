const MAX_LENGTH = 200;

/** Fehlschlag einer Prüfung; die Meldung geht unverändert an den Nutzer. */
export class CheckFailure extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CheckFailure';
  }
}

/** JSON-ähnliche Darstellung für Meldungen, höchstens 200 Zeichen. */
export function formatValue(value: unknown): string {
  let text: string;
  if (value === undefined) text = 'undefined';
  else if (typeof value === 'function') text = '[Funktion]';
  else if (value instanceof Error) text = `${value.name}: ${value.message}`;
  else if (typeof value === 'bigint') text = `${value}n`;
  else if (typeof value === 'symbol') text = value.toString();
  else {
    try {
      // Funktionen und undefined in Objekten sollen nicht stillschweigend verschwinden.
      text =
        JSON.stringify(value, (_k, v) => {
          if (v === undefined) return 'undefined';
          if (typeof v === 'function') return '[Funktion]';
          if (typeof v === 'bigint') return `${v}n`;
          return v;
        }) ?? String(value);
    } catch {
      text = String(value);
    }
  }
  return text.length > MAX_LENGTH ? `${text.slice(0, MAX_LENGTH - 1)}…` : text;
}

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

/** Wirft CheckFailure („erwartet …, bekommen …“), wenn die Werte nicht tief gleich sind. */
export function expectEqual(actual: unknown, expected: unknown, what?: string): void {
  if (deepEqual(actual, expected)) return;
  const prefix = what ? `${what}: ` : '';
  throw new CheckFailure(`${prefix}erwartet ${formatValue(expected)}, bekommen ${formatValue(actual)}`);
}
