import { describe, expect, it } from 'vitest';
import { differenceInterval, type Counts } from '../../stats/proportions';
import { readingOf } from './reading';

const counts = (conversionsB: number): Counts => ({
  visitorsA: 10000,
  conversionsA: 1000,
  visitorsB: 10000,
  conversionsB,
});
const interval = (conversionsB: number, level = 0.95) => differenceInterval(counts(conversionsB), level)!;

describe('readingOf', () => {
  it('10.000/1.000 gegen 10.000/1.020, MDE 2: schließt 0 ein, kein 031-Verweis, kein „Der Unterschied ist da“', () => {
    const r = readingOf(interval(1020), 2, 0.95);
    expect(r.case).toBe('excluded');
    expect(r.significance).toContain('schließt 0 ein');
    expect(r.relevance).not.toContain('Der Unterschied ist da');
    expect(r.relevance).toContain('MDE von 2 Prozentpunkten');
    expect(r.linkSignificantRelevant).toBe(false);
  });

  it('Einstiegsbeispiel mit MDE 2: signifikant, aber zu klein, mit 031-Verweis', () => {
    const r = readingOf(interval(1100), 2, 0.95);
    expect(r.case).toBe('small');
    expect(r.significance).toContain('schließt 0 aus');
    expect(r.significance).toContain('Niveau 95 %');
    expect(r.linkSignificantRelevant).toBe(true);
  });

  it('Einstiegsbeispiel mit MDE 1: signifikant, MDE im Intervall, kein Verweis', () => {
    const r = readingOf(interval(1100), 1, 0.95);
    expect(r.case).toBe('significantOpen');
    expect(r.relevance).toContain('schließt den MDE von 1 Prozentpunkt ein');
    expect(r.linkSignificantRelevant).toBe(false);
  });

  it('Einstiegsbeispiel mit MDE 0,1: ganz über dem MDE', () => {
    const r = readingOf(interval(1100), 0.1, 0.95);
    expect(r.case).toBe('both');
    expect(r.relevance).toContain('MDE von 0,10 Prozentpunkten');
  });

  it('ohne MDE: kein Fall, kein Relevanzsatz', () => {
    const r = readingOf(interval(1100), null, 0.95);
    expect(r.case).toBeNull();
    expect(r.relevance).toBeNull();
    expect(r.linkSignificantRelevant).toBe(false);
  });

  it('99 %: schließt 0 ein', () => {
    expect(readingOf(interval(1100, 0.99), null, 0.99).significance).toContain('schließt 0 ein');
  });

  it('Intervall ganz unter 0: negativ signifikant, kein „zu klein“ und kein Verweis', () => {
    const r = readingOf(interval(880), 2, 0.95);
    expect(r.case).toBe('negative');
    expect(r.significance).toContain('ganz unter 0');
    expect(r.relevance).not.toContain('zu klein');
    expect(r.linkSignificantRelevant).toBe(false);
  });
});
