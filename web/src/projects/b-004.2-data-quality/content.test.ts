import { describe, expect, it } from 'vitest';
import { allText, checkStructure } from '../contentChecks';
import { projects } from '../index';
import { BROKEN, BROKEN_LABELS, VALID_PURCHASE } from '../b-004-ga4-event-builder/fixtures';
import { validateEvent } from '../b-004-ga4-event-builder/validateEvent';
import { meta } from './content';
import { CASES, CHECKLIST, fmt } from './cases';

describe('B-004.2 Inhalte: Aufbau', () => {
  it('Umfang und IDs stimmen', () => {
    expect(checkStructure(meta, { quiz: 0, reflection: [1, 2], cards: [3, 5] })).toEqual([]);
  });

  it('hängt als Einheit an B-004 und steht in der Registrierung nach B-004.1', () => {
    expect(meta.kind).toBe('unit');
    expect(meta.attachedTo).toBe('B-004');
    const ids = projects.map((p) => p.meta.id);
    expect(ids.indexOf('B-004.2')).toBe(ids.indexOf('B-004.1') + 1);
    expect(ids.indexOf('B-004.1')).toBe(ids.indexOf('B-004') + 1);
  });

  it('Texte nennen keine Zahlen (außer im Namen GA4)', () => {
    expect(allText(meta).replaceAll('GA4', '')).not.toMatch(/\d/);
  });
});

describe('B-004.2 Gezeigte kaputte Beispiele', () => {
  const expected: Record<keyof typeof BROKEN, string> = {
    'price-string': 'price_not_number',
    'currency-missing': 'currency_missing',
    'value-mismatch': 'value_mismatch',
    'name-dash': 'name_format',
    'purchase-no-id': 'transaction_id_missing',
  };

  it('jeder gezeigte Fall ist ein BROKEN-Fall und ergibt genau den genannten Code', () => {
    // Text und Überschrift sagen "fünf" (Intro, Tabelle).
    expect(CASES).toHaveLength(5);
    expect(CASES.map((c) => c.id).sort()).toEqual(Object.keys(BROKEN).sort());
    for (const c of CASES) {
      expect(c.id in BROKEN).toBe(true);
      expect(c.code).toBe(expected[c.id]);
      expect(validateEvent(BROKEN[c.id]).map((i) => i.code)).toEqual([expected[c.id]]);
      expect(BROKEN_LABELS[c.id]).toBeTruthy();
    }
  });

  it('der gültige Kauf, der als Vorbild dient, besteht', () => {
    expect(validateEvent(VALID_PURCHASE)).toEqual([]);
  });

  it('Zahl im Text: value enthält den Versand, 4,90 zu viel', () => {
    const diff = (BROKEN['value-mismatch'] as typeof VALID_PURCHASE).ecommerce.value - VALID_PURCHASE.ecommerce.value;
    expect(Math.round(diff * 100) / 100).toBe(4.9);
    expect(fmt(4.9)).toBe('4,90');
    expect(CASES.find((c) => c.id === 'value-mismatch')?.effect).toContain('4,90');
  });

  it('dataLayer.push ist ein Array-push und meldet nur die neue Länge', () => {
    const dataLayer: unknown[] = [];
    expect(dataLayer.push(BROKEN['price-string'])).toBe(1);
    expect(dataLayer).toHaveLength(1);
  });

  it('die Prüfliste hat mindestens fünf Punkte und deckt die fünf gezeigten Fehlercodes ab', () => {
    expect(CHECKLIST.length).toBeGreaterThanOrEqual(5);
    const codes = CHECKLIST.flatMap((c) => c.codes);
    expect(codes).toEqual(
      expect.arrayContaining(['name_format', 'currency_missing', 'value_mismatch', 'price_not_number', 'transaction_id_missing']),
    );
  });
});
