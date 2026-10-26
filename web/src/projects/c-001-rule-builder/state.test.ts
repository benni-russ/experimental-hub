import { describe, expect, it } from 'vitest';
import { ATTRIBUTES, START_EXPERIENCES } from '../../personalization/rules';
import { ruleReducer } from './state';

const ids = (list: { id: string }[]) => list.map((e) => e.id);

describe('ruleReducer', () => {
  it('verschiebt ein Erlebnis nach oben und unten', () => {
    const up = ruleReducer(START_EXPERIENCES, { type: 'move', id: 'app-hint', direction: 'up' });
    expect(ids(up)).toEqual(['cart-reminder', 'app-hint', 'free-shipping', 'newsletter-discount']);
    const down = ruleReducer(up, { type: 'move', id: 'app-hint', direction: 'down' });
    expect(ids(down)).toEqual(ids(START_EXPERIENCES));
  });

  it('lässt die Ränder der Liste stehen', () => {
    expect(ruleReducer(START_EXPERIENCES, { type: 'move', id: 'cart-reminder', direction: 'up' })).toBe(START_EXPERIENCES);
    expect(ruleReducer(START_EXPERIENCES, { type: 'move', id: 'newsletter-discount', direction: 'down' })).toBe(START_EXPERIENCES);
  });

  it('fügt eine Bedingung hinzu, ohne die Vorlage zu verändern', () => {
    const next = ruleReducer(START_EXPERIENCES, { type: 'addCondition', id: 'app-hint' });
    expect(next.find((e) => e.id === 'app-hint')?.conditions).toHaveLength(2);
    expect(START_EXPERIENCES.find((e) => e.id === 'app-hint')?.conditions).toHaveLength(1);
    const added = next.find((e) => e.id === 'app-hint')?.conditions[1];
    // Die neue Bedingung ist gültig: Merkmal und Wert gibt es.
    const attr = ATTRIBUTES.find((a) => a.id === added?.attribute);
    expect(attr?.values.map((v) => v.value)).toContain(added?.value);
  });

  it('entfernt eine Bedingung, auch die letzte', () => {
    const next = ruleReducer(START_EXPERIENCES, { type: 'removeCondition', id: 'newsletter-discount', index: 0 });
    expect(next.find((e) => e.id === 'newsletter-discount')?.conditions).toEqual([
      { attribute: 'cart', operator: 'is', value: 'filled' },
    ]);
    const empty = ruleReducer(next, { type: 'removeCondition', id: 'newsletter-discount', index: 0 });
    expect(empty.find((e) => e.id === 'newsletter-discount')?.conditions).toEqual([]);
  });

  it('ändert Operator und Wert; ein neues Merkmal bekommt dessen ersten Wert', () => {
    const op = ruleReducer(START_EXPERIENCES, { type: 'changeCondition', id: 'app-hint', index: 0, patch: { operator: 'isNot' } });
    expect(op.find((e) => e.id === 'app-hint')?.conditions[0]).toEqual({ attribute: 'device', operator: 'isNot', value: 'mobile' });
    const attr = ruleReducer(START_EXPERIENCES, { type: 'changeCondition', id: 'app-hint', index: 0, patch: { attribute: 'source' } });
    expect(attr.find((e) => e.id === 'app-hint')?.conditions[0]).toEqual({ attribute: 'source', operator: 'is', value: 'newsletter' });
  });

  it('setzt auf den Startstand zurück', () => {
    const changed = ruleReducer(START_EXPERIENCES, { type: 'move', id: 'app-hint', direction: 'up' });
    expect(ruleReducer(changed, { type: 'reset' })).toEqual(START_EXPERIENCES);
  });
});
