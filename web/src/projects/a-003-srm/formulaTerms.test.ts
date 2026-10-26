import { describe, expect, it } from 'vitest';
import { formatSignificant, formatSigned } from '../../learning/numbers';
import { formatCount } from './format';
import { EXAMPLE, srmTerms } from './formulaTerms';
import { srmTest } from './srm';

const r = srmTest(EXAMPLE)!;
const terms = srmTerms(EXAMPLE, r);

describe('srmTerms', () => {
  it('nennt Erwartung und beide χ²-Summanden aus derselben Rechnung', () => {
    expect(terms.expected.value).toContain(formatCount(r.expectedA));
    expect(terms.devA.value).toContain(formatSignificant((EXAMPLE.visitorsA - r.expectedA) ** 2 / r.expectedA));
    expect(terms.devB.value).toContain(formatSignificant((EXAMPLE.visitorsB - r.expectedB) ** 2 / r.expectedB));
    expect(terms.devB.value).toContain(formatSigned(EXAMPLE.visitorsB - r.expectedB));
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
