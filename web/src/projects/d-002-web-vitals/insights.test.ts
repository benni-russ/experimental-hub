import { describe, expect, it } from 'vitest';
import { FIXES, REFERENCE, clsFromShifts, percentile75, fieldResults, rateMetric, simulateLoad, type FixId, type VitalsFixes } from '../../experience/vitals';
import {
  fieldInsightText,
  fieldMetrics,
  formatMetric,
  insightContent,
  largestWindow,
  shiftsOf,
  thresholdText,
  vitalsInsights,
  windowText,
  withoutEffectAlone,
  type VitalsInsight,
} from './insights';

const ALL: VitalsFixes = Object.fromEntries(FIXES.map((f) => [f.id, true]));
const ref = (fixes: VitalsFixes) => simulateLoad(fixes, REFERENCE);
// Alle 128 Schalterstände der sieben Gegenmittel.
const COMBOS: VitalsFixes[] = Array.from({ length: 2 ** FIXES.length }, (_, mask) =>
  Object.fromEntries(FIXES.map((f, i) => [f.id, Boolean(mask & (1 << i))])),
);

describe('vitalsInsights: Fälle aus dem Plan', () => {
  it('komprimieren: CLS steigt', () => {
    expect(vitalsInsights({ compress: true })).toContain('clsWorseByLcpFix');
  });
  it('Maße angeben: ohne Wirkung', () => {
    expect(vitalsInsights({ dimensions: true })).toContain('fixWithoutEffect');
  });
  it('alle Gegenmittel: nur allGood', () => {
    expect(vitalsInsights(ALL)).toEqual(['allGood']);
  });
  it('Start: nichts', () => {
    expect(vitalsInsights({})).toEqual([]);
  });

  // Tabelle Spec §4: nur komprimieren hebt den CLS (0,32), nur Maße angeben lässt ihn unverändert (0,17).
  const table: [FixId, VitalsInsight[]][] = [
    ['criticalCss', []],
    ['preload', []],
    ['compress', ['clsWorseByLcpFix']],
    ['fontFallback', []],
    ['reserveSpace', []],
    ['dimensions', ['fixWithoutEffect']],
    ['splitTask', []],
  ];
  it.each(table)('nur %s', (id, expected) => {
    expect(vitalsInsights({ [id]: true })).toEqual(expected);
  });
  it('die Tabelle deckt alle sieben Gegenmittel ab', () => {
    expect(table.map(([id]) => id)).toEqual(FIXES.map((f) => f.id));
  });
});

describe('vitalsInsights über alle 128 Stände', () => {
  it.each(COMBOS.map((c) => [JSON.stringify(c), c] as const))('%s', (_name, fixes) => {
    const now = ref(fixes);
    const start = ref({});
    const insights = vitalsInsights(fixes);

    // CLS höher als im Start geht nur mit einem eingeschalteten LCP-Gegenmittel.
    expect(insights.includes('clsWorseByLcpFix')).toBe(now.cls > start.cls);
    if (now.cls > start.cls) {
      expect(FIXES.some((f) => f.targets === 'lcp' && fixes[f.id])).toBe(true);
      expect(now.lcp).toBeLessThan(start.lcp);
    }
    expect(insights.includes('allGood')).toBe(['lcp', 'cls', 'inp'].every((m) => rateMetric(m as 'lcp', now[m as 'lcp']) === 'good'));
    // Nur „Bildmaße angeben“ ist allein ohne Wirkung; der Kasten erscheint, wenn es auch im gezeigten Stand nichts ändert.
    const dimensionsIdle = Boolean(fixes.dimensions) && ref({ ...fixes, dimensions: false }).cls === now.cls;
    expect(insights.includes('fixWithoutEffect')).toBe(dimensionsIdle);

    // Das größte Fenster ergibt den gezeigten CLS.
    const win = largestWindow(shiftsOf(now));
    expect(win.reduce((s, x) => s + x.value, 0)).toBeCloseTo(now.cls, 9);
    expect(clsFromShifts(shiftsOf(now))).toBe(now.cls);

    for (const insight of insights) {
      const { text } = insightContent(insight, fixes);
      expect(text).not.toMatch(/NaN|undefined/);
      if (insight === 'clsWorseByLcpFix') {
        expect(text).toContain(`Der CLS liegt jetzt bei ${formatMetric('cls', now.cls)}, im Start bei ${formatMetric('cls', start.cls)}.`);
        expect(text).toContain(`LCP ${formatMetric('lcp', now.lcp)} statt ${formatMetric('lcp', start.lcp)}`);
        expect(text).toContain(windowText(win));
        for (const f of FIXES.filter((x) => x.targets === 'lcp')) expect(text.includes(`„${f.label}“`)).toBe(Boolean(fixes[f.id]));
      }
      if (insight === 'fixWithoutEffect') {
        expect(ref({ ...fixes, dimensions: false }).cls).toBe(now.cls);
        expect(text).toContain(
          `„Bildmaße angeben“ ändert den CLS nicht: Start 0,17, nur mit diesem Gegenmittel 0,17, in deinem Stand mit und ohne es ${formatMetric('cls', now.cls)}.`,
        );
        expect(text).toContain(`das größte Sitzungsfenster ist ein anderes: ${windowText(win)}.`);
        expect(win.some((x) => x.source === 'image')).toBe(false);
      }
      if (insight === 'allGood') {
        expect(text).toContain(`LCP ${formatMetric('lcp', now.lcp)}, CLS ${formatMetric('cls', now.cls)} und INP ${formatMetric('inp', now.inp)} gut`);
      }
    }
  });
});

describe('Zahlen der Kästen gegen die Tabelle', () => {
  it('komprimieren: 0,32 statt 0,17, LCP 1,17 s statt 4,53 s, alle drei Verschiebungen in einem Fenster', () => {
    const { text } = insightContent('clsWorseByLcpFix', { compress: true });
    expect(text).toContain('Der CLS liegt jetzt bei 0,32, im Start bei 0,17.');
    expect(text).toContain('Eingeschaltet ist „Produktbild komprimieren“');
    expect(text).toContain('(LCP 1,17 s statt 4,53 s)');
    expect(text).toContain('Schrift 0,05 + Bild 0,15 + Banner 0,12');
  });
  it('Maße angeben allein: unverändert 0,17', () => {
    expect(withoutEffectAlone('dimensions')).toBe(true);
    expect(FIXES.filter((f) => withoutEffectAlone(f.id)).map((f) => f.id)).toEqual(['dimensions']);
  });
  it('Maße angeben allein: Text mit 0,17 und dem Fenster aus Schrift und Banner', () => {
    expect(insightContent('fixWithoutEffect', { dimensions: true }).text).toBe(
      '„Bildmaße angeben“ ändert den CLS nicht: Start 0,17, nur mit diesem Gegenmittel 0,17, in deinem Stand mit und ohne es 0,17. ' +
        'Seine Verschiebung fällt zwar weg, aber das größte Sitzungsfenster ist ein anderes: Schrift 0,05 + Banner 0,12.',
    );
  });
  it('Maße angeben mit komprimieren: zählt, also kein Kasten', () => {
    expect(vitalsInsights({ compress: true, dimensions: true })).toEqual([]);
    expect(ref({ compress: true }).cls).toBe(0.32);
    expect(ref({ compress: true, dimensions: true }).cls).toBe(0.17);
  });
  it('alles: 0,828 s, 0 und 56 ms', () => {
    expect(insightContent('allGood', ALL).text).toContain('LCP 0,828 s, CLS 0 und INP 56 ms gut');
  });
});

describe('Grenzwerte als Text', () => {
  it('aus THRESHOLDS', () => {
    expect(thresholdText('lcp')).toBe('gut bis 2,5 s · schlecht über 4 s');
    expect(thresholdText('cls')).toBe('gut bis 0,1 · schlecht über 0,25');
    expect(thresholdText('inp')).toBe('gut bis 200 ms · schlecht über 500 ms');
  });
});

describe('Labor gegen Feld', () => {
  it('Start: Feld 6,975 s, 0,17 und 856 ms', () => {
    const m = fieldMetrics({});
    expect(m.map((x) => x.p75)).toEqual([6.975, 0.17, 856]);
    expect(m.map((x) => x.reference)).toEqual([4.53, 0.17, 576]);
    expect(m.map((x) => x.rating)).toEqual(['poor', 'needsImprovement', 'poor']);
  });
  it('alle Gegenmittel: Feld 1,225 s, 0 und 76 ms', () => {
    expect(fieldMetrics(ALL).map((x) => x.p75)).toEqual([1.225, 0, 76]);
  });

  it.each(COMBOS.map((c) => [JSON.stringify(c), c] as const))('Text und Werte stimmen: %s', (_name, fixes) => {
    const m = fieldMetrics(fixes);
    const visits = fieldResults(fixes);
    const text = fieldInsightText(fixes);
    for (const row of m) {
      expect(row.values).toHaveLength(20);
      expect(row.p75).toBe(percentile75(visits.map((v) => v[row.metric])));
      expect(row.reference).toBe(ref(fixes)[row.metric]);
      // „Mindestens drei von vier Besuchen sind so gut oder besser.“
      expect(row.values.filter((v) => v <= row.p75).length).toBeGreaterThanOrEqual(15);
      // Das Referenzprofil ist nie langsamer als das Feld.
      expect(row.reference).toBeLessThanOrEqual(row.p75);
      expect(text).toContain(`im Labor ${formatMetric(row.metric, row.reference)}`);
      expect(text).toContain(`im Feld ${formatMetric(row.metric, row.p75)}`);
    }
    expect(text).not.toMatch(/NaN|undefined/);
  });
});
