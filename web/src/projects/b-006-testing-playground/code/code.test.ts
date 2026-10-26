import { describe, expect, it } from 'vitest';
import { runChecks } from '../../../codeTask/runChecks';
import type { CheckModule, RunResult } from '../../../codeTask/types';
import { meta } from '../content';
import checks01 from './01.checks';

const MODULES: Record<string, CheckModule> = {
  'B-006-code-01': checks01,
};

const failures = (r: RunResult) => (r.status === 'ok' ? r.results.filter((c) => !c.passed) : [r]);

describe('B-006 Code-Aufgaben', () => {
  it('es ist genau diese eine', () => {
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['B-006-code-01']);
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

  it('Prüfungen: drei Tests, Original, dann je Variante eine', () => {
    expect(checks01.exportsNeeded).toEqual([]);
    expect(checks01.checks.map((c) => c.name)).toEqual([
      'Mindestens drei Tests sind registriert',
      'Gegen die richtige `validateEvent` bestehen alle Tests',
      'Die Variante „Toleranz vergessen“ wird erwischt',
      'Die Variante „Menge ignoriert“ wird erwischt',
      'Die Variante „Namensregel zu lasch“ wird erwischt',
      'Die Variante „`transaction_id` nicht geprüft“ wird erwischt',
    ]);
  });
});

// Typische Fehler, die die Prüfungen erkennen sollen: Jede Variante ist die
// Musterlösung mit genau einer Änderung.
describe('B-006 Prüfungen erkennen typische Fehler', () => {
  const task = meta.codeTasks?.[0];
  const solution = task?.solution ?? '';
  const mutate = (from: string, to: string) => {
    expect(solution, `Musterlösung enthält ${from}`).toContain(from);
    return solution.replace(from, to);
  };
  const run = async (code: string) => {
    const r = await runChecks(checks01, code);
    expect(r.status).toBe('ok');
    return r.status === 'ok' ? r.results : [];
  };
  const failedNames = async (code: string) => (await run(code)).filter((c) => !c.passed).map((c) => c.name);
  const fails = async (code: string, name: RegExp) => {
    const failed = await failedNames(code);
    expect(failed.some((n) => name.test(n)), failed.join(' | ')).toBe(true);
    return failed;
  };
  const messageOf = async (code: string, name: RegExp) => (await run(code)).find((c) => name.test(c.name))?.message;

  it('die Vorlage: zu wenige Tests, und keine Variante wird erwischt', async () => {
    const failed = await failedNames(task?.starter ?? '');
    expect(failed).toEqual([
      'Mindestens drei Tests sind registriert',
      'Die Variante „Toleranz vergessen“ wird erwischt',
      'Die Variante „Menge ignoriert“ wird erwischt',
      'Die Variante „Namensregel zu lasch“ wird erwischt',
      'Die Variante „`transaction_id` nicht geprüft“ wird erwischt',
    ]);
    expect(await messageOf(task?.starter ?? '', /Toleranz/)).toContain('Dein Test besteht auch gegen diese Variante');
  });

  it('ohne den Test zur Cent-Abweichung bleibt die fehlende Toleranz unentdeckt', async () => {
    const failed = await fails(mutate('value: 35 }', 'value: 34.99 }'), /Toleranz/);
    expect(failed).toEqual(['Die Variante „Toleranz vergessen“ wird erwischt']);
  });

  it('ein Test ohne Erwartung erwischt nichts', async () => {
    const failed = await fails(mutate("  expect(codes).toEqual(['transaction_id_missing']);\n", ''), /`transaction_id`/);
    expect(failed).toEqual(['Die Variante „`transaction_id` nicht geprüft“ wird erwischt']);
  });

  it('ein Test, der schon am Original scheitert, zählt nicht als erwischt', async () => {
    // toBe vergleicht Listen nach Identität; [] ist nie dieselbe Liste.
    const code = mutate('expect(validateEvent(VALID_PURCHASE)).toEqual([]);', 'expect(validateEvent(VALID_PURCHASE)).toBe([]);');
    await fails(code, /richtige/);
    expect(await messageOf(code, /richtige/)).toContain('„Ein gültiger Kauf hat keine Issues“ scheitert');
    // Nur dieser rote Test scheitert an jeder Variante; das darf nicht als Treffer zählen.
    const onlyRed = [
      "test('a', () => expect(1).toBe(1));",
      "test('b', () => expect(2).toBe(2));",
      "test('rot', () => expect(validateEvent(VALID_PURCHASE)).toBe([]));",
      '',
    ].join('\n');
    for (const name of [/Toleranz/, /Menge ignoriert/, /Namensregel/, /`transaction_id`/]) {
      expect(await messageOf(onlyRed, name)).toContain('scheitern schon gegen die richtige');
    }
  });

  it('ein Eventname ohne Fehler: der Test scheitert am Original', async () => {
    await fails(mutate("event: 'pur-chase'", "event: 'purchase_2'"), /richtige/);
  });

  it('weniger als drei Tests', async () => {
    const code = "test('a', () => expect(1).toBe(1));\ntest('b', () => expect(2).toBe(2));\n";
    await fails(code, /drei Tests/);
    expect(await messageOf(code, /drei Tests/)).toBe('Erst 2 Tests registriert; es sollen mindestens drei sein.');
  });

  it('ohne Tests scheitern alle Prüfungen lesbar', async () => {
    const results = await run('// nichts\n');
    expect(results.every((c) => !c.passed)).toBe(true);
    expect(results[1]?.message).toContain('Noch kein Test');
  });

  it('ein Fehler beim Aufbau ergibt eine Fehlermeldung statt Ergebnissen', async () => {
    const r = await runChecks(checks01, 'test("a", () => {});\nthrow new Error("kaputt");\n');
    expect(r.status).toBe('error');
  });

  it('asynchrone Tests werden abgewartet', async () => {
    const code = mutate(
      "test('Ein Cent Abweichung ist erlaubt', () => {",
      "test('Ein Cent Abweichung ist erlaubt', async () => {\n  await Promise.resolve();",
    );
    expect(await failedNames(code)).toEqual([]);
  });

  it('VALID_PURCHASE ist je Lauf frisch, Änderungen bleiben nicht hängen', async () => {
    const code = `${solution}\nVALID_PURCHASE.ecommerce.value = 1;\n`;
    // Die Änderung kommt nach dem Registrieren, aber vor dem Ausführen der Tests:
    // Der erste Test sieht sie und scheitert, die übrigen bauen eigene Events.
    expect(await failedNames(code)).toContain('Gegen die richtige `validateEvent` bestehen alle Tests');
    // Danach ist die Vorlage für den nächsten Lauf wieder heil.
    expect(await failedNames(solution)).toEqual([]);
  });

  it('test und expect sind je Lauf frisch: Tests sammeln sich nicht an', async () => {
    // Jede Prüfung führt den Code neu aus; mit einer geteilten Liste stünden hier 2 und mehr.
    const code = "test('x', () => expect(1).toBe(1));\n";
    expect(await messageOf(code, /drei Tests/)).toBe('Erst 1 Test registriert; es sollen mindestens drei sein.');
  });
});
