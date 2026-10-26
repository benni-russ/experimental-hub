import { describe, expect, it } from 'vitest';
import { runChecks } from '../../../codeTask/runChecks';
import type { CheckModule, RunResult } from '../../../codeTask/types';
import { meta } from '../content';
import checks01 from './01.checks';
import checks02 from './02.checks';

const MODULES: Record<string, CheckModule> = {
  'B-003-code-01': checks01,
  'B-003-code-02': checks02,
};

const failures = (r: RunResult) => (r.status === 'ok' ? r.results.filter((c) => !c.passed) : [r]);

describe('B-003 Code-Aufgaben', () => {
  it('es sind genau diese zwei', () => {
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['B-003-code-01', 'B-003-code-02']);
  });

  for (const task of meta.codeTasks ?? []) {
    const module = MODULES[task.id]!;

    it(`${task.id}: die Musterlösung besteht alle Prüfungen`, async () => {
      const r = await runChecks(module, task.solution);
      expect(r.status).toBe('ok');
      expect(failures(r)).toEqual([]);
    });

    it(`${task.id}: die Vorlage scheitert an mindestens einer Prüfung`, async () => {
      const r = await runChecks(module, task.starter);
      expect(r.status === 'ok' && r.results.some((c) => !c.passed)).toBe(true);
    });
  }
});

// Typische Fehler, die die Prüfungen erkennen sollen.
describe('B-003 Prüfungen erkennen typische Fehler', () => {
  const failedNames = async (module: CheckModule, code: string) => {
    const r = await runChecks(module, code);
    expect(r.status).toBe('ok');
    return r.status === 'ok' ? r.results.filter((c) => !c.passed).map((c) => c.name) : [];
  };
  const fails = async (module: CheckModule, code: string, name: RegExp) => {
    const failed = await failedNames(module, code);
    expect(failed.some((n) => name.test(n)), failed.join(' | ')).toBe(true);
  };
  const order = (list: string[]) => `const order = ${JSON.stringify(list)};\nreturn { order };`;

  it('Aufgabe 1: Leserichtung statt Event Loop', async () => {
    await fails(checks01, order(['Start', 'Timer', 'then', 'vor await', 'nach await', 'Ende']), /synchrone/);
  });

  it('Aufgabe 1: Timer vor den Microtasks', async () => {
    const code = order(['Start', 'vor await', 'Ende', 'Timer', 'then', 'nach await']);
    const failed = await failedNames(checks01, code);
    expect(failed.some((n) => /ganze Reihenfolge/.test(n))).toBe(true);
    // der synchrone Teil stimmt, die Meldung soll also nur die Reihenfolge danach betreffen
    expect(failed.some((n) => /synchrone/.test(n))).toBe(false);
  });

  it('Aufgabe 1: nach await vor then', async () => {
    await fails(checks01, order(['Start', 'vor await', 'Ende', 'nach await', 'then', 'Timer']), /ganze Reihenfolge/);
  });

  it('Aufgabe 1: eine Ausgabe fehlt, eine doppelt', async () => {
    await fails(checks01, order(['Start', 'vor await', 'Ende', 'then', 'then', 'Timer']), /genau einmal/);
  });

  it('Aufgabe 1: kein Array', async () => {
    await fails(checks01, "const order = 'Start, vor await';\nreturn { order };", /genau einmal/);
  });

  const run = (...body: string[]) => ['function run() {', ...body.map((l) => `  ${l}`), '}', '', 'return { run };'].join('\n');

  it('Aufgabe 2: alles synchron, die Hüllen gelöscht', async () => {
    await fails(checks02, run("console.log('A');", "console.log('B');", "console.log('C');"), /Vorlage/);
  });

  it('Aufgabe 2: Vorlage stehen lassen und drei neue Zeilen dazu', async () => {
    const code = run(
      "console.log('A');",
      "console.log('B');",
      "console.log('C');",
      'if (false) {',
      "  Promise.resolve().then(() => { console.log('A'); });",
      "  console.log('B');",
      "  setTimeout(() => { console.log('C'); }, 0);",
      '}',
    );
    await fails(checks02, code, /Vorlage/);
  });

  it('Aufgabe 2: B als zweiter Timer kommt nach C', async () => {
    const code = run(
      "Promise.resolve().then(() => { console.log('A'); });",
      "setTimeout(() => { console.log('C'); }, 0);",
      "setTimeout(() => { console.log('B'); }, 0);",
    );
    await fails(checks02, code, /in dieser Reihenfolge/);
  });

  it('Aufgabe 2: run() zusätzlich selbst aufgerufen', async () => {
    const solution = meta.codeTasks?.find((t) => t.id === 'B-003-code-02')?.solution ?? '';
    await fails(checks02, solution.replace('return { run };', 'run();\nreturn { run };'), /in dieser Reihenfolge/);
  });

  it('Aufgabe 2: run fehlt als Funktion', async () => {
    await fails(checks02, 'const run = 1;\nreturn { run };', /in dieser Reihenfolge/);
  });
});
