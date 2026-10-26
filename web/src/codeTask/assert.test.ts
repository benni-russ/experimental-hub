import { describe, expect, it } from 'vitest';
import { CheckFailure, expectEqual, formatValue } from './assert';

describe('formatValue', () => {
  it('zeigt undefined und Funktionen lesbar', () => {
    expect(formatValue(undefined)).toBe('undefined');
    expect(formatValue(() => 1)).toBe('[Funktion]');
  });
  it('kürzt lange Werte mit Auslassungszeichen', () => {
    const text = formatValue('a'.repeat(500));
    expect(text.length).toBe(200);
    expect(text.endsWith('…')).toBe(true);
  });
  it('formatiert Objekte JSON-ähnlich und Fehler lesbar', () => {
    expect(formatValue({ a: [1, 2] })).toBe('{"a":[1,2]}');
    expect(formatValue(new Error('x'))).toBe('Error: x');
  });
});

describe('expectEqual', () => {
  it('vergleicht Arrays und Objekte tief', () => {
    expect(() => expectEqual([1, { a: 2 }], [1, { a: 2 }])).not.toThrow();
  });
  it('wirft CheckFailure mit erwartet/bekommen', () => {
    expect(() => expectEqual(5, 6)).toThrow(CheckFailure);
    expect(() => expectEqual([1], [2], 'f(1)')).toThrow(/f\(1\).*erwartet \[2\].*bekommen \[1\]/);
  });
});
