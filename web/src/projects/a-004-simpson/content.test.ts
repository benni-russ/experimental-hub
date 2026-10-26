import { describe, expect, it } from 'vitest';
import { allText, checkStructure } from '../contentChecks';
import { meta } from './content';
import { MOBILE_SHARE_A, SEGMENT_RATES, compare, overallRate, tippingPoint } from './simpson';

const text = allText(meta);
const de = (v: number, digits: number) => v.toFixed(digits).replace('.', ',');

describe('A-004 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 4, reflection: [2, 3], cards: [6, 8] })).toEqual([]);
  });
});

describe('A-004 Inhalte: zitierte Zahlen', () => {
  it('Schätzantwort 62 folgt aus dem Kipppunkt', () => {
    const q = meta.quiz.find((x) => x.id === 'A-004-quiz-01');
    expect(q?.type === 'estimate' && q.answer).toBe(Math.round(tippingPoint()));
    expect(q?.type === 'estimate' && q.tolerance).toBe(0.1);
    expect(q?.type === 'estimate' && q.unit).toBe('% Mobil-Anteil');
  });

  it('Kipppunkt 61,9 und die Rechnung (6,6 − 4,0) / (6,6 − 2,4)', () => {
    expect(de(tippingPoint(), 1)).toBe('61,9');
    expect(text).toContain('61,9');
    const { desktop, mobile } = SEGMENT_RATES.B;
    const overallA = overallRate(SEGMENT_RATES.A, MOBILE_SHARE_A);
    expect(text).toContain(`(${de(desktop, 1)} − ${de(overallA, 1)}) / (${de(desktop, 1)} − ${de(mobile, 1)})`);
  });

  it('A insgesamt 4,0 %', () => {
    expect(compare(50).overallA).toBeCloseTo(4.0, 10);
    expect(text).toContain('4,0 %');
  });

  it('Beispiel bei 70 % Mobil: B 3,66 %, Paradox', () => {
    const r = compare(70);
    expect(de(r.overallB, 2)).toBe('3,66');
    expect(r.paradox).toBe(true);
    expect(text).toContain('3,66 %');
    expect(text).toContain(`0,7 · ${de(SEGMENT_RATES.B.mobile, 1)} + 0,3 · ${de(SEGMENT_RATES.B.desktop, 1)}`);
  });

  it('Segmentraten aus den Texten: 2,0, 6,0, 2,4, 6,6', () => {
    for (const v of [2.0, 6.0, 2.4, 6.6]) expect(text).toContain(de(v, 1));
  });
});
