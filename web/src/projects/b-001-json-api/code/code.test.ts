import { describe, expect, it } from 'vitest';
import { runChecks } from '../../../codeTask/runChecks';
import type { CheckModule, RunResult } from '../../../codeTask/types';
import { meta } from '../content';
import checks01 from './01.checks';
import checks02 from './02.checks';
import checks03 from './03.checks';

const MODULES: Record<string, CheckModule> = {
  'B-001-code-01': checks01,
  'B-001-code-02': checks02,
  'B-001-code-03': checks03,
};

const failures = (r: RunResult) => (r.status === 'ok' ? r.results.filter((c) => !c.passed) : [r]);

describe('B-001 Code-Aufgaben', () => {
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
describe('B-001 Prüfungen erkennen typische Fehler', () => {
  const fails = async (module: CheckModule, code: string, name: RegExp) => {
    const r = await runChecks(module, code);
    expect(r.status).toBe('ok');
    const failed = r.status === 'ok' ? r.results.filter((c) => !c.passed).map((c) => c.name) : [];
    expect(failed.some((n) => name.test(n)), failed.join(' | ')).toBe(true);
  };

  it('Aufgabe 1: ohne Prüfung von res.ok fehlt der Fehler bei 404', async () => {
    await fails(
      checks01,
      'async function loadProducts(url) { const res = await fetch(url); return res.json(); }\nreturn { loadProducts };',
      /404/,
    );
  });

  it('Aufgabe 1: zweimal fetch fällt auf', async () => {
    await fails(
      checks01,
      'async function loadProducts(url) { await fetch(url); const res = await fetch(url); if (!res.ok) throw new Error("HTTP " + res.status); return res.json(); }\nreturn { loadProducts };',
      /genau einmal/,
    );
  });

  it('Aufgabe 2: sort auf der Eingabe verändert sie', async () => {
    await fails(
      checks02,
      'function cheapInStock(products, maxPrice) { return products.sort((a, b) => a.price - b.price).filter((p) => p.inStock && p.price <= maxPrice); }\nreturn { cheapInStock };',
      /unverändert/,
    );
  });

  it('Aufgabe 2: < statt <= verliert die Grenze', async () => {
    await fails(
      checks02,
      'function cheapInStock(products, maxPrice) { return products.filter((p) => p.inStock && p.price < maxPrice).sort((a, b) => a.price - b.price); }\nreturn { cheapInStock };',
      /Grenze/,
    );
  });

  it('Aufgabe 3: erst json(), dann ok prüfen meldet beim 404 JSON statt Status', async () => {
    await fails(
      checks03,
      [
        'async function loadSafely(url) {',
        '  try {',
        '    const res = await fetch(url);',
        '    const data = await res.json();',
        "    if (!res.ok) return { ok: false, error: 'HTTP ' + res.status };",
        '    return { ok: true, data };',
        '  } catch (e) {',
        "    return { ok: false, error: 'Kein JSON oder kein Netzwerk' };",
        '  }',
        '}',
        'return { loadSafely };',
      ].join('\n'),
      /404/,
    );
  });

  it('Aufgabe 3: eine Ausnahme statt Rückgabe fällt auf', async () => {
    await fails(
      checks03,
      'async function loadSafely(url) { const res = await fetch(url); return { ok: true, data: await res.json() }; }\nreturn { loadSafely };',
      /Netzwerk/,
    );
  });
});
