import { describe, expect, it } from 'vitest';
import { differenceInterval, twoProportionZTest } from '../../stats/proportions';
import { allText, checkStructure } from '../contentChecks';
import { meta } from './content';

const text = allText(meta);
const round2 = (v: number) => Math.round(v * 100) / 100;
const de = (v: number) => String(v).replace('.', ',').replace('-', '−');

const intro = { visitorsA: 10000, conversionsA: 1000, visitorsB: 10000, conversionsB: 1100 };
const wide = { visitorsA: 50000, conversionsA: 5000, visitorsB: 50000, conversionsB: 5150 };

describe('A-002 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 4, reflection: [2, 3], cards: [6, 8] })).toEqual([]);
  });
});

describe('A-002 Inhalte: zitierte Zahlen', () => {
  it('10 % gegen 11 %, je 10.000: ±0,85, Intervall 0,15 bis 1,85', () => {
    const r = differenceInterval(intro, 0.95)!;
    const half = round2((r.upper - r.lower) / 2);
    expect(half).toBe(0.85);
    expect(round2(r.lower)).toBe(0.15);
    expect(round2(r.upper)).toBe(1.85);
    expect(text).toContain('±0,85');
    expect(text).toContain('0,15');
    expect(text).toContain('1,85');
  });

  it('Schätzfrage: answer ist die gerundete halbe Breite', () => {
    const r = differenceInterval(intro, 0.95)!;
    const q = meta.quiz.find((x) => x.id === 'A-002-quiz-01');
    expect(q?.type === 'estimate' && q.answer).toBe(round2((r.upper - r.lower) / 2));
  });

  it('Einstiegsbeispiel ist signifikant (0 liegt außerhalb)', () => {
    expect(twoProportionZTest(intro)!.pValue).toBeLessThan(0.05);
    expect(differenceInterval(intro, 0.95)!.lower).toBeGreaterThan(0);
  });

  it('50.000 je Seite, 10 % → 10,3 %, 99 %: −0,19 bis 0,79', () => {
    const r = differenceInterval(wide, 0.99)!;
    expect(round2(r.lower)).toBe(-0.19);
    expect(round2(r.upper)).toBe(0.79);
    expect(text).toContain(de(round2(r.lower)));
    expect(text).toContain(de(round2(r.upper)));
    expect(twoProportionZTest(wide)!.pValue).toBeGreaterThan(0.01);
  });

  it('viermal so viele Besucher halbieren die Breite', () => {
    const small = differenceInterval(intro, 0.95)!;
    const big = differenceInterval(
      { visitorsA: 40000, conversionsA: 4000, visitorsB: 40000, conversionsB: 4400 },
      0.95,
    )!;
    expect((small.upper - small.lower) / (big.upper - big.lower)).toBeCloseTo(2, 9);
    expect(round2((big.upper - big.lower) / 2)).toBe(0.42);
    expect(text).toContain('±0,42');
  });
});
