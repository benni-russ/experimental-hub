import { describe, expect, it } from 'vitest';
import { codeTasksTitle } from './codeTasksTitle';

describe('codeTasksTitle', () => {
  it('Einzahl bei einer Aufgabe, sonst Mehrzahl', () => {
    expect(codeTasksTitle(1)).toBe('Code-Aufgabe');
    expect(codeTasksTitle(2)).toBe('Code-Aufgaben');
    expect(codeTasksTitle(3)).toBe('Code-Aufgaben');
  });
});
