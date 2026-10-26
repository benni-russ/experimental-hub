import { describe, expect, it } from 'vitest';
import { inverseStandardNormal } from '../../stats/normal';
import { allText, checkStructure } from '../contentChecks';
import { applyCause, measuredUplift } from './causes';
import { SRM_THRESHOLD, srmTest } from './srm';
import { meta } from './content';

const text = allText(meta);
const even = (visitorsA: number, visitorsB: number) => srmTest({ visitorsA, visitorsB, plannedShareA: 50 })!;

describe('A-003 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 4, reflection: [2, 3], cards: [6, 8] })).toEqual([]);
  });
});

describe('A-003 Inhalte: zitierte Zahlen', () => {
  it('Schwelle: 50.521 schlägt an, 50.520 nicht', () => {
    expect(even(50521, 49479).mismatch).toBe(true);
    expect(even(50520, 49480).mismatch).toBe(false);
    expect(text).toContain('50.521');
    expect(text).toContain('49.479');
  });

  it('Schätzantwort 520 folgt aus der Schwelle', () => {
    const q = meta.quiz.find((x) => x.id === 'A-003-quiz-01');
    const expected = Math.round(inverseStandardNormal(1 - SRM_THRESHOLD / 2) * Math.sqrt(100000 * 0.25));
    expect(q?.type === 'estimate' && q.answer).toBe(expected);
    expect(expected).toBe(520);
  });

  it('Einstieg 50.600 zu 49.400: p ≈ 0,00015', () => {
    expect(even(50600, 49400).pValue.toFixed(5)).toBe('0.00015');
    expect(text).toContain('50.600');
    expect(text).toContain('49.400');
    expect(text).toContain('0,00015');
  });

  it('5 % Verlust durch Weiterleitung: B wirkt 4,2 % besser', () => {
    const uplift = measuredUplift(applyCause('redirect', 0.05));
    expect((Math.round(uplift * 10) / 10).toString().replace('.', ',')).toBe('4,2');
    expect(text).toContain('4,2 %');
  });
});
