import { describe, expect, it } from 'vitest';
import { runChecks } from '../../../codeTask/runChecks';
import type { CheckModule, RunResult } from '../../../codeTask/types';
import { meta } from '../content';
import checks01 from './01.checks';
import checks02 from './02.checks';
import checks03 from './03.checks';

const MODULES: Record<string, CheckModule> = {
  'C-002-code-01': checks01,
  'C-002-code-02': checks02,
  'C-002-code-03': checks03,
};

const failures = (r: RunResult) => (r.status === 'ok' ? r.results.filter((c) => !c.passed) : [r]);

describe('C-002 Code-Aufgaben', () => {
  it('es sind genau diese drei', () => {
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['C-002-code-01', 'C-002-code-02', 'C-002-code-03']);
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

// Typische Fehler: Jede Variante ist die Musterlösung mit genau einer Änderung.
describe('C-002 Prüfungen erkennen typische Fehler', () => {
  const solutionOf = (n: number) => meta.codeTasks?.[n]?.solution ?? '';
  const failed = async (module: CheckModule, code: string) => {
    const r = await runChecks(module, code);
    expect(r.status).toBe('ok');
    return r.status === 'ok' ? r.results.filter((c) => !c.passed).map((c) => c.name) : [];
  };
  const mutate = (n: number, from: string, to: string) => {
    expect(solutionOf(n), `Musterlösung enthält ${from}`).toContain(from);
    return solutionOf(n).replace(from, to);
  };

  it('parseFeed: ohne try/catch wirft kaputtes JSON', async () => {
    const code = 'function parseFeed(text) { const root = JSON.parse(text); return { ok: true, products: root.products }; }\nreturn { parseFeed };';
    const names = await failed(checks01, code);
    expect(names.some((n) => /JSON/.test(n)), names.join(' | ')).toBe(true);
  });

  it('parseFeed: der Text null wirft, wenn nur products gelesen wird', async () => {
    const names = await failed(checks01, mutate(0, 'typeof root !== \'object\' || root === null || ', ''));
    expect(names.some((n) => /null/.test(n)), names.join(' | ')).toBe(true);
  });

  it('parseFeed: kein Array-Test lässt ein Objekt als products durch', async () => {
    const names = await failed(checks01, mutate(0, '!Array.isArray(root.products)', '!root.products'));
    expect(names.some((n) => /kein Array/.test(n)), names.join(' | ')).toBe(true);
  });

  it('findDuplicateIds: jede ID mit mehr als einem Vorkommen, auch Einzelne', async () => {
    const names = await failed(checks02, mutate(1, 'count > 1', 'count > 0'));
    expect(names.some((n) => /Keine Dubletten/.test(n)), names.join(' | ')).toBe(true);
  });

  it('findDuplicateIds: dreifache ID wird je Vorkommen genannt', async () => {
    const code = [
      'function findDuplicateIds(products) {',
      '  const seen = new Set();',
      '  const result = [];',
      '  for (const p of products) {',
      '    if (seen.has(p.id)) result.push(p.id);',
      '    seen.add(p.id);',
      '  }',
      '  return result.sort();',
      '}',
      'return { findDuplicateIds };',
    ].join('\n');
    const names = await failed(checks02, code);
    expect(names.some((n) => /dreifache/.test(n)), names.join(' | ')).toBe(true);
  });

  it('findDuplicateIds: sortiert die Eingabe statt der Ergebnisse', async () => {
    const code =
      'function findDuplicateIds(products) {\n  products.sort((a, b) => a.id.localeCompare(b.id));\n  const result = [];\n  for (let i = 1; i < products.length; i++) {\n    if (products[i].id === products[i - 1].id && !result.includes(products[i].id)) result.push(products[i].id);\n  }\n  return result;\n}\nreturn { findDuplicateIds };';
    const names = await failed(checks02, code);
    expect(names.some((n) => /unverändert/.test(n)), names.join(' | ')).toBe(true);
  });

  it('checkProduct: fehlender Preis meldet zusätzlich price_format', async () => {
    const names = await failed(checks03, mutate(2, '!isMissing(price) && ', ''));
    expect(names.some((n) => /Preis fehlt/.test(n)), names.join(' | ')).toBe(true);
  });

  it('checkProduct: Preis 0 gilt als gültig', async () => {
    const names = await failed(checks03, mutate(2, "typeof price === 'number' && price > 0", "typeof price === 'number'"));
    expect(names.some((n) => /Preis `0`/.test(n)), names.join(' | ')).toBe(true);
  });

  it('checkProduct: missing_field je fehlendem Feld statt einmal', async () => {
    const code = mutate(2, "if (missing) codes.push('missing_field');", "for (const f of required) if (isMissing(product[f])) codes.push('missing_field');");
    const names = await failed(checks03, code);
    expect(names.some((n) => /nur einmal/.test(n)), names.join(' | ')).toBe(true);
  });

  it('checkProduct: availability_value fehlt', async () => {
    const names = await failed(checks03, mutate(2, "codes.push('availability_value')", 'void 0'));
    expect(names.some((n) => /Out of Stock/.test(n)), names.join(' | ')).toBe(true);
  });
});
