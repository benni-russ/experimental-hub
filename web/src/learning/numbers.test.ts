import { describe, expect, it } from 'vitest';
import { formatDifference, formatNumber, formatSignificant, formatSigned, isWhole, parseGermanNumber } from './numbers';

describe('parseGermanNumber', () => {
  it.each([
    ['14751', 14751],
    ['14.751', 14751],
    ['15 000', 15000],
    ['14751,5', 14751.5],
    [' 3 ', 3],
    ['1.234.567', 1234567],
    ['-2,5', -2.5],
    ['3.5', 3.5],
    ['14.75', 14.75],
    ['15 000', 15000],
  ])('%s → %d', (i, o) => expect(parseGermanNumber(i)).toBe(o));

  it.each(['', 'viele', '1,2,3', '12abc', '   ', '1e999'])('%s → null', (i) =>
    expect(parseGermanNumber(i)).toBeNull(),
  );
});

describe('formatNumber', () => {
  it('Tausenderpunkt', () => expect(formatNumber(14751)).toBe('14.751'));
  it('Dezimalkomma mit Stellen', () => expect(formatNumber(14751.5, 1)).toBe('14.751,5'));
  it('rundet auf die Stellen', () => expect(formatNumber(2.345, 2)).toBe('2,35'));
});

describe('isWhole', () => {
  it('ganze Zahl und Rundungsrest', () => {
    expect(isWhole(2)).toBe(true);
    expect(isWhole(0.1 + 0.2 - 0.3 + 3)).toBe(true);
    expect(isWhole(2.5)).toBe(false);
  });
});

describe('formatSigned', () => {
  it('echtes Minuszeichen, kein Plus', () => {
    expect(formatSigned(-0.19, 2)).toBe('−0,19');
    expect(formatSigned(0.79, 2)).toBe('0,79');
    expect(formatSigned(-1250)).toBe('−1.250');
  });
});

describe('formatDifference', () => {
  it('Plus für positive, echtes Minus für negative Unterschiede', () => {
    expect(formatDifference(1, 2)).toBe('+1,00');
    expect(formatDifference(-0.19, 2)).toBe('−0,19');
  });

  it('gerundet null: ohne Vorzeichen', () => {
    expect(formatDifference(0, 2)).toBe('0,00');
    expect(formatDifference(-0.001, 2)).toBe('0,00');
    expect(formatDifference(0.001, 2)).toBe('0,00');
  });
});

describe('formatSignificant', () => {
  it('fünf gültige Stellen, deutsch, echtes Minus', () => {
    expect(formatSignificant(0.0043347)).toBe('0,0043347');
    expect(formatSignificant(14.40012)).toBe('14,4');
    expect(formatSignificant(-0.0019196543)).toBe('−0,0019197');
    expect(formatSignificant(1.959964, 3)).toBe('1,96');
  });
});
