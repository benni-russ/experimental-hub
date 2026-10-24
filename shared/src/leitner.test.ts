import { describe, expect, it } from 'vitest';
import { dueDate, nextBox } from './leitner.js';

describe('nextBox', () => {
  it('rückt bei gewusst ein Fach weiter', () => expect(nextBox(1, true)).toBe(2));
  it('bleibt in Fach 5', () => expect(nextBox(5, true)).toBe(5));
  it('fällt bei nicht gewusst auf Fach 1', () => expect(nextBox(4, false)).toBe(1));
});

describe('dueDate', () => {
  const t = new Date('2026-10-24T08:00:00.000Z');
  it('Fach 1 → 1 Tag', () => expect(dueDate(1, t).toISOString()).toBe('2026-10-25T08:00:00.000Z'));
  it('Fach 2 → 3 Tage', () => expect(dueDate(2, t).toISOString()).toBe('2026-10-27T08:00:00.000Z'));
  it('Fach 5 → 30 Tage', () => expect(dueDate(5, t).toISOString()).toBe('2026-11-23T08:00:00.000Z'));
  it('lehnt Fach 0 und 6 ab', () => {
    expect(() => dueDate(0, t)).toThrow(RangeError);
    expect(() => dueDate(6, t)).toThrow(RangeError);
  });
  it('lehnt nicht ganzzahlige Fächer ab', () => {
    expect(() => dueDate(1.5, t)).toThrow(RangeError);
  });
});
