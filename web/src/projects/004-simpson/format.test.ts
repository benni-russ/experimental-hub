import { describe, expect, it } from 'vitest';
import { compare } from './simpson';
import { formatGap, overallWinnerWord } from './format';

describe('formatGap', () => {
  it('setzt Vorzeichen, echtes Minus und deutsches Komma', () => {
    expect(formatGap(0.0384)).toBe('+0,038 Prozentpunkte');
    expect(formatGap(-0.004)).toBe('−0,004 Prozentpunkte');
    expect(formatGap(0)).toBe('0,000 Prozentpunkte');
  });

  it('passt zu den Reglerwerten 61 % und 62 %', () => {
    const gap = (s: number) => {
      const r = compare(s);
      return formatGap(r.overallB - r.overallA);
    };
    expect(gap(61)).toBe('+0,038 Prozentpunkte');
    expect(gap(62)).toBe('−0,004 Prozentpunkte');
  });
});

describe('overallWinnerWord', () => {
  it('sagt „knapp“, wenn die Gesamtraten gerundet gleich aussehen', () => {
    const r = compare(62);
    expect(overallWinnerWord(r.overallA, r.overallB, r.overallWinner)).toBe('A knapp vorn');
  });

  it('nennt sonst nur den Gewinner', () => {
    const r = compare(70);
    expect(overallWinnerWord(r.overallA, r.overallB, r.overallWinner)).toBe('A vorn');
    const s = compare(50);
    expect(overallWinnerWord(s.overallA, s.overallB, s.overallWinner)).toBe('B vorn');
  });

  it('Gleichstand bleibt „gleichauf“', () => {
    expect(overallWinnerWord(4, 4, 'tie')).toBe('gleichauf');
  });
});
