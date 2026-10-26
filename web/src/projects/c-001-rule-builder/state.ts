import { ATTRIBUTES, START_EXPERIENCES, type Attribute, type Condition, type Experience } from '../../personalization/rules';

export type RuleAction =
  | { type: 'move'; id: string; direction: 'up' | 'down' }
  | { type: 'addCondition'; id: string }
  | { type: 'removeCondition'; id: string; index: number }
  | { type: 'changeCondition'; id: string; index: number; patch: Partial<Condition> }
  | { type: 'reset' };

const firstValue = (attribute: Attribute) => ATTRIBUTES.find((a) => a.id === attribute)?.values[0]?.value ?? '';

function withConditions(list: Experience[], id: string, change: (c: Condition[]) => Condition[]): Experience[] {
  return list.map((e) => (e.id === id ? { ...e, conditions: change(e.conditions) } : e));
}

// Reiner Reducer über die Liste der Erlebnisse (Reihenfolge = Priorität).
export function ruleReducer(list: Experience[], action: RuleAction): Experience[] {
  switch (action.type) {
    case 'move': {
      const from = list.findIndex((e) => e.id === action.id);
      const to = action.direction === 'up' ? from - 1 : from + 1;
      if (from < 0 || to < 0 || to >= list.length) return list;
      const next = [...list];
      [next[from], next[to]] = [next[to]!, next[from]!];
      return next;
    }
    case 'addCondition':
      return withConditions(list, action.id, (c) => [
        ...c,
        { attribute: 'device', operator: 'is', value: firstValue('device') },
      ]);
    case 'removeCondition':
      return withConditions(list, action.id, (c) => c.filter((_, i) => i !== action.index));
    case 'changeCondition':
      return withConditions(list, action.id, (c) =>
        c.map((cond, i) => {
          if (i !== action.index) return cond;
          const next = { ...cond, ...action.patch };
          // Wechselt das Merkmal, passt der alte Wert nicht mehr: ersten Wert des neuen nehmen.
          return action.patch.attribute && action.patch.attribute !== cond.attribute && action.patch.value === undefined
            ? { ...next, value: firstValue(action.patch.attribute) }
            : next;
        }),
      );
    case 'reset':
      return START_EXPERIENCES;
  }
}
