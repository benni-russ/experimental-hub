import { describe, expect, it } from 'vitest';
import { standardNormalCdf } from '../../stats/normal';
import { differenceInterval, twoProportionZTest } from '../../stats/proportions';
import { allText, checkStructure } from '../contentChecks';
import { meta } from './content';

const text = allText(meta);
const counts = { visitorsA: 10000, conversionsA: 1000, visitorsB: 10000, conversionsB: 1100 };

describe('A-002.2 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 0, reflection: [1, 2], cards: [3, 5] })).toEqual([]);
  });

  it('hängt als Einheit an A-002', () => {
    expect(meta.kind).toBe('unit');
    expect(meta.attachedTo).toBe('A-002');
  });
});

describe('A-002.2 Inhalte: zitierte Zahlen', () => {
  it('flacher Prior, 10 % gegen 11 %, je 10.000: „B besser“ rund 99 %', () => {
    // Näherung: Der Unterschied ist normalverteilt um den gemessenen Wert, flacher Prior.
    const r = differenceInterval(counts, 0.95)!;
    const probabilityBBetter = standardNormalCdf(r.difference / r.standardError);
    expect(Math.round(probabilityBBetter * 100)).toBe(99);
    expect(text).toContain('rund 99 %');
  });

  it('beide Lesarten stimmen überein: einseitiger p-Wert ist etwa 1 − P(B besser)', () => {
    const r = differenceInterval(counts, 0.95)!;
    const probabilityBBetter = standardNormalCdf(r.difference / r.standardError);
    const oneSidedP = twoProportionZTest(counts)!.pValue / 2;
    expect(Math.abs(1 - probabilityBBetter - oneSidedP)).toBeLessThan(0.001);
  });

  it('der Text nennt außer 97 % (Beispiel) und 99 % keine weiteren Wahrscheinlichkeiten', () => {
    const percents = new Set(text.match(/\d+(?:,\d+)? %/g));
    expect([...percents].sort()).toEqual(['10 %', '11 %', '95 %', '97 %', '99 %'].sort());
  });
});
