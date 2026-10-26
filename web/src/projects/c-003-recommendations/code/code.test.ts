import { describe, expect, it } from 'vitest';
import { runChecks } from '../../../codeTask/runChecks';
import type { CheckModule, RunResult } from '../../../codeTask/types';
import { categoryAffinity } from '../../../personalization/affinity';
import { CATALOG } from '../../../personalization/catalog';
import { NOW, VISITORS } from '../../../personalization/visitors';
import { meta } from '../content';
import checks01 from './01.checks';
import checks02 from './02.checks';
import checks03 from './03.checks';

const MODULES: Record<string, CheckModule> = {
  'C-003-code-01': checks01,
  'C-003-code-02': checks02,
  'C-003-code-03': checks03,
};

const failures = (r: RunResult) => (r.status === 'ok' ? r.results.filter((c) => !c.passed) : [r]);

describe('C-003 Code-Aufgaben', () => {
  it('es sind genau diese drei', () => {
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['C-003-code-01', 'C-003-code-02', 'C-003-code-03']);
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

// Die Musterlösung von Aufgabe 3 rechnet wie die App: gleiche Profile für alle Besucher.
describe('C-003 Musterlösung Aufgabe 3 gegen categoryAffinity', () => {
  it('liefert für jeden Besucher dasselbe Profil wie die App-Logik', () => {
    const solution = meta.codeTasks?.[2]?.solution ?? '';
    const factory = new Function(solution) as () => { categoryAffinity: (e: unknown, now: string) => Record<string, number> };
    const mine = factory().categoryAffinity;
    for (const visitor of VISITORS) {
      // Kategorie aus dem Katalog einsetzen: die Aufgabe trägt sie direkt am Ereignis.
      const events = visitor.events.map((e) => ({
        type: e.type,
        category: CATALOG.find((p) => p.id === e.productId)!.category,
        at: e.at,
      }));
      const expected = categoryAffinity(visitor.events, NOW, CATALOG).profile;
      const actual = mine(events, NOW);
      expect(Object.keys(actual).sort(), visitor.name).toEqual(Object.keys(expected).sort());
      for (const [category, value] of Object.entries(expected)) {
        expect(Math.abs((actual[category] ?? NaN) - value), `${visitor.name} ${category}`).toBeLessThan(1e-9);
      }
    }
  });
});

// Typische Fehler: Jede Variante ist die Musterlösung mit genau einer Änderung.
describe('C-003 Prüfungen erkennen typische Fehler', () => {
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

  it('scoreProduct: fehlendes Signal ergibt NaN statt 0', async () => {
    const names = await failed(checks01, mutate(0, '(signals.similarity ?? 0)', 'signals.similarity'));
    expect(names.some((n) => /fehlt/.test(n)), names.join(' | ')).toBe(true);
  });

  it('scoreProduct: nur die Gewichte werden addiert', async () => {
    const code = 'function scoreProduct(signals, weights) { return weights.affinity + weights.popularity + weights.similarity; }\nreturn { scoreProduct };';
    const names = await failed(checks01, code);
    expect(names.length).toBeGreaterThan(0);
  });

  it('rankProducts: ausverkauft wird nicht gefiltert', async () => {
    const names = await failed(checks02, mutate(1, "p.availability !== 'out_of_stock'", 'true'));
    expect(names.some((n) => /ausverkauft/i.test(n)), names.join(' | ')).toBe(true);
  });

  it('rankProducts: Gekauftes wird nicht gefiltert', async () => {
    const names = await failed(checks02, mutate(1, '!bought.has(p.id)', 'true'));
    expect(names.some((n) => /gekauft/i.test(n)), names.join(' | ')).toBe(true);
  });

  it('rankProducts: Gleichstand ohne id-Reihenfolge', async () => {
    const names = await failed(checks02, mutate(1, ' || a.id.localeCompare(b.id)', ''));
    expect(names.some((n) => /Gleichstand/.test(n)), names.join(' | ')).toBe(true);
  });

  it('rankProducts: sortiert die Eingabe statt einer Kopie', async () => {
    const code = [
      'function rankProducts(products, purchasedIds, scores, n) {',
      '  products.sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0) || a.id.localeCompare(b.id));',
      "  return products.filter((p) => p.availability !== 'out_of_stock' && !purchasedIds.includes(p.id)).slice(0, n).map((p) => p.id);",
      '}',
      'return { rankProducts };',
    ].join('\n');
    const names = await failed(checks02, code);
    expect(names.some((n) => /unverändert/.test(n)), names.join(' | ')).toBe(true);
  });

  it('rankProducts: kürzt vor dem Filtern', async () => {
    const code = [
      'function rankProducts(products, purchasedIds, scores, n) {',
      '  return [...products]',
      '    .sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0) || a.id.localeCompare(b.id))',
      '    .slice(0, n)',
      "    .filter((p) => p.availability !== 'out_of_stock' && !purchasedIds.includes(p.id))",
      '    .map((p) => p.id);',
      '}',
      'return { rankProducts };',
    ].join('\n');
    const names = await failed(checks02, code);
    expect(names.some((n) => /nachrücken/i.test(n)), names.join(' | ')).toBe(true);
  });

  it('categoryAffinity: ohne Normierung', async () => {
    const names = await failed(checks03, mutate(2, 'sums[category] / total', 'sums[category]'));
    expect(names.some((n) => /ein Ereignis/i.test(n)), names.join(' | ')).toBe(true);
  });

  it('categoryAffinity: ohne Abklingen', async () => {
    const names = await failed(checks03, mutate(2, '0.5 ** (age / 7)', '1'));
    expect(names.some((n) => /halb/.test(n)), names.join(' | ')).toBe(true);
  });

  it('categoryAffinity: Kauf zählt wie ein Aufruf', async () => {
    const names = await failed(checks03, mutate(2, 'purchase: 5', 'purchase: 1'));
    expect(names.some((n) => /Kauf/.test(n)), names.join(' | ')).toBe(true);
  });
});
