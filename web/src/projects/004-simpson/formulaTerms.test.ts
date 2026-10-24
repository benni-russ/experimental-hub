import { describe, expect, it } from 'vitest';
import { formatNumber } from '../../learning/numbers';
import { simpsonTerms } from './formulaTerms';
import { MOBILE_SHARE_A, SEGMENT_RATES } from './simpson';

const terms = simpsonTerms();

describe('simpsonTerms', () => {
  it('nennt Anteile und Segmentraten von Variante A', () => {
    expect(terms.s.value).toContain(formatNumber(MOBILE_SHARE_A / 100, 1));
    expect(terms.rest.value).toContain(formatNumber(1 - MOBILE_SHARE_A / 100, 1));
    expect(terms.mobile.value).toContain(formatNumber(SEGMENT_RATES.A.mobile, 1));
    expect(terms.desktop.value).toContain(formatNumber(SEGMENT_RATES.A.desktop, 1));
  });

  it('hat keinen Regler', () => {
    for (const t of Object.values(terms)) expect(t.control).toBeUndefined();
  });

  it('erklärt jeden Term in höchstens zwei Sätzen', () => {
    for (const [id, t] of Object.entries(terms)) {
      const sentences = t.explanation.split(/[.!?](\s|$)/).filter((s) => s.trim() !== '');
      expect(t.explanation.trim(), id).not.toBe('');
      expect(sentences.length, id).toBeLessThanOrEqual(2);
    }
  });
});
