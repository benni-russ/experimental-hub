import { describe, expect, it } from 'vitest';
import { formatPValue, srmTest } from './srm';

describe('srmTest', () => {
  it.each([
    [50600, 49400, 50, 14.4, 0.000147802],
    [50520, 49480, 50, 10.816, 0.001006267],
    [50521, 49479, 50, 10.85764, 0.00098389],
    [10300, 9700, 50, 18, 0.0000220905],
    [30500, 69500, 30, 11.9047619, 0.000559906],
  ])('%i / %i bei %i %%', (a, b, share, chi, p) => {
    const r = srmTest({ visitorsA: a, visitorsB: b, plannedShareA: share })!;
    expect(r.chiSquare).toBeCloseTo(chi, 4);
    expect(Math.abs(r.pValue / p - 1)).toBeLessThan(1e-4);
  });

  it('Schwelle: 520 Abweichung noch nicht, 521 schon', () => {
    expect(srmTest({ visitorsA: 50520, visitorsB: 49480, plannedShareA: 50 })!.mismatch).toBe(false);
    expect(srmTest({ visitorsA: 50521, visitorsB: 49479, plannedShareA: 50 })!.mismatch).toBe(true);
  });

  it('perfekt: p = 1', () =>
    expect(srmTest({ visitorsA: 50000, visitorsB: 50000, plannedShareA: 50 })!.pValue).toBeCloseTo(1, 9));

  it('winziger p-Wert bleibt positiv', () =>
    expect(srmTest({ visitorsA: 52500, visitorsB: 47500, plannedShareA: 50 })!.pValue).toBeGreaterThan(0));

  it.each([0, 100, -5, 120, Number.NaN, Number.POSITIVE_INFINITY])('Anteil %s → null', (s) =>
    expect(srmTest({ visitorsA: 1, visitorsB: 1, plannedShareA: s })).toBeNull(),
  );

  it.each([
    [0, 0],
    [-1, 5],
    [1.5, 2],
    [Number.NaN, 3],
    [Number.POSITIVE_INFINITY, 3],
  ])('Besucher %s / %s → null', (a, b) =>
    expect(srmTest({ visitorsA: a, visitorsB: b, plannedShareA: 50 })).toBeNull(),
  );

  it('eine leere Gruppe ist gültig und ergibt eine definierte Abweichung', () => {
    const r = srmTest({ visitorsA: 0, visitorsB: 100, plannedShareA: 50 })!;
    expect(Number.isFinite(r.chiSquare)).toBe(true);
    expect(r.deviationPercent).toBeCloseTo(-100, 9);
    expect(r.mismatch).toBe(true);
  });

  it('Erwartungswerte und Abweichung', () => {
    const r = srmTest({ visitorsA: 30500, visitorsB: 69500, plannedShareA: 30 })!;
    expect(r.expectedA).toBeCloseTo(30000, 9);
    expect(r.expectedB).toBeCloseTo(70000, 9);
    expect(r.deviationPercent).toBeCloseTo((30500 / 30000 - 1) * 100, 9);
  });
});

describe('formatPValue', () => {
  it('formatiert deutsch mit 4 gültigen Stellen', () => {
    expect(formatPValue(1.3e-15)).toBe('< 0,0001');
    expect(formatPValue(0.001006267)).toBe('0,001006');
    expect(formatPValue(0.1129)).toBe('0,1129');
  });
  it('zeigt nie „0“', () => {
    expect(formatPValue(0)).toBe('< 0,0001');
    expect(formatPValue(0.00009999)).toBe('< 0,0001');
    expect(formatPValue(1)).toBe('1');
  });
  it('nicht endlich → Strich', () => expect(formatPValue(Number.NaN)).toBe('–'));
});
