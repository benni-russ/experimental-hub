import { describe, expect, it } from 'vitest';
import { formatSignificant, formatSigned } from '../../learning/numbers';
import { differenceInterval } from '../../stats/proportions';
import { ciTerms } from './formulaTerms';
import { START_FIELDS, validateCounts } from './validate';

const { counts } = validateCounts(START_FIELDS);
const r = differenceInterval(counts!, 0.95)!;
const terms = ciTerms(r, counts, 0.95);

describe('ciTerms', () => {
  it('nennt z, Unterschied und Streuanteile aus derselben Rechnung', () => {
    expect(terms.z.value).toContain(formatSignificant(r.z));
    expect(terms.diff.value).toContain(formatSigned(r.difference, 2));
    expect(terms.diff.value).toContain('Prozentpunkte');
    // Anteile links, Zwischenstufe als Anteil, erst dann die Umrechnung in Prozentpunkte
    expect(terms.diff.value).toBe(`0,11 − 0,1 = 0,01 = ${formatSigned(r.difference, 2)} Prozentpunkte`);
    expect(terms.varA.value).toContain('10.000');
    expect(terms.varA.value).toContain(formatSignificant((0.1 * 0.9) / 10000));
    expect(terms.varB.value).toContain(formatSignificant((0.11 * 0.89) / 10000));
  });

  it('verknüpft jeden Term mit seinem Feld', () => {
    expect(Object.fromEntries(Object.entries(terms).map(([k, t]) => [k, t.control]))).toEqual({
      diff: 'counts',
      z: 'level',
      varA: 'a',
      varB: 'b',
    });
  });

  it('zeigt bei ungültigen Eingaben überall „–“ und behält die Erklärungen', () => {
    const empty = ciTerms(null, null, 0.95);
    for (const [id, t] of Object.entries(empty)) {
      expect(t.value, id).toBe('–');
      expect(t.explanation, id).toBe(terms[id as keyof typeof terms].explanation);
    }
  });

  it('erklärt jeden Term in höchstens zwei Sätzen', () => {
    for (const [id, t] of Object.entries(terms)) {
      const sentences = t.explanation.split(/[.!?](\s|$)/).filter((s) => s.trim() !== '');
      expect(t.explanation.trim(), id).not.toBe('');
      expect(sentences.length, id).toBeLessThanOrEqual(2);
    }
  });
});
