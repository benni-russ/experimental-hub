import { describe, expect, it } from 'vitest';
import { NOT_A_NUMBER, NOT_WHOLE } from '../006-confidence-interval/validate';
import { NO_VISITORS, SHARE_RANGE, START_FIELDS, validateOwn } from './validate';

describe('validateOwn', () => {
  it('Startwerte sind gültig', () => {
    expect(validateOwn(START_FIELDS)).toEqual({
      input: { visitorsA: 50600, visitorsB: 49400, plannedShareA: 50 },
      errors: {},
      noVisitors: false,
    });
  });

  it('leer oder Text: Bitte eine Zahl eingeben.', () => {
    const r = validateOwn({ ...START_FIELDS, visitorsA: '', plannedShareA: 'halb' });
    expect(r.input).toBeNull();
    expect(r.errors.visitorsA).toBe(NOT_A_NUMBER);
    expect(r.errors.plannedShareA).toBe(NOT_A_NUMBER);
  });

  it('Dezimalzahl oder negativ bei Besuchern: ganze Zahl verlangt', () => {
    expect(validateOwn({ ...START_FIELDS, visitorsB: '10,5' }).errors.visitorsB).toBe(NOT_WHOLE);
    expect(validateOwn({ ...START_FIELDS, visitorsB: '-3' }).errors.visitorsB).toBe(NOT_WHOLE);
  });

  it('0 Besucher in einer Gruppe ist erlaubt', () => {
    const r = validateOwn({ ...START_FIELDS, visitorsB: '0' });
    expect(r.errors).toEqual({});
    expect(r.input).toEqual({ visitorsA: 50600, visitorsB: 0, plannedShareA: 50 });
  });

  it('Summe 0: kein Feldfehler, aber keine Eingabe', () => {
    const r = validateOwn({ ...START_FIELDS, visitorsA: '0', visitorsB: '0' });
    expect(r.errors).toEqual({});
    expect(r.input).toBeNull();
    expect(r.noVisitors).toBe(true);
    expect(NO_VISITORS).toMatch(/Besucher/);
  });

  it('Anteil muss echt zwischen 0 und 100 liegen', () => {
    for (const bad of ['0', '100', '-5', '120']) {
      expect(validateOwn({ ...START_FIELDS, plannedShareA: bad }).errors.plannedShareA).toBe(SHARE_RANGE);
    }
    expect(validateOwn({ ...START_FIELDS, plannedShareA: '33,3' }).errors).toEqual({});
  });
});
