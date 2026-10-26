import { describe, expect, it } from 'vitest';
import { runChecks } from '../../../codeTask/runChecks';
import type { CheckModule, RunResult } from '../../../codeTask/types';
import { ECONOMY, SCENARIOS, SOURCES, compareKpis, computeFunnel, kpis } from '../../../experience/funnel';
import { meta } from '../content';
import checks01 from './01.checks';
import checks02 from './02.checks';
import checks03 from './03.checks';

const MODULES: Record<string, CheckModule> = {
  'D-003-code-01': checks01,
  'D-003-code-02': checks02,
  'D-003-code-03': checks03,
};

const failures = (r: RunResult) => (r.status === 'ok' ? r.results.filter((c) => !c.passed) : [r]);
const solutionOf = (n: number) => meta.codeTasks?.[n]?.solution ?? '';
// Die Musterlösung als Funktion, so wie der Worker sie aufruft.
const load = <T,>(n: number) => (new Function(solutionOf(n)) as () => T)();

const base = computeFunnel(SOURCES);
const start = kpis(base, ECONOMY);

describe('D-003 Code-Aufgaben', () => {
  it('es sind genau diese drei', () => {
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['D-003-code-01', 'D-003-code-02', 'D-003-code-03']);
    expect(checks01.exportsNeeded).toEqual(['stepRates']);
    expect(checks02.exportsNeeded).toEqual(['revenuePerVisit']);
    expect(checks03.exportsNeeded).toEqual(['compareKpis']);
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

describe('D-003 Musterlösungen gegen den Kern', () => {
  it('Aufgabe 1 rechnet auf computeFunnel(SOURCES).counts dieselben Quoten wie der Kern', () => {
    const mine = load<{ stepRates: (c: number[]) => { rates: number[]; overall: number } }>(0).stepRates;
    const result = mine(base.counts);
    result.rates.forEach((r, i) => expect(r).toBeCloseTo(base.rates[i]!, 12));
    expect(result.overall).toBeCloseTo(base.overall, 12);
    for (const s of SOURCES) {
      const part = base.bySource[s.id];
      const own = mine(part.counts);
      own.rates.forEach((r, i) => expect(r).toBeCloseTo(part.rates[i]!, 12));
      expect(own.overall).toBeCloseTo(part.overall, 12);
    }
    // Die Prüfung „Suche aus der Demo“ nimmt genau die Stufen der Suche.
    expect(base.bySource.search.counts.map((c) => Math.round(c * 10) / 10)).toEqual([8000, 4800, 720, 396, 237.6]);
    expect(base.bySource.search.overall).toBeCloseTo(0.0297, 12);
    // Null in einer Stufe: wie der Kern, Quote 0.
    const empty = computeFunnel([{ ...SOURCES[0]!, rates: [0.5, 0, 0.5, 0.5] }]);
    expect(mine(empty.counts).rates).toEqual(empty.rates);
  });

  it('Aufgabe 2 rechnet wie kpis(…).revenuePerVisit, auch in jedem Szenario', () => {
    const mine = load<{ revenuePerVisit: (k: { visits: number; orders: number; averageOrderValue: number }) => number }>(1).revenuePerVisit;
    expect(mine(start)).toBeCloseTo(start.revenuePerVisit, 9);
    for (const s of SCENARIOS) {
      const { sources, economy } = s.apply(SOURCES, ECONOMY);
      const k = kpis(computeFunnel(sources), economy);
      expect(mine(k), s.id).toBeCloseTo(k.revenuePerVisit, 9);
    }
    expect(mine({ visits: 20000, orders: 520, averageOrderValue: 92 })).toBeCloseTo(2.392, 12);
  });

  it('Aufgabe 3 erkennt Richtungen und Widerspruch wie compareKpis im Kern (Umsatz)', () => {
    const mine = load<{ compareKpis: (a: object, b: object) => { conversionRate: string; revenue: string; conflict: boolean } }>(2).compareKpis;
    for (const s of SCENARIOS) {
      const { sources, economy } = s.apply(SOURCES, ECONOMY);
      const after = kpis(computeFunnel(sources), economy);
      const core = compareKpis(start, after);
      const own = mine(start, after);
      expect(own.conversionRate, s.id).toBe(core.changes.conversionRate.direction);
      expect(own.revenue, s.id).toBe(core.changes.revenue.direction);
      // Der Kern zählt auch den Rohertrag; ohne ihn gilt der Widerspruch nur über den Umsatz.
      const cr = core.changes.conversionRate.direction;
      const rev = core.changes.revenue.direction;
      expect(own.conflict, s.id).toBe(cr !== 'same' && rev !== 'same' && cr !== rev);
    }
  });

  it('die gerundeten Werte der Prüfungen 3 zeigen dieselben Richtungen wie die Szenarien', () => {
    const r = (id: string) => {
      const s = SCENARIOS.find((x) => x.id === id)!;
      const { sources, economy } = s.apply(SOURCES, ECONOMY);
      return kpis(computeFunnel(sources), economy);
    };
    expect(Math.round(start.revenue)).toBe(47825);
    expect(Math.round(start.conversionRate * 1000) / 1000).toBe(0.026);
    expect(Math.round(r('guestCheckout').revenue)).toBe(54999);
    expect(Math.round(r('guestCheckout').conversionRate * 10000) / 10000).toBe(0.0299);
    expect(Math.round(r('discount').revenue)).toBe(45529);
    expect(Math.round(r('discount').conversionRate * 10000) / 10000).toBe(0.0291);
    expect(Math.round(r('socialCampaign').revenue)).toBe(50309);
    expect(Math.round(r('socialCampaign').conversionRate * 10000) / 10000).toBe(0.0219);
  });
});

// Typische Fehler: Jede Variante ist die Musterlösung mit genau einer Änderung.
describe('D-003 Prüfungen erkennen typische Fehler', () => {
  const failed = async (module: CheckModule, code: string) => {
    const r = await runChecks(module, code);
    expect(r.status).toBe('ok');
    return r.status === 'ok' ? r.results.filter((c) => !c.passed).map((c) => c.name) : [];
  };
  const mutate = (n: number, from: string, to: string) => {
    expect(solutionOf(n), `Musterlösung enthält ${from}`).toContain(from);
    return solutionOf(n).replace(from, to);
  };

  it('stepRates: ohne Schutz gegen Teilen durch 0', async () => {
    const names = await failed(checks01, mutate(0, '(b > 0 ? a / b : 0)', 'a / b'));
    expect(names).toContain('Null in einem Schritt ergibt Quote `0` statt `NaN`');
  });

  it('stepRates: verändert die Eingabe', async () => {
    const names = await failed(checks01, mutate(0, 'counts.slice(1)', 'counts.splice(1)'));
    expect(names.length).toBeGreaterThan(0);
  });

  it('stepRates: overall andersherum geteilt', async () => {
    const names = await failed(checks01, mutate(0, 'ratio(counts[counts.length - 1], counts[0])', 'ratio(counts[0], counts[counts.length - 1])'));
    expect(names.some((n) => /Beispiel/.test(n)), names.join(' | ')).toBe(true);
  });

  it('revenuePerVisit: ohne Schutz bei null Besuchen', async () => {
    const names = await failed(checks02, mutate(1, '  if (visits <= 0) return 0;\n', ''));
    expect(names).toContain('Null Besuche ergeben `0`');
    expect(names).toContain('Null Besuche ergeben `0`, auch mit Käufen');
  });

  it('revenuePerVisit: gerundet', async () => {
    const names = await failed(checks02, mutate(1, 'return (orders * averageOrderValue) / visits;', 'return Math.round((orders * averageOrderValue) / visits * 100) / 100;'));
    expect(names).toContain('Nicht runden: `3` Besuche, `1` Kauf zu `10` €');
  });

  it('compareKpis: gleich bleibend zählt als Widerspruch', async () => {
    const names = await failed(checks03, mutate(2, "cr !== 'same' && revenue !== 'same' && cr !== revenue", 'cr !== revenue'));
    expect(names).toContain('Rate bleibt gleich: kein Widerspruch');
  });

  it('compareKpis: Widerspruch nur in eine Richtung', async () => {
    const names = await failed(checks03, mutate(2, "cr !== 'same' && revenue !== 'same' && cr !== revenue", "cr === 'down' && revenue === 'up'"));
    expect(names).toContain('Rate steigt, Umsatz fällt: Widerspruch');
  });
});
