import { describe, expect, it } from 'vitest';
import { runChecks } from '../../../codeTask/runChecks';
import type { CheckModule, RunResult } from '../../../codeTask/types';
import { meta } from '../content';
import checks01 from './01.checks';

const MODULES: Record<string, CheckModule> = {
  'B-004-code-01': checks01,
};

const failures = (r: RunResult) => (r.status === 'ok' ? r.results.filter((c) => !c.passed) : [r]);

describe('B-004 Code-Aufgaben', () => {
  it('es ist genau diese eine', () => {
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['B-004-code-01']);
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

// Typische Fehler, die die Prüfungen erkennen sollen: Jede Variante ist die
// Musterlösung mit genau einer Änderung.
describe('B-004 Prüfungen erkennen typische Fehler', () => {
  const solution = meta.codeTasks?.[0]?.solution ?? '';
  const mutate = (from: string, to: string) => {
    expect(solution, `Musterlösung enthält ${from}`).toContain(from);
    return solution.replace(from, to);
  };
  const failedNames = async (code: string) => {
    const r = await runChecks(checks01, code);
    expect(r.status).toBe('ok');
    return r.status === 'ok' ? r.results.filter((c) => !c.passed).map((c) => c.name) : [];
  };
  const fails = async (code: string, name: RegExp) => {
    const failed = await failedNames(code);
    expect(failed.some((n) => name.test(n)), failed.join(' | ')).toBe(true);
  };

  it('ohne Toleranz: exakter Vergleich der Summe', async () => {
    await fails(mutate('> 0.01', '!== 0'), /Toleranz/);
  });

  it('Eventname-Regel zu lasch: Bindestrich erlaubt', async () => {
    await fails(mutate('/^[A-Za-z]\\w*$/', '/^[A-Za-z][\\w-]*$/'), /Bindestrich/);
  });

  it('transaction_id auch außerhalb von purchase verlangt', async () => {
    await fails(mutate("event.event === 'purchase' && ", ''), /add_to_cart/);
  });

  it('currency_missing nie gemeldet', async () => {
    await fails(mutate('ecommerce.value !== undefined && !ecommerce.currency', 'false'), /Währung/);
  });

  it('price nicht geprüft', async () => {
    await fails(mutate("typeof item.price !== 'number'", 'false'), /Preis als Text/);
  });

  it('Summe trotz Preis als Text: nur Zahlen summiert, ohne Schutz', async () => {
    const code = mutate('allPricesNumbers && ', '').replace(
      'sum += item.price * quantity;',
      "if (typeof item.price === 'number') sum += item.price * quantity;",
    );
    await fails(code, /Preis als Text/);
  });

  it('currency_missing schon, wenn nur currency fehlt', async () => {
    await fails(mutate('ecommerce.value !== undefined && !ecommerce.currency', '!ecommerce.currency'), /ohne `value` und `currency`/);
  });

  it('fehlende quantity nicht als 1 gezählt: price * quantity wird NaN', async () => {
    const failed = await failedNames(mutate('const quantity = item.quantity ?? 1;', 'const quantity = item.quantity;'));
    expect(failed.some((n) => /ohne `quantity`/.test(n)), failed.join(' | ')).toBe(true);
  });

  it('value_mismatch fehlt ganz', async () => {
    await fails(mutate("code: 'value_mismatch'", "code: 'value_wrong'"), /Summe/);
  });

  it('Codes als Texte statt Objekte', async () => {
    await fails(mutate("issues.push({ path: 'event', code: 'name_format'", "issues.push('name_format'); ({ path: 'event', code: 'name_format'"), /Bindestrich/);
  });

  it('kein Array zurückgegeben', async () => {
    await fails(mutate('return issues;', 'return issues.length;'), /gültige Kauf/);
  });

  it('validateEvent fehlt als Funktion', async () => {
    await fails('const validateEvent = 1;\nreturn { validateEvent };', /gültige Kauf/);
  });
});
