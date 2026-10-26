import { describe, expect, it } from 'vitest';
import { runChecks } from '../../../codeTask/runChecks';
import type { CheckModule, RunResult } from '../../../codeTask/types';
import { contrastRatio } from '../../../experience/color';
import { headingOutline, buildPage } from '../../../experience/productPage';
import { meta } from '../content';
import checks01 from './01.checks';
import checks02 from './02.checks';
import checks03 from './03.checks';

const MODULES: Record<string, CheckModule> = {
  'D-001-code-01': checks01,
  'D-001-code-02': checks02,
  'D-001-code-03': checks03,
};

const failures = (r: RunResult) => (r.status === 'ok' ? r.results.filter((c) => !c.passed) : [r]);
const solutionOf = (n: number) => meta.codeTasks?.[n]?.solution ?? '';
// Die Musterlösung als Funktion, so wie der Worker sie aufruft.
const load = <T,>(n: number) => (new Function(solutionOf(n)) as () => T)();

describe('D-001 Code-Aufgaben', () => {
  it('es sind genau diese drei', () => {
    expect(meta.codeTasks?.map((t) => t.id)).toEqual(['D-001-code-01', 'D-001-code-02', 'D-001-code-03']);
    expect(checks01.exportsNeeded).toEqual(['contrastRatio']);
    expect(checks02.exportsNeeded).toEqual(['checkHeadingOrder']);
    expect(checks03.exportsNeeded).toEqual(['checkAlt']);
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

describe('D-001 Musterlösungen gegen den Kern', () => {
  it('Aufgabe 1 rechnet wie contrastRatio aus color.ts, auf 0,01 genau', () => {
    const mine = load<{ contrastRatio: (a: string, b: string) => number }>(0).contrastRatio;
    for (const hex of ['#9a9a9a', '#595959', '#767676']) {
      expect(Math.abs(mine(hex, '#ffffff') - contrastRatio(hex, '#ffffff')), hex).toBeLessThan(0.01);
      expect(Math.abs(mine('#ffffff', hex) - contrastRatio(hex, '#ffffff')), hex).toBeLessThan(0.01);
    }
    expect(mine('#fff', '#000')).toBeCloseTo(21, 9);
  });

  it('die erwarteten Werte der Prüfungen stimmen mit dem Kern', () => {
    expect(Math.round(contrastRatio('#9a9a9a', '#ffffff') * 100) / 100).toBe(2.81);
    expect(Math.round(contrastRatio('#595959', '#ffffff') * 100) / 100).toBe(7);
    expect(Math.round(contrastRatio('#767676', '#ffffff') * 100) / 100).toBe(4.54);
  });

  it('Aufgabe 2 findet den Sprung der Beispielseite wie headingOutline', () => {
    const mine = load<{ checkHeadingOrder: (l: number[]) => { index: number }[] }>(1).checkHeadingOrder;
    for (const fixes of [{}, { heading: true as const }]) {
      const outline = headingOutline(buildPage(fixes));
      const skipped = outline.flatMap((h, i) => (h.skipped && i > 0 ? [i] : []));
      expect(mine(outline.map((h) => h.level)).map((j) => j.index)).toEqual(skipped);
    }
  });
});

// Typische Fehler: Jede Variante ist die Musterlösung mit genau einer Änderung.
describe('D-001 Prüfungen erkennen typische Fehler', () => {
  const failed = async (module: CheckModule, code: string) => {
    const r = await runChecks(module, code);
    expect(r.status).toBe('ok');
    return r.status === 'ok' ? r.results.filter((c) => !c.passed).map((c) => c.name) : [];
  };
  const mutate = (n: number, from: string, to: string) => {
    expect(solutionOf(n), `Musterlösung enthält ${from}`).toContain(from);
    return solutionOf(n).replace(from, to);
  };

  it('contrastRatio: ohne die Kurzform', async () => {
    const names = await failed(checks01, mutate(0, "  if (h.length === 3) h = h.split('').map((c) => c + c).join('');\n", ''));
    expect(names.some((n) => /Kurzform/.test(n)), names.join(' | ')).toBe(true);
  });

  it('contrastRatio: feste Reihenfolge statt heller durch dunkler', async () => {
    const names = await failed(checks01, mutate(0, '(Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)', '(a + 0.05) / (b + 0.05)'));
    // Die feste Reihenfolge stimmt nur, wenn die hellere Farbe zuerst kommt: Weiß vorn besteht,
    // Hellgrau vorn fällt durch. Erst beide Fälle zusammen zeigen den Fehler.
    expect(names).toContain('Hellgrau `#9a9a9a` auf Weiß ergibt `2.81`');
    expect(names).not.toContain('Die Reihenfolge ist egal: Weiß und `#9a9a9a`');
  });

  it('contrastRatio: Kanäle ohne Umrechnung', async () => {
    const names = await failed(checks01, mutate(0, 'c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4', 'c'));
    expect(names.some((n) => /9a9a9a/.test(n)), names.join(' | ')).toBe(true);
  });

  it('checkHeadingOrder: jeder Sprung, auch um eine Ebene', async () => {
    const names = await failed(checks02, mutate(1, '> 1', '> 0'));
    expect(names.some((n) => /Lückenlos/.test(n)), names.join(' | ')).toBe(true);
  });

  it('checkHeadingOrder: Aufwärtssprünge mitgezählt', async () => {
    const names = await failed(checks02, mutate(1, 'levels[i] - levels[i - 1] > 1', 'Math.abs(levels[i] - levels[i - 1]) > 1'));
    expect(names.some((n) => /oben/.test(n)), names.join(' | ')).toBe(true);
  });

  it('checkHeadingOrder: Index des höheren Eintrags', async () => {
    const names = await failed(checks02, mutate(1, '{ index: i,', '{ index: i - 1,'));
    expect(names.some((n) => /Position/.test(n)), names.join(' | ')).toBe(true);
  });

  it('checkAlt: leerer Text als fehlend gewertet', async () => {
    const names = await failed(checks03, mutate(2, "if (image.alt === undefined) return 'missing';", "if (!image.alt) return 'missing';"));
    expect(names.some((n) => /decorative/.test(n)), names.join(' | ')).toBe(true);
  });

  it('checkAlt: Großschreibung nicht beachtet', async () => {
    const names = await failed(checks03, mutate(2, '.trim().toLowerCase()', '.trim()'));
    expect(names.some((n) => /groß/i.test(n)), names.join(' | ')).toBe(true);
  });

  it('checkAlt: nur .jpg erkannt', async () => {
    const names = await failed(checks03, mutate(2, '(jpe?g|png|webp|gif)', '(jpg)'));
    expect(names.some((n) => /Endungen/.test(n)), names.join(' | ')).toBe(true);
  });
});
