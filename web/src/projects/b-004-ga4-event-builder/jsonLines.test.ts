import { describe, expect, it } from 'vitest';
import { BROKEN, VALID_PURCHASE } from './fixtures';
import { findLine, jsonLines } from './jsonLines';
import { validateEvent } from './validateEvent';

describe('jsonLines', () => {
  it('ergibt Zeile für Zeile dasselbe wie JSON.stringify mit zwei Leerzeichen', () => {
    for (const v of [VALID_PURCHASE, ...Object.values(BROKEN), { a: [], b: {}, c: null, d: [1, [2]] }, 'x', 1]) {
      expect(
        jsonLines(v)
          .map((l) => l.text)
          .join('\n'),
      ).toBe(JSON.stringify(v, null, 2));
    }
  });

  it('kennt zu jeder Zeile den Pfad im Schreibstil von validateEvent', () => {
    const lines = jsonLines(VALID_PURCHASE);
    const at = (path: string) => lines[findLine(lines, path)]?.text.trim();
    expect(at('event')).toBe('"event": "purchase",');
    expect(at('ecommerce.currency')).toBe('"currency": "EUR",');
    expect(at('ecommerce.items')).toBe('"items": [');
    expect(at('ecommerce.items[1].price')).toBe('"price": 9.99,');
    expect(at('ecommerce.items[0]')).toBe('{');
  });

  it('fehlt die Stelle, zeigt sie auf das nächste vorhandene Elternteil', () => {
    const lines = jsonLines(BROKEN['currency-missing']);
    expect(lines[findLine(lines, 'ecommerce.currency')]?.text.trim()).toBe('"ecommerce": {');
    expect(findLine(lines, '')).toBe(0);
    expect(findLine(jsonLines(null), 'event')).toBe(0);
  });

  it('jedes Issue der kaputten Beispiele trifft genau seine Zeile', () => {
    for (const event of Object.values(BROKEN)) {
      const lines = jsonLines(event);
      for (const issue of validateEvent(event)) {
        if (issue.code === 'currency_missing' || issue.code === 'transaction_id_missing') continue;
        expect(lines[findLine(lines, issue.path)]?.path).toBe(issue.path);
      }
    }
  });
});
