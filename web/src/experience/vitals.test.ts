import { describe, expect, it } from 'vitest';
import {
  FIELD_VISITS,
  FIXES,
  PROFILES,
  REFERENCE,
  THRESHOLDS,
  clampTime,
  clsFromShifts,
  fieldResults,
  percentile75,
  rateMetric,
  simulateLoad,
  type FixId,
  type MetricName,
  type VitalsFixes,
} from './vitals';

const ALL: VitalsFixes = Object.fromEntries(FIXES.map((f) => [f.id, true]));
const only = (id: FixId): VitalsFixes => ({ [id]: true });

describe('rateMetric', () => {
  it.each(['lcp', 'cls', 'inp'] as MetricName[])('%s: Grenzwert gehört zur besseren Stufe', (name) => {
    const { good, poor } = THRESHOLDS[name];
    expect(rateMetric(name, good)).toBe('good');
    expect(rateMetric(name, good + 0.0001)).toBe('needsImprovement');
    expect(rateMetric(name, poor)).toBe('needsImprovement');
    expect(rateMetric(name, poor + 0.0001)).toBe('poor');
  });
  it('kennt die Zahlen der Grenzen', () => {
    expect(rateMetric('lcp', 2.5)).toBe('good');
    expect(rateMetric('lcp', 2.51)).toBe('needsImprovement');
    expect(rateMetric('lcp', 4)).toBe('needsImprovement');
    expect(rateMetric('lcp', 4.01)).toBe('poor');
    expect(rateMetric('cls', 0.1)).toBe('good');
    expect(rateMetric('cls', 0.11)).toBe('needsImprovement');
    expect(rateMetric('cls', 0.25)).toBe('needsImprovement');
    expect(rateMetric('cls', 0.26)).toBe('poor');
    expect(rateMetric('inp', 200)).toBe('good');
    expect(rateMetric('inp', 201)).toBe('needsImprovement');
    expect(rateMetric('inp', 500)).toBe('needsImprovement');
    expect(rateMetric('inp', 501)).toBe('poor');
  });
});

describe('clsFromShifts', () => {
  it('leere Liste ergibt 0', () => {
    expect(clsFromShifts([])).toBe(0);
  });
  it('summiert ein Fenster', () => {
    expect(clsFromShifts([{ time: 1, value: 0.05 }, { time: 1.5, value: 0.12 }])).toBeCloseTo(0.17, 10);
  });
  it('eine Lücke von genau 1 s trennt', () => {
    expect(clsFromShifts([{ time: 1, value: 0.1 }, { time: 2, value: 0.2 }])).toBeCloseTo(0.2, 10);
  });
  it('eine Lücke knapp unter 1 s trennt nicht', () => {
    expect(clsFromShifts([{ time: 1, value: 0.1 }, { time: 1.99, value: 0.2 }])).toBeCloseTo(0.3, 10);
  });
  it('ein Fenster länger als 5 s trennt', () => {
    const shifts = [0, 0.9, 1.8, 2.7, 3.6, 4.5, 5.4].map((time) => ({ time, value: 0.1 }));
    // Die Verschiebung bei 5,4 liegt mehr als 5 s nach dem Fensterbeginn bei 0.
    expect(clsFromShifts(shifts)).toBeCloseTo(0.6, 10);
  });
  it('ein Fenster von genau 5 s bleibt zusammen', () => {
    const shifts = [0, 0.9, 1.8, 2.7, 3.6, 4.5, 5].map((time) => ({ time, value: 0.1 }));
    expect(clsFromShifts(shifts)).toBeCloseTo(0.7, 10);
  });
  it('das größte Fenster gewinnt', () => {
    const shifts = [
      { time: 1, value: 0.05 },
      { time: 3, value: 0.2 },
      { time: 3.5, value: 0.1 },
      { time: 8, value: 0.15 },
    ];
    expect(clsFromShifts(shifts)).toBeCloseTo(0.3, 10);
  });
  it('sortiert unsortierte Eingaben und lässt sie unverändert', () => {
    const shifts = [{ time: 3.5, value: 0.1 }, { time: 1, value: 0.05 }, { time: 3, value: 0.2 }];
    const copy = shifts.map((s) => ({ ...s }));
    expect(clsFromShifts(shifts)).toBeCloseTo(0.3, 10);
    expect(shifts).toEqual(copy);
  });
});

describe('percentile75', () => {
  it('Rangmethode', () => {
    expect(percentile75([1, 2, 3, 4])).toBe(3);
    expect(percentile75([7])).toBe(7);
  });
  it('20 Werte ergeben den 15. Wert', () => {
    const values = Array.from({ length: 20 }, (_, i) => (i * 7) % 20); // 0 bis 19, durchmischt
    expect(percentile75(values)).toBe(14);
  });
  it('lässt die Eingabe unverändert', () => {
    const values = [4, 1, 3, 2];
    percentile75(values);
    expect(values).toEqual([4, 1, 3, 2]);
  });
  it('leere Liste ergibt 0', () => {
    expect(percentile75([])).toBe(0);
  });
});

describe('clampTime', () => {
  it('begrenzt auf [0, end]', () => {
    expect(clampTime(9, 4.2)).toBe(4.2);
    expect(clampTime(-1, 4)).toBe(0);
    expect(clampTime(2, 4)).toBe(2);
  });
  it('NaN ergibt die untere Grenze 0', () => {
    expect(clampTime(NaN, 4)).toBe(0);
  });
});

describe('FIXES', () => {
  it('sieben Gegenmittel mit Beschriftung und Ziel', () => {
    expect(FIXES.map((f) => [f.id, f.label, f.targets])).toEqual([
      ['criticalCss', 'Kritisches CSS zuerst', 'lcp'],
      ['preload', 'Produktbild vorladen', 'lcp'],
      ['compress', 'Produktbild komprimieren', 'lcp'],
      ['fontFallback', 'Passende Ersatzschrift', 'cls'],
      ['reserveSpace', 'Platz für das Banner reservieren', 'cls'],
      ['dimensions', 'Bildmaße angeben', 'cls'],
      ['splitTask', 'Aufgabe aufteilen', 'inp'],
    ]);
  });
});

describe('Profile', () => {
  it('Feldbesuche je Profil', () => {
    const count: Record<string, number> = {};
    for (const id of FIELD_VISITS) count[id] = (count[id] ?? 0) + 1;
    expect(count).toEqual({ fiber: 2, cable: 2, wifi: 3, phone4g: 4, phone4gSlow: 5, oldPhone: 2, weak: 1, edge: 1 });
  });
  it('Referenz ist das Handy im 4G-Netz', () => {
    expect(REFERENCE).toEqual({ id: 'phone4g', label: 'Handy, 4G', bandwidthKBps: 625, rttS: 0.15, cpu: 1 });
    expect(PROFILES).toContain(REFERENCE);
    expect(PROFILES).toHaveLength(8);
  });
  it('Feldbesuche verweisen auf bekannte Profile', () => {
    const ids = new Set(PROFILES.map((p) => p.id));
    expect(FIELD_VISITS).toHaveLength(20);
    for (const id of FIELD_VISITS) expect(ids.has(id)).toBe(true);
  });
});

describe('simulateLoad am Referenzprofil (Tabelle)', () => {
  const rows: [string, VitalsFixes, number, number, number][] = [
    ['Start', {}, 4.53, 0.17, 576],
    ['kritisches CSS', only('criticalCss'), 4.362, 0.17, 576],
    ['vorladen', only('preload'), 4.188, 0.17, 576],
    ['komprimieren', only('compress'), 1.17, 0.32, 576],
    ['Maße angeben', only('dimensions'), 4.53, 0.17, 576],
    ['Ersatzschrift', only('fontFallback'), 4.53, 0.15, 576],
    ['Platz reservieren', only('reserveSpace'), 4.53, 0.15, 576],
    ['Aufgabe aufteilen', only('splitTask'), 4.53, 0.17, 56],
    ['alles', ALL, 0.828, 0, 56],
  ];
  it.each(rows)('%s', (_name, fixes, lcp, cls, inp) => {
    const r = simulateLoad(fixes, REFERENCE);
    expect(r.lcp).toBeCloseTo(lcp, 3);
    expect(r.cls).toBeCloseTo(cls, 3);
    expect(r.inp).toBe(inp);
  });
});

describe('simulateLoad: Ergebnisstruktur', () => {
  it('Start: Ressourcen, Ereignisse und Ende', () => {
    const r = simulateLoad({}, REFERENCE);
    expect(r.resources.map((x) => x.id)).toEqual(['html', 'css', 'font', 'script', 'image']);
    expect(r.resources.filter((x) => x.blocking).map((x) => x.id)).toEqual(['css']);
    expect(r.events.find((e) => e.type === 'firstPaint')).toEqual({ type: 'firstPaint', time: 0.54 });
    expect(r.events.filter((e) => e.type === 'shift')).toHaveLength(3);
    expect(r.events.some((e) => e.type === 'longTask')).toBe(true);
    expect(r.events.some((e) => e.type === 'bannerInserted')).toBe(true);
    expect(r.end).toBeCloseTo(5.03, 3);
  });
  it('mit allen Gegenmitteln gibt es keine Verschiebung', () => {
    const r = simulateLoad(ALL, REFERENCE);
    expect(r.events.filter((e) => e.type === 'shift')).toHaveLength(0);
  });
  it('Ereignisse sind nach Zeit sortiert', () => {
    const times = simulateLoad({}, REFERENCE).events.map((e) => (e.type === 'longTask' ? e.start : e.time));
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });
});

describe('Feld', () => {
  const p75 = (fixes: VitalsFixes, key: 'lcp' | 'cls' | 'inp') => percentile75(fieldResults(fixes).map((r) => r[key]));
  it('Start: p75 LCP 6,975, CLS 0,17, INP 856', () => {
    expect(p75({}, 'lcp')).toBeCloseTo(6.975, 3);
    expect(p75({}, 'cls')).toBeCloseTo(0.17, 3);
    expect(p75({}, 'inp')).toBe(856);
  });
  it('alle Gegenmittel: 1,225 / 0 / 76', () => {
    expect(p75(ALL, 'lcp')).toBeCloseTo(1.225, 3);
    expect(p75(ALL, 'cls')).toBe(0);
    expect(p75(ALL, 'inp')).toBe(76);
  });
  it('liefert einen Besuch je Eintrag', () => {
    const results = fieldResults({});
    expect(results).toHaveLength(20);
    expect(results.map((r) => r.visit)).toEqual(Array.from({ length: 20 }, (_, i) => i));
  });
  it('Referenz ist im Start schneller als das 75. Perzentil', () => {
    const ref = simulateLoad({}, REFERENCE);
    expect(ref.lcp).toBeLessThan(p75({}, 'lcp'));
    expect(ref.inp).toBeLessThan(p75({}, 'inp'));
    expect(ref.cls).toBeLessThanOrEqual(p75({}, 'cls'));
  });
});

describe('keine NaN', () => {
  it.each(PROFILES.map((p) => [p.id, p] as const))('Profil %s', (_id, profile) => {
    for (const fixes of [{}, ALL]) {
      const r = simulateLoad(fixes, profile);
      for (const v of [r.lcp, r.cls, r.inp, r.end]) expect(Number.isNaN(v)).toBe(false);
    }
  });
});
