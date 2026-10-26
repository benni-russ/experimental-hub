import { CheckFailure, formatValue } from './assert';
import { blockedGlobals } from './network';
import { findSyntaxErrorLine } from './syntaxLine';
import type { CheckModule, CheckResult, RunOutput, RunResult } from './types';

const SOURCE_URL = 'aufgabe.js';

/** Zeilennummer aus dem Stack eines Fehlers, der in `aufgabe.js` entstand. */
function stackLine(err: unknown): number | null {
  const stack = err instanceof Error ? err.stack : undefined;
  const match = stack?.match(/aufgabe\.js:(\d+):\d+/);
  return match ? Number(match[1]) : null;
}

/**
 * Versatz, den `new Function` dem Rumpf voranstellt (Kopfzeilen). Statt ihn
 * festzuschreiben, wird er einmal an einem Probe-Fehler in Zeile 1 gemessen.
 */
let headerOffset: number | null = null;
function getHeaderOffset(): number {
  if (headerOffset === null) {
    try {
      new Function(`throw new Error('x')\n//# sourceURL=${SOURCE_URL}`)();
    } catch (err) {
      headerOffset = (stackLine(err) ?? 3) - 1;
    }
  }
  return headerOffset ?? 2;
}

/** Zeile im Editor, in der ein Fehler aus dem Nutzercode entstand, sonst undefined. */
function userLine(err: unknown): number | undefined {
  const raw = stackLine(err);
  const line = raw === null ? null : raw - getHeaderOffset();
  return line !== null && line >= 1 ? line : undefined;
}

/**
 * Ergebnis für einen Fehler, der erst nach dem ersten Lauf auftritt, etwa in
 * einem Timer-Callback oder einer nicht abgefangenen Promise des Nutzercodes.
 */
export function userErrorResult(err: unknown): RunResult {
  const message = err instanceof Error ? err.message : String(err);
  const line = userLine(err);
  return line === undefined ? { status: 'error', message } : { status: 'error', message, line };
}

function formatLog(args: unknown[]): string {
  return args.map((a) => (typeof a === 'object' && a !== null ? formatValue(a) : String(a))).join(' ');
}

class BuildError extends Error {
  constructor(
    message: string,
    readonly line?: number,
  ) {
    super(message);
  }
}

/** Führt den Nutzercode (Funktionsrumpf) einmal aus und liefert exports + logs. */
function execute(code: string, globals: Record<string, unknown>): RunOutput {
  const logs: string[] = [];
  const consoleStub = { log: (...args: unknown[]) => void logs.push(formatLog(args)) };
  const names = Object.keys(globals);
  let fn: (...args: unknown[]) => unknown;
  try {
    fn = new Function('console', ...names, `${code}\n//# sourceURL=${SOURCE_URL}`) as typeof fn;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const line = err instanceof SyntaxError ? findSyntaxErrorLine(code) : null;
    throw new BuildError(`Syntaxfehler: ${message}`, line ?? undefined);
  }
  let result: unknown;
  try {
    result = fn(consoleStub, ...names.map((n) => globals[n]));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new BuildError(message, userLine(err));
  }
  const exports =
    typeof result === 'object' && result !== null ? (result as Record<string, unknown>) : {};
  return { exports, logs };
}

export async function runChecks(module: CheckModule, code: string): Promise<RunResult> {
  // Globals frisch je Aufruf, damit Nutzercode sie nicht für spätere Läufe zerstört.
  // Netzsperre zuerst, damit Fakes des Moduls (z. B. ein eigenes `fetch`) gewinnen.
  const baseGlobals = { ...blockedGlobals(), ...module.globals?.() };
  let output: RunOutput;
  try {
    output = execute(code, baseGlobals);
  } catch (err) {
    if (err instanceof BuildError) {
      return err.line === undefined
        ? { status: 'error', message: err.message }
        : { status: 'error', message: err.message, line: err.line };
    }
    return { status: 'error', message: err instanceof Error ? err.message : String(err) };
  }

  const missing = module.exportsNeeded.find((name) => !Object.prototype.hasOwnProperty.call(output.exports, name));
  if (missing !== undefined) {
    const message = `\`${missing}\` fehlt im \`return { … }\` am Ende.`;
    return {
      status: 'ok',
      results: module.checks.map((c) => ({ name: c.name, passed: false, message })),
    };
  }

  const ctx = {
    ...output,
    async rerun(extra: Record<string, unknown>): Promise<RunOutput> {
      // Frische Fakes: sonst sähe der zweite Lauf, was der erste an ihnen verändert hat.
      return execute(code, { ...blockedGlobals(), ...module.globals?.(), ...extra });
    },
  };
  const results: CheckResult[] = [];
  for (const check of module.checks) {
    try {
      await check.run(ctx);
      results.push({ name: check.name, passed: true });
    } catch (err) {
      const message =
        err instanceof CheckFailure
          ? err.message
          : `Fehler: ${err instanceof Error ? err.message : String(err)}`;
      results.push({ name: check.name, passed: false, message });
    }
  }
  return { status: 'ok', results };
}
