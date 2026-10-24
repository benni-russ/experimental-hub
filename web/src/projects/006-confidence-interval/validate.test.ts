import { describe, expect, it } from 'vitest';
import { validateCounts, type CountFields } from './validate';

const ok: CountFields = { visitorsA: '10.000', conversionsA: '1.000', visitorsB: '10000', conversionsB: '1100' };

describe('validateCounts', () => {
  it('liest deutsche Schreibweise und liefert Zahlen ohne Fehler', () => {
    const r = validateCounts(ok);
    expect(r.errors).toEqual({});
    expect(r.counts).toEqual({ visitorsA: 10000, conversionsA: 1000, visitorsB: 10000, conversionsB: 1100 });
  });

  it('leeres Feld: Bitte eine Zahl eingeben.', () => {
    const r = validateCounts({ ...ok, visitorsB: '' });
    expect(r.counts).toBeNull();
    expect(r.errors.visitorsB).toBe('Bitte eine Zahl eingeben.');
  });

  it('Text ist keine Zahl', () => {
    expect(validateCounts({ ...ok, conversionsA: 'viele' }).errors.conversionsA).toBe('Bitte eine Zahl eingeben.');
  });

  it('Dezimalzahl bei Besuchern: ganze Zahl verlangt', () => {
    const r = validateCounts({ ...ok, visitorsA: '10,5' });
    expect(r.counts).toBeNull();
    expect(r.errors.visitorsA).toBe('Bitte eine ganze Zahl eingeben.');
  });

  it('0 Besucher: Mindestens 1 Besucher.', () => {
    expect(validateCounts({ ...ok, visitorsA: '0', conversionsA: '0' }).errors.visitorsA).toBe('Mindestens 1 Besucher.');
  });

  it('mehr Käufe als Besucher: Meldung am Käufe-Feld', () => {
    const r = validateCounts({ ...ok, visitorsA: '1000', conversionsA: '1.200' });
    expect(r.counts).toBeNull();
    expect(r.errors.conversionsA).toBe('Mehr Käufe als Besucher geht nicht.');
    expect(r.errors.visitorsA).toBeUndefined();
  });

  it('negative Käufe sind keine gültige ganze Zahl', () => {
    expect(validateCounts({ ...ok, conversionsB: '-3' }).errors.conversionsB).toBe('Bitte eine ganze Zahl eingeben.');
  });
});
