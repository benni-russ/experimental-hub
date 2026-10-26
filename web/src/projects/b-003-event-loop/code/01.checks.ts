import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { CheckModule } from '../../../codeTask/types';
import { runSnippet, SNIPPETS } from '../traces';

/** So viele Ausgaben des gemischten Beispiels sind synchron: Start, vor await, Ende. */
const SYNC_COUNT = 3;

// Die echte Ausgabe einmal je Lauf; der Worker ist bei jedem Prüfen frisch.
let real: Promise<string[]> | undefined;
const realOrder = () => (real ??= runSnippet(SNIPPETS.find((s) => s.id === 'mixed')!.code));

/** `order` als Liste von Texten, sonst eine verständliche Meldung. */
function asList(order: unknown): string[] {
  if (!Array.isArray(order)) {
    throw new CheckFailure(`\`order\` soll ein Array sein, ist aber ${formatValue(order)}.`);
  }
  return order.map(String);
}

const module: CheckModule = {
  exportsNeeded: ['order'],
  checks: [
    {
      name: '`order` enthält jede der sechs Ausgaben genau einmal',
      async run({ exports }) {
        const order = asList(exports.order);
        const expected = await realOrder();
        expectEqual([...order].sort(), [...expected].sort(), '`order`, alphabetisch sortiert');
      },
    },
    {
      name: 'Die ersten drei Einträge sind der synchrone Teil',
      async run({ exports }) {
        const order = asList(exports.order);
        const expected = await realOrder();
        expectEqual(order.slice(0, SYNC_COUNT), expected.slice(0, SYNC_COUNT), 'die ersten drei Einträge');
      },
    },
    {
      name: 'Die ganze Reihenfolge stimmt mit der echten Ausführung überein',
      async run({ exports }) {
        const order = asList(exports.order);
        expectEqual(order, await realOrder(), '`order`');
      },
    },
  ],
};

export default module;
