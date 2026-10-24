import { describe, expect, it } from 'vitest';
import { isEstimateLocked } from './EstimateQuestion';

describe('isEstimateLocked', () => {
  it('lässt die erste Schätzung im Einstieg zu', () => {
    expect(isEstimateLocked('before', null, false)).toBe(false);
  });

  it('sperrt den Einstieg nach einer gemerkten Schätzung', () => {
    expect(isEstimateLocked('before', 120, false)).toBe(true);
  });

  it('gibt den Einstieg nach einem Speicherfehler wieder frei', () => {
    expect(isEstimateLocked('before', 120, true)).toBe(false);
  });

  it('sperrt den Wissenscheck nie', () => {
    expect(isEstimateLocked('after', 120, false)).toBe(false);
  });
});

describe('isEstimateLocked mit lockAfterAnswer', () => {
  it('sperrt den Wissenscheck nach der Antwort, wenn verlangt', () => {
    expect(isEstimateLocked('after', 120, false, true)).toBe(true);
    expect(isEstimateLocked('after', null, false, true)).toBe(false);
    expect(isEstimateLocked('after', 120, true, true)).toBe(false);
  });
});
