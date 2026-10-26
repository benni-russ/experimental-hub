import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { Check, CheckModule } from '../../../codeTask/types';

type Fn = (...args: unknown[]) => unknown;

interface Item {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
}

const cup: Item = { item_id: 'SKU-101', item_name: 'Kaffeebecher', price: 12.5, quantity: 1 };
const tin: Item = { item_id: 'SKU-205', item_name: 'Teedose', price: 9.99, quantity: 1 };
const strainer: Item = { item_id: 'SKU-310', item_name: 'Teesieb', price: 4.5, quantity: 1 };

/** Jede Prüfung bekommt frische Objekte, damit ein veränderter Zustand nicht in die nächste rutscht. */
const cart = (...items: Item[]) => ({ items: items.map((i) => ({ ...i })) });

function fn(exports: Record<string, unknown>, name: 'eventReducer' | 'toEvent'): Fn {
  const value = exports[name];
  if (typeof value !== 'function') {
    throw new CheckFailure(`\`${name}\` soll eine Funktion sein, ist aber ${formatValue(value)}.`);
  }
  return value as Fn;
}

function reduce(exports: Record<string, unknown>, state: unknown, action: unknown): unknown {
  return fn(exports, 'eventReducer')(state, action);
}

function itemsOf(result: unknown): unknown {
  if (typeof result !== 'object' || result === null || !Array.isArray((result as { items?: unknown }).items)) {
    throw new CheckFailure(`Der Reducer soll einen Zustand \`{ items }\` zurückgeben, liefert aber ${formatValue(result)}.`);
  }
  return (result as { items: unknown }).items;
}

function reducerCheck(name: string, state: () => object, action: object, expected: Item[]): Check {
  return {
    name,
    run({ exports }) {
      expectEqual(itemsOf(reduce(exports, state(), action)), expected, 'items');
    },
  };
}

function eventOf(exports: Record<string, unknown>, state: object) {
  const event = fn(exports, 'toEvent')(state) as { event?: unknown; ecommerce?: Record<string, unknown> } | null;
  if (typeof event !== 'object' || event === null || typeof event.ecommerce !== 'object' || event.ecommerce === null) {
    throw new CheckFailure(`\`toEvent\` soll ein Objekt mit \`event\` und \`ecommerce\` liefern, liefert aber ${formatValue(event)}.`);
  }
  return event as { event: unknown; ecommerce: Record<string, unknown> };
}

/** Aktionen, nach denen der alte Zustand unverändert sein muss */
const IMMUTABLE_CASES: [string, object][] = [
  ['add (neu)', { type: 'add', item: { ...strainer } }],
  ['add (gleiche item_id)', { type: 'add', item: { ...cup, quantity: 2 } }],
  ['remove', { type: 'remove', item_id: cup.item_id }],
  ['setQuantity', { type: 'setQuantity', item_id: tin.item_id, quantity: 5 }],
  ['setQuantity 0', { type: 'setQuantity', item_id: tin.item_id, quantity: 0 }],
];

const module: CheckModule = {
  exportsNeeded: ['eventReducer', 'toEvent'],
  checks: [
    reducerCheck('`add` in einen leeren Warenkorb: ein Item', () => cart(), { type: 'add', item: { ...cup } }, [cup]),
    reducerCheck('`add` mit neuer `item_id`: hinten angehängt', () => cart(cup), { type: 'add', item: { ...tin } }, [cup, tin]),
    reducerCheck(
      '`add` mit gleicher `item_id`: Menge addiert, keine zweite Zeile',
      () => cart(cup, tin),
      { type: 'add', item: { ...cup, quantity: 2 } },
      [{ ...cup, quantity: 3 }, tin],
    ),
    reducerCheck('`remove`: das Item fällt weg', () => cart(cup, tin), { type: 'remove', item_id: cup.item_id }, [tin]),
    reducerCheck(
      '`setQuantity`: neue Menge',
      () => cart(cup, tin),
      { type: 'setQuantity', item_id: tin.item_id, quantity: 4 },
      [cup, { ...tin, quantity: 4 }],
    ),
    reducerCheck(
      '`setQuantity` mit `0`: das Item fällt weg',
      () => cart(cup, tin),
      { type: 'setQuantity', item_id: cup.item_id, quantity: 0 },
      [tin],
    ),
    {
      name: 'Eine unbekannte Aktion gibt den Zustand unverändert zurück',
      run({ exports }) {
        expectEqual(reduce(exports, cart(cup), { type: 'clear' }), cart(cup), 'Zustand');
      },
    },
    {
      name: 'Der alte Zustand bleibt bei jeder Aktion gleich',
      run({ exports }) {
        for (const [label, action] of IMMUTABLE_CASES) {
          const state = cart(cup, tin);
          reduce(exports, state, structuredClone(action));
          expectEqual(state, cart(cup, tin), `alter Zustand nach ${label}`);
        }
      },
    },
    {
      name: '`toEvent`: Event hat Namen `add_to_cart`, Währung `EUR` und die Items',
      run({ exports }) {
        const event = eventOf(exports, cart(cup, tin));
        expectEqual(event.event, 'add_to_cart', 'event');
        expectEqual(event.ecommerce.currency, 'EUR', 'ecommerce.currency');
        expectEqual(event.ecommerce.items, [cup, tin], 'ecommerce.items');
      },
    },
    {
      name: '`toEvent`: `value` ist die Summe aus `price * quantity`',
      run({ exports }) {
        // 2 × 12,50 + 1 × 9,99 + 3 × 4,50
        const event = eventOf(exports, cart({ ...cup, quantity: 2 }, tin, { ...strainer, quantity: 3 }));
        expectEqual(event.ecommerce.value, 48.49, 'ecommerce.value');
      },
    },
    {
      name: '`toEvent`: `value` auf Cent gerundet',
      run({ exports }) {
        // 3 × 0,10 ist in Gleitkomma 0.30000000000000004.
        const event = eventOf(exports, cart({ item_id: 'SKU-400', item_name: 'Teebeutel', price: 0.1, quantity: 3 }));
        expectEqual(event.ecommerce.value, 0.3, 'ecommerce.value');
      },
    },
    {
      name: '`toEvent` lässt den Zustand unverändert',
      run({ exports }) {
        const state = cart(cup, tin);
        eventOf(exports, state);
        expectEqual(state, cart(cup, tin), 'Zustand nach toEvent');
      },
    },
  ],
};

export default module;
