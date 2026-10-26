// Regeln für Erlebnisse (Track C): Bedingungen, Entscheidung nach Strategie, Reichweite.
import type { VisitorTraits } from './visitors';

export type Attribute = keyof VisitorTraits;

export const ATTRIBUTES: { id: Attribute; label: string; values: { value: string; label: string }[] }[] = [
  {
    id: 'device',
    label: 'Gerät',
    values: [
      { value: 'mobile', label: 'mobil' },
      { value: 'desktop', label: 'Desktop' },
      { value: 'tablet', label: 'Tablet' },
    ],
  },
  {
    id: 'customer',
    label: 'Kundentyp',
    values: [
      { value: 'new', label: 'neu' },
      { value: 'returning', label: 'wiederkehrend' },
    ],
  },
  {
    id: 'source',
    label: 'Quelle',
    values: [
      { value: 'newsletter', label: 'Newsletter' },
      { value: 'search', label: 'Suche' },
      { value: 'social', label: 'Social' },
      { value: 'direct', label: 'direkt' },
    ],
  },
  {
    id: 'cart',
    label: 'Warenkorb',
    values: [
      { value: 'empty', label: 'leer' },
      { value: 'filled', label: 'gefüllt' },
    ],
  },
];

export interface Condition {
  attribute: Attribute;
  operator: 'is' | 'isNot';
  value: string;
}

export interface Experience {
  id: string;
  name: string;
  conditions: Condition[];
}

export type Strategy = 'priority' | 'specificity';

// Auffangerlebnis „Standard“: gehört nicht zur Liste, greift, wenn nichts passt.
export const DEFAULT_ID = 'default';

// Reihenfolge = Priorität. „Newsletter-Rabatt“ ist der Stolperstein: Wer ihn
// erfüllt, hat immer auch einen gefüllten Warenkorb und wird davor abgefangen.
export const START_EXPERIENCES: Experience[] = [
  {
    id: 'cart-reminder',
    name: 'Warenkorb-Erinnerung',
    conditions: [{ attribute: 'cart', operator: 'is', value: 'filled' }],
  },
  {
    id: 'free-shipping',
    name: 'Gratisversand für Neukunden',
    conditions: [{ attribute: 'customer', operator: 'is', value: 'new' }],
  },
  {
    id: 'app-hint',
    name: 'App-Hinweis für Mobil',
    conditions: [{ attribute: 'device', operator: 'is', value: 'mobile' }],
  },
  {
    id: 'newsletter-discount',
    name: 'Newsletter-Rabatt',
    conditions: [
      { attribute: 'source', operator: 'is', value: 'newsletter' },
      { attribute: 'cart', operator: 'is', value: 'filled' },
    ],
  },
];

export interface DecisionStep {
  experienceId: string;
  matched: boolean;
  failedCondition?: Condition;
}

function labelOf(attribute: Attribute, value: string): string {
  const attr = ATTRIBUTES.find((a) => a.id === attribute);
  return attr?.values.find((v) => v.value === value)?.label ?? value;
}

export function describeCondition(c: Condition): string {
  const attr = ATTRIBUTES.find((a) => a.id === c.attribute);
  const verb = c.operator === 'is' ? 'ist' : 'ist nicht';
  return `${attr?.label ?? c.attribute} ${verb} ${labelOf(c.attribute, c.value)}`;
}

function holds(c: Condition, traits: VisitorTraits): boolean {
  const equal = traits[c.attribute] === c.value;
  return c.operator === 'is' ? equal : !equal;
}

export function decide(
  list: Experience[],
  traits: VisitorTraits,
  strategy: Strategy,
): { winnerId: string; steps: DecisionStep[] } {
  const steps: DecisionStep[] = list.map((e) => {
    const failed = e.conditions.find((c) => !holds(c, traits));
    return failed
      ? { experienceId: e.id, matched: false, failedCondition: failed }
      : { experienceId: e.id, matched: true };
  });

  let winnerId = DEFAULT_ID;
  let bestSize = -1;
  list.forEach((e, i) => {
    if (!steps[i]?.matched) return;
    if (strategy === 'priority') {
      if (winnerId === DEFAULT_ID) winnerId = e.id;
    } else if (e.conditions.length > bestSize) {
      // „>“ statt „>=“: bei Gleichstand bleibt das frühere Erlebnis.
      bestSize = e.conditions.length;
      winnerId = e.id;
    }
  });
  return { winnerId, steps };
}

// Alle 48 Kombinationen der vier Merkmale (3 × 2 × 4 × 2).
export function allVisitorKinds(): VisitorTraits[] {
  const kinds: VisitorTraits[] = [];
  for (const device of ['mobile', 'desktop', 'tablet'] as const) {
    for (const customer of ['new', 'returning'] as const) {
      for (const source of ['newsletter', 'search', 'social', 'direct'] as const) {
        for (const cart of ['empty', 'filled'] as const) {
          kinds.push({ device, customer, source, cart });
        }
      }
    }
  }
  return kinds;
}

export function reach(list: Experience[], strategy: Strategy): Record<string, { matches: number; wins: number }> {
  const result: Record<string, { matches: number; wins: number }> = { [DEFAULT_ID]: { matches: 0, wins: 0 } };
  for (const e of list) result[e.id] = { matches: 0, wins: 0 };
  const kinds = allVisitorKinds();
  for (const traits of kinds) {
    const { winnerId, steps } = decide(list, traits, strategy);
    for (const s of steps) {
      const r = result[s.experienceId];
      if (s.matched && r) r.matches += 1;
    }
    const winner = result[winnerId];
    if (winner) winner.wins += 1;
  }
  // Das Standarderlebnis passt immer, gewinnt aber nur, wenn sonst nichts passt.
  const std = result[DEFAULT_ID];
  if (std) std.matches = kinds.length;
  return result;
}
