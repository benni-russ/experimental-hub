import { describe, expect, it } from 'vitest';
import { allText, checkStructure } from '../contentChecks';
import { projects } from '../index';
import { meta } from './content';
import { show } from './Explanation';
import { FORBIDDEN, ROWS, parseError, roundTrip } from './roundTrip';

describe('B-001.1 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 0, reflection: [1, 2], cards: [3, 5] })).toEqual([]);
  });

  it('hängt als Einheit an B-001 und steht direkt nach B-001 in der Registrierung', () => {
    expect(meta.kind).toBe('unit');
    expect(meta.attachedTo).toBe('B-001');
    const ids = projects.map((p) => p.meta.id);
    expect(ids.indexOf('B-001.1')).toBe(ids.indexOf('B-001') + 1);
    expect(ids.indexOf('B-001')).toBeGreaterThanOrEqual(0);
  });

  it('Texte nennen keine Zahlen und keine Backticks', () => {
    // Die Tabellenwerte stehen nur in Explanation und kommen aus roundTrip.
    expect(allText(meta)).not.toMatch(/\d/);
    expect(allText(meta)).not.toContain('`');
  });
});

describe('B-001.1 Aussagen der Karten stimmen mit echtem JSON überein', () => {
  it('undefined: Feld fällt weg, im Array null, allein kein Text', () => {
    expect(JSON.stringify({ a: undefined })).toBe('{}');
    expect(JSON.stringify([undefined])).toBe('[null]');
    expect(JSON.stringify(undefined)).toBeUndefined();
  });

  it('Date wird zum String', () => {
    const r = roundTrip(new Date(Date.UTC(2026, 9, 26)));
    expect(typeof r.back).toBe('string');
    expect(new Date(r.back as string).getTime()).toBe(Date.UTC(2026, 9, 26));
  });

  it('NaN, Infinity: null; Funktion fällt weg; Map: leeres Objekt', () => {
    expect(JSON.stringify([NaN, Infinity])).toBe('[null,null]');
    expect(JSON.stringify({ f: () => 1 })).toBe('{}');
    expect(JSON.stringify(new Map([['a', 1]]))).toBe('{}');
  });
});

describe('B-001.1 Tabelle und Fehlermeldungen', () => {
  it('jede Zeile: Text und Rückweg stimmen mit unabhängigem JSON überein', () => {
    for (const row of ROWS) {
      const { json, back } = roundTrip(row.value());
      const expected = JSON.stringify(row.value()) as string | undefined;
      expect(json).toBe(expected);
      expect(back).toEqual(expected === undefined ? undefined : JSON.parse(expected));
    }
  });

  it('show: undefined sichtbar, Strings in Anführungszeichen', () => {
    expect(show(undefined)).toBe('undefined');
    expect(show('x')).toBe('"x"');
    expect(show({ a: [1, null] })).toBe('{"a":[1,null]}');
  });

  it('die gezeigte Fehlermeldung ist die echte von JSON.parse', () => {
    for (const f of FORBIDDEN) {
      let real = '';
      try {
        JSON.parse(f.text);
      } catch (err) {
        real = (err as Error).message;
      }
      expect(real).not.toBe('');
      expect(parseError(f.text)).toBe(real);
    }
  });
});
