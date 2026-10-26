import { describe, expect, it } from 'vitest';
import { allText, checkStructure } from '../contentChecks';
import { meta } from './content';
import { standardError } from './standardError';

const text = allText(meta);
const round2 = (v: number) => Math.round(v * 100) / 100;
const de = (v: number) => String(v).replace('.', ',');

describe('A-002.1 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 0, reflection: [1, 2], cards: [3, 5] })).toEqual([]);
  });

  it('hängt als Einheit an A-002', () => {
    expect(meta.kind).toBe('unit');
    expect(meta.attachedTo).toBe('A-002');
  });
});

describe('A-002.1 Inhalte: zitierte Zahlen', () => {
  it('Standardfehler einer 10-%-Rate: 0,95 bei 1.000, 0,47 bei 4.000', () => {
    const at1000 = round2(Math.sqrt((0.1 * 0.9) / 1000) * 100);
    const at4000 = round2(Math.sqrt((0.1 * 0.9) / 4000) * 100);
    expect(at1000).toBe(0.95);
    expect(at4000).toBe(0.47);
    expect(text).toContain(de(at1000));
    expect(text).toContain(de(at4000));
  });

  it('die Hilfsfunktion der Zeichnung rechnet dasselbe', () => {
    expect(round2(standardError(0.1, 1000))).toBe(0.95);
    expect(round2(standardError(0.1, 4000))).toBe(0.47);
  });

  it('viermal so viele Besucher halbieren den Standardfehler', () => {
    expect(standardError(0.1, 1000) / standardError(0.1, 4000)).toBeCloseTo(2, 9);
  });

  it('doppelt so viele Besucher: rund 29 % weniger', () => {
    const cut = 1 - standardError(0.1, 2000) / standardError(0.1, 1000);
    expect(Math.round(cut * 100)).toBe(29);
    expect(text).toContain('29 %');
  });

  it('bei 95 % Niveau rund 1 von 20', () => {
    expect(1 - 0.95).toBeCloseTo(1 / 20, 12);
    expect(text).toContain('1 von 20');
  });
});
