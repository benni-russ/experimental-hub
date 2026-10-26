import { describe, expect, it } from 'vitest';
import { FORBIDDEN, ROWS, roundTrip } from './roundTrip';

const row = (label: string) => {
  const r = ROWS.find((x) => x.label === label);
  if (!r) throw new Error(`Zeile ${label} fehlt`);
  return roundTrip(r.value());
};

describe('roundTrip', () => {
  it('undefined als Wert: kein JSON-Text', () => {
    expect(roundTrip(undefined)).toEqual({ json: undefined, back: undefined });
  });

  it('undefined in Objekt fällt weg, im Array wird es null', () => {
    expect(roundTrip({ a: undefined }).json).toBe('{}');
    expect(roundTrip([undefined]).json).toBe('[null]');
  });

  it('Funktion im Objekt fällt weg', () => {
    expect(roundTrip({ a: 1, f: () => 1 })).toEqual({ json: '{"a":1}', back: { a: 1 } });
  });

  it('Date wird zum String', () => {
    const r = roundTrip(new Date(Date.UTC(2026, 9, 26)));
    expect(r.json).toBe('"2026-10-26T00:00:00.000Z"');
    expect(r.back).toBe('2026-10-26T00:00:00.000Z');
  });

  it('NaN und Infinity werden null', () => {
    expect(roundTrip(NaN).json).toBe('null');
    expect(roundTrip(Infinity).json).toBe('null');
    expect(roundTrip(NaN).back).toBeNull();
  });

  it('Map wird zu {}', () => {
    expect(roundTrip(new Map([['a', 1]]))).toEqual({ json: '{}', back: {} });
  });

  it('0.1 + 0.2 behält alle Stellen', () => {
    const r = roundTrip(0.1 + 0.2);
    expect(r.json).toBe('0.30000000000000004');
    expect(r.back).toBe(0.1 + 0.2);
  });

  it('verschachteltes Objekt kommt unverändert zurück', () => {
    const v = { a: { b: [1, 'x', null, true] } };
    expect(roundTrip(v).back).toEqual(v);
  });
});

describe('ROWS', () => {
  it('jede Zeile hat Beschriftung, Quelltext und stimmt mit unabhängigem stringify überein', () => {
    expect(ROWS.length).toBeGreaterThanOrEqual(8);
    for (const r of ROWS) {
      expect(r.label).not.toBe('');
      expect(r.source).not.toBe('');
      expect(roundTrip(r.value()).json).toBe(JSON.stringify(r.value()));
    }
  });

  it('Labels sind eindeutig', () => {
    expect(new Set(ROWS.map((r) => r.label)).size).toBe(ROWS.length);
  });

  it('Zeilen für Date und Map zeigen die erwarteten Werte', () => {
    expect(row('Date').json).toBe('"2026-10-26T00:00:00.000Z"');
    expect(row('Map').json).toBe('{}');
  });
});

describe('FORBIDDEN: was JSON.parse ablehnt', () => {
  it('vier Beispiele, und JSON.parse wirft bei jedem', () => {
    expect(FORBIDDEN).toHaveLength(4);
    for (const f of FORBIDDEN) {
      expect(() => JSON.parse(f.text)).toThrow(SyntaxError);
    }
  });

  it('deckt Kommentar, Komma am Ende, einfache Anführungszeichen, Schlüssel ohne Anführungszeichen', () => {
    expect(FORBIDDEN.map((f) => f.text)).toEqual([
      '{ "a": 1 // Kommentar\n}',
      '{ "a": 1, }',
      "{ 'a': 1 }",
      '{ a: 1 }',
    ]);
  });
});
