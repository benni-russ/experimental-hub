import { describe, expect, it } from 'vitest';
import { allText, checkStructure } from '../contentChecks';
import { CASES, CASES_LABEL, caseOf } from './cases';
import { meta } from './content';

describe('031 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 0, reflection: [1, 2], cards: [3, 5] })).toEqual([]);
  });

  it('hängt als Einheit an 006', () => {
    expect(meta.kind).toBe('unit');
    expect(meta.attachedTo).toBe('006');
  });

  it('nennt keine ungeprüften Zahlen mit Prozentzeichen', () => {
    expect(allText(meta)).not.toMatch(/\d\s?%/);
  });
});

describe('031 Zeichnung: vier Fälle', () => {
  it('es gibt genau die vier Fälle', () => {
    expect(CASES.map((c) => c.id)).toEqual(['both', 'small', 'open', 'excluded']);
  });

  it('jedes Intervall der Zeichnung fällt in der gemeinsamen Klassifikation in seinen Fall', () => {
    for (const c of CASES) expect(caseOf(c)).toBe(c.id);
  });

  it('die vier Beschriftungen stimmen mit den Kartentexten überein', () => {
    const card = meta.cards.find((c) => c.id === '031-card-03')!.back.toLowerCase();
    for (const c of CASES) expect(card).toContain(c.label.toLowerCase());
  });

  it('die Beschreibung der Zeichnung nennt alle vier Fälle in Reihenfolge', () => {
    const positions = CASES.map((c) => CASES_LABEL.indexOf(c.label));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });
});
