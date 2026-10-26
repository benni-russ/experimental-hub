import { describe, expect, it } from 'vitest';
import {
  ATTRIBUTES,
  DEFAULT_ID,
  START_EXPERIENCES,
  allVisitorKinds,
  decide,
  describeCondition,
  reach,
  type Experience,
} from './rules';
import { VISITORS, type VisitorTraits } from './visitors';

const T: VisitorTraits = { device: 'mobile', customer: 'new', source: 'search', cart: 'empty' };
const exp = (id: string, conditions: Experience['conditions']): Experience => ({ id, name: id, conditions });

describe('allVisitorKinds', () => {
  it('liefert 48 verschiedene Besucherarten', () => {
    const kinds = allVisitorKinds();
    expect(kinds).toHaveLength(48);
    expect(new Set(kinds.map((k) => JSON.stringify(k))).size).toBe(48);
  });
});

describe('ATTRIBUTES', () => {
  it('nutzt dieselben Werte wie VisitorTraits', () => {
    const kinds = allVisitorKinds();
    for (const a of ATTRIBUTES) {
      const used = new Set(kinds.map((k) => k[a.id]));
      expect(new Set(a.values.map((v) => v.value))).toEqual(used);
    }
  });
});

describe('describeCondition', () => {
  it('beschreibt is und isNot auf Deutsch', () => {
    expect(describeCondition({ attribute: 'device', operator: 'is', value: 'mobile' })).toBe('Gerät ist mobil');
    expect(describeCondition({ attribute: 'source', operator: 'isNot', value: 'search' })).toBe(
      'Quelle ist nicht Suche',
    );
  });
});

describe('decide', () => {
  it('ein Erlebnis ohne Bedingungen passt immer', () => {
    const r = decide([exp('a', [])], T, 'priority');
    expect(r.winnerId).toBe('a');
    expect(r.steps[0]?.matched).toBe(true);
  });

  it('isNot kehrt die Bedingung um', () => {
    const list = [exp('a', [{ attribute: 'source', operator: 'isNot', value: 'search' }])];
    expect(decide(list, T, 'priority').winnerId).toBe(DEFAULT_ID);
    expect(decide(list, { ...T, source: 'social' }, 'priority').winnerId).toBe('a');
  });

  it('leere Liste ergibt das Standarderlebnis', () => {
    const r = decide([], T, 'specificity');
    expect(r.winnerId).toBe(DEFAULT_ID);
    expect(r.steps).toEqual([]);
  });

  it('failedCondition ist die erste verletzte Bedingung', () => {
    const first = { attribute: 'device', operator: 'is', value: 'desktop' } as const;
    const second = { attribute: 'cart', operator: 'is', value: 'filled' } as const;
    const r = decide([exp('a', [{ attribute: 'customer', operator: 'is', value: 'new' }, first, second])], T, 'priority');
    expect(r.steps[0]).toEqual({ experienceId: 'a', matched: false, failedCondition: first });
  });

  it('steps enthält alle Erlebnisse, auch nach dem Gewinner', () => {
    const list = [exp('a', []), exp('b', [])];
    expect(decide(list, T, 'priority').steps.map((s) => s.experienceId)).toEqual(['a', 'b']);
  });

  it('priority nimmt das erste passende', () => {
    const list = [
      exp('a', [{ attribute: 'customer', operator: 'is', value: 'new' }]),
      exp('b', [
        { attribute: 'customer', operator: 'is', value: 'new' },
        { attribute: 'device', operator: 'is', value: 'mobile' },
      ]),
    ];
    expect(decide(list, T, 'priority').winnerId).toBe('a');
  });

  it('specificity nimmt das mit den meisten Bedingungen, bei Gleichstand das frühere', () => {
    const list = [
      exp('a', [{ attribute: 'customer', operator: 'is', value: 'new' }]),
      exp('b', [
        { attribute: 'customer', operator: 'is', value: 'new' },
        { attribute: 'device', operator: 'is', value: 'mobile' },
      ]),
      exp('c', [
        { attribute: 'source', operator: 'is', value: 'search' },
        { attribute: 'cart', operator: 'is', value: 'empty' },
      ]),
    ];
    expect(decide(list, T, 'specificity').winnerId).toBe('b');
  });
});

describe('reach', () => {
  it('Siege (inkl. Standard) ergeben 48', () => {
    for (const s of ['priority', 'specificity'] as const) {
      const r = reach(START_EXPERIENCES, s);
      const total = Object.values(r).reduce((sum, x) => sum + x.wins, 0);
      expect(total).toBe(48);
      expect(r[DEFAULT_ID]).toBeDefined();
    }
  });

  it('widersprüchliche Bedingungen erreichen niemanden', () => {
    const list = [
      exp('x', [
        { attribute: 'device', operator: 'is', value: 'mobile' },
        { attribute: 'device', operator: 'is', value: 'desktop' },
      ]),
    ];
    expect(reach(list, 'priority').x).toEqual({ matches: 0, wins: 0 });
    expect(reach(list, 'specificity').x).toEqual({ matches: 0, wins: 0 });
  });
});

describe('Startstand', () => {
  it('hat 4 Erlebnisse', () => {
    expect(START_EXPERIENCES).toHaveLength(4);
  });

  it('genau ein Erlebnis wird unter priority verdeckt, gewinnt aber unter specificity', () => {
    const byPriority = reach(START_EXPERIENCES, 'priority');
    const bySpecificity = reach(START_EXPERIENCES, 'specificity');
    const shadowed = START_EXPERIENCES.filter((e) => (byPriority[e.id]?.matches ?? 0) > 0 && byPriority[e.id]?.wins === 0);
    expect(shadowed).toHaveLength(1);
    expect(bySpecificity[shadowed[0]?.id ?? '']?.wins).toBeGreaterThan(0);
  });

  it('Reichweite unter priority: passt / gewinnt je Erlebnis', () => {
    const r = reach(START_EXPERIENCES, 'priority');
    const table = Object.fromEntries(Object.entries(r).map(([id, v]) => [id, [v.matches, v.wins]]));
    expect(table).toEqual({
      [DEFAULT_ID]: [48, 8],
      'cart-reminder': [24, 24],
      'free-shipping': [24, 12],
      'app-hint': [16, 4],
      'newsletter-discount': [6, 0],
    });
  });

  it('Reichweite unter specificity: passt / gewinnt je Erlebnis', () => {
    const r = reach(START_EXPERIENCES, 'specificity');
    const table = Object.fromEntries(Object.entries(r).map(([id, v]) => [id, [v.matches, v.wins]]));
    expect(table).toEqual({
      [DEFAULT_ID]: [48, 8],
      'cart-reminder': [24, 18],
      'free-shipping': [24, 12],
      'app-hint': [16, 4],
      'newsletter-discount': [6, 6],
    });
  });

  it('für mindestens einen der 6 Besucher unterscheidet sich der Gewinner', () => {
    const differs = VISITORS.some(
      (v) =>
        decide(START_EXPERIENCES, v.traits, 'priority').winnerId !==
        decide(START_EXPERIENCES, v.traits, 'specificity').winnerId,
    );
    expect(differs).toBe(true);
  });
});
