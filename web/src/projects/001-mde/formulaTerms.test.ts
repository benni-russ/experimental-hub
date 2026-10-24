import { describe, expect, it } from 'vitest';
import { formatSignificant } from '../../learning/numbers';
import { DEFAULTS } from './Assumptions';
import { exact, mdeTerms } from './formulaTerms';
import { calculateSampleSize } from './sampleSize';

const input = { baseline: DEFAULTS.baseline, mde: DEFAULTS.mde, alpha: DEFAULTS.alpha, power: DEFAULTS.power };
const r = calculateSampleSize(input)!;
const terms = mdeTerms(r, input);

describe('mdeTerms', () => {
  it('nennt die z-Werte, die Raten und den quadrierten Unterschied aus derselben Rechnung', () => {
    expect(terms.zAlpha.value).toContain(formatSignificant(r.zAlpha));
    expect(terms.zPower.value).toContain(formatSignificant(r.zPower));
    expect(terms.p1.value).toContain(`${exact(r.p1)} = 10 %`);
    expect(terms.p1.value).toContain('%');
    expect(terms.p2.value).toContain(`${exact(r.p2)} = 11 %`);
    expect(terms.delta.value).toContain(formatSignificant(r.difference ** 2));
    expect(terms.delta.value).toContain(`(${exact(r.difference)})²`);
  });

  it('verknüpft jeden Term mit seinem Regler', () => {
    expect(Object.fromEntries(Object.entries(terms).map(([k, t]) => [k, t.control]))).toEqual({
      zAlpha: 'alpha',
      zPower: 'power',
      p1: 'baseline',
      p2: 'mde',
      delta: 'mde',
    });
  });

  it('erklärt jeden Term in höchstens zwei Sätzen', () => {
    for (const [id, t] of Object.entries(terms)) {
      const sentences = t.explanation.split(/[.!?](\s|$)/).filter((s) => s.trim() !== '');
      expect(t.explanation.trim(), id).not.toBe('');
      expect(sentences.length, id).toBeLessThanOrEqual(2);
    }
  });
});
