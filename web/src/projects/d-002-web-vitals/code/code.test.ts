import { describe, expect, it } from 'vitest';
import { runChecks } from '../../../codeTask/runChecks';
import type { CheckModule, RunResult } from '../../../codeTask/types';
import { REFERENCE, clsFromShifts, fieldResults, percentile75, rateMetric, simulateLoad, type MetricName } from '../../../experience/vitals';
import { shiftsOf } from '../insights';
import { meta } from '../content';
import checks01 from './01.checks';
import checks02, { FIELD_INP } from './02.checks';
import checks03 from './03.checks';

const MODULES: Record<string, CheckModule> = {
  'D-002-code-01': checks01,
  'D-002-code-02': checks02,
  'D-002-code-03': checks03,
};

const failures = (r: RunResult) => (r.status === 'ok' ? r.results.filter((c) => !c.passed) : [r]);
const solutionOf = (n: number) => meta.codeTasks?.[n]?.solution ?? '';
// Die Musterlösung als Funktion, so wie der Worker sie aufruft.
const load = <T,>(n: number) => (new Function(solutionOf(n)) as () => T)();

describe('D-002 Code-Aufgaben', () => {
  it('es sind genau diese drei', () => {
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['D-002-code-01', 'D-002-code-02', 'D-002-code-03']);
    expect(checks01.exportsNeeded).toEqual(['rateMetric']);
    expect(checks02.exportsNeeded).toEqual(['percentile75']);
    expect(checks03.exportsNeeded).toEqual(['clsFromShifts']);
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

describe('D-002 Musterlösungen gegen den Kern', () => {
  it('Aufgabe 1 bewertet wie rateMetric, auch genau an den Grenzen', () => {
    const mine = load<{ rateMetric: (n: MetricName, v: number) => string }>(0).rateMetric;
    const cases: [MetricName, number][] = [
      ['lcp', 1.8], ['lcp', 2.5], ['lcp', 3.2], ['lcp', 4], ['lcp', 4.53],
      ['cls', 0.05], ['cls', 0.1], ['cls', 0.17], ['cls', 0.25], ['cls', 0.32],
      ['inp', 56], ['inp', 200], ['inp', 350], ['inp', 500], ['inp', 576],
    ];
    for (const [name, value] of cases) expect(mine(name, value), `${name} ${value}`).toBe(rateMetric(name, value));
    // Die Prüfungen erwarten dieselben Stufen wie der Kern.
    expect(checks01.checks).toHaveLength(cases.length);
  });

  it('Aufgabe 2 rechnet wie percentile75 auf fieldResults({})', () => {
    const mine = load<{ percentile75: (v: number[]) => number }>(1).percentile75;
    const visits = fieldResults({});
    for (const key of ['lcp', 'cls', 'inp'] as const) {
      const values = visits.map((v) => v[key]);
      expect(mine(values), key).toBe(percentile75(values));
    }
    expect(FIELD_INP).toEqual(visits.map((v) => v.inp));
    expect(percentile75(FIELD_INP)).toBe(856);
    expect(percentile75([5, 1, 4, 2, 3])).toBe(4);
    expect(percentile75([40, 10, 30, 20])).toBe(30);
  });

  it('Aufgabe 3 rechnet wie clsFromShifts auf den Verschiebungen des Startstands', () => {
    const mine = load<{ clsFromShifts: (s: { time: number; value: number }[]) => number }>(2).clsFromShifts;
    const shifts = shiftsOf(simulateLoad({}, REFERENCE));
    expect(shifts.map((s) => s.time)).toEqual([0.818, 1.338, 4.53]);
    expect(mine(shifts)).toBeCloseTo(clsFromShifts(shifts), 9);
    const compress = shiftsOf(simulateLoad({ compress: true }, REFERENCE));
    expect(mine(compress)).toBeCloseTo(clsFromShifts(compress), 9);
  });

  it('die erwarteten Werte der Prüfungen 3 stimmen mit dem Kern', () => {
    const s = (time: number, value: number) => ({ time, value });
    expect(clsFromShifts([s(0.818, 0.05), s(1.338, 0.12)])).toBe(0.17);
    expect(clsFromShifts([s(1, 0.1), s(2, 0.2)])).toBe(0.2);
    expect(clsFromShifts([0, 0.9, 1.8, 2.7, 3.6, 4.5, 5.4].map((t) => s(t, 0.1)))).toBe(0.6);
    expect(clsFromShifts([s(0.818, 0.05), s(1.338, 0.12), s(4.53, 0.15), s(4.9, 0.1)])).toBe(0.25);
    expect(clsFromShifts([s(1.338, 0.12), s(4.53, 0.15), s(0.818, 0.05)])).toBe(0.17);
    expect(clsFromShifts([s(0.818, 0.05), s(1.17, 0.15), s(1.338, 0.12)])).toBe(0.32);
  });
});

// Typische Fehler: Jede Variante ist die Musterlösung mit genau einer Änderung.
describe('D-002 Prüfungen erkennen typische Fehler', () => {
  const failed = async (module: CheckModule, code: string) => {
    const r = await runChecks(module, code);
    expect(r.status).toBe('ok');
    return r.status === 'ok' ? r.results.filter((c) => !c.passed).map((c) => c.name) : [];
  };
  const mutate = (n: number, from: string, to: string) => {
    expect(solutionOf(n), `Musterlösung enthält ${from}`).toContain(from);
    return solutionOf(n).replace(from, to);
  };

  it('rateMetric: Grenzwert zur schlechteren Stufe', async () => {
    const names = await failed(checks01, mutate(0, 'value <= limit.good', 'value < limit.good'));
    expect(names.some((n) => /genau/.test(n)), names.join(' | ')).toBe(true);
  });

  it('rateMetric: obere Grenze zur schlechteren Stufe', async () => {
    const names = await failed(checks01, mutate(0, 'value <= limit.poor', 'value < limit.poor'));
    expect(names).toContain('LCP genau `4` ist noch `needsImprovement`');
  });

  it('percentile75: sort() ohne Vergleich', async () => {
    const names = await failed(checks02, mutate(1, '.sort((a, b) => a - b)', '.sort()'));
    expect(names.some((n) => /INP/.test(n)), names.join(' | ')).toBe(true);
  });

  it('percentile75: sortiert die Eingabe selbst', async () => {
    const names = await failed(checks02, mutate(1, '[...values].sort', 'values.sort'));
    expect(names.some((n) => /Unsortiert/.test(n)), names.join(' | ')).toBe(true);
  });

  it('percentile75: abgerundet statt aufgerundet', async () => {
    const names = await failed(checks02, mutate(1, 'Math.ceil(0.75 * sorted.length) - 1', 'Math.floor(0.75 * sorted.length) - 1'));
    expect(names.some((n) => /Fünf/.test(n)), names.join(' | ')).toBe(true);
  });

  it('clsFromShifts: Lücke von genau 1 s zählt nicht als Trennung', async () => {
    const names = await failed(checks03, mutate(2, 's.time - last >= 1', 's.time - last > 1'));
    expect(names).toContain('Eine Lücke von genau `1` s trennt');
  });

  it('clsFromShifts: ohne 5-s-Grenze', async () => {
    const names = await failed(checks03, mutate(2, ' || s.time - start > 5', ''));
    expect(names.some((n) => /5/.test(n)), names.join(' | ')).toBe(true);
  });

  it('clsFromShifts: erstes statt größtes Fenster', async () => {
    const names = await failed(checks03, mutate(2, 'best = Math.max(best, sum);', 'if (start === sorted[0].time) best = sum;'));
    expect(names).toContain('Das größte Fenster gewinnt, nicht das erste');
  });

  it('clsFromShifts: ohne Sortieren', async () => {
    const names = await failed(checks03, mutate(2, '[...shifts].sort((a, b) => a.time - b.time)', '[...shifts]'));
    expect(names).toContain('Unsortierte Eingabe');
  });
});
