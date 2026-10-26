import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { Check, CheckModule } from '../../../codeTask/types';

type ParseFeed = (text: string) => unknown;

/** Ruft `parseFeed` auf und übersetzt eine Ausnahme in eine verständliche Meldung. */
function parse(fn: unknown, text: string): unknown {
  if (typeof fn !== 'function') {
    throw new CheckFailure(`\`parseFeed\` soll eine Funktion sein, ist aber ${formatValue(fn)}.`);
  }
  try {
    return (fn as ParseFeed)(text);
  } catch (err) {
    throw new CheckFailure(`\`parseFeed\` darf nie eine Ausnahme werfen, warf aber: ${err instanceof Error ? err.message : String(err)}`);
  }
}

/** Das Ergebnis muss ein Fehlerobjekt sein: `ok: false` und eine Meldung als nicht leerer Text. */
function expectFailure(name: string, text: string): Check {
  return {
    name,
    run({ exports }) {
      const r = parse(exports.parseFeed, text) as { ok?: unknown; error?: unknown } | null;
      if (typeof r !== 'object' || r === null || r.ok !== false) {
        throw new CheckFailure(`erwartet \`{ ok: false, error }\`, bekommen ${formatValue(r)}`);
      }
      if (typeof r.error !== 'string' || r.error.trim() === '') {
        throw new CheckFailure(`\`error\` soll ein nicht leerer Text sein, ist aber ${formatValue(r.error)}`);
      }
    },
  };
}

function expectProducts(name: string, text: string, products: unknown[]): Check {
  return {
    name,
    run({ exports }) {
      expectEqual(parse(exports.parseFeed, text), { ok: true, products }, 'Ergebnis');
    },
  };
}

const module: CheckModule = {
  exportsNeeded: ['parseFeed'],
  checks: [
    expectProducts('Gültiger Feed: `{ ok: true, products }`', '{"products":[{"id":"A","price":10},{"id":"B","price":20}]}', [
      { id: 'A', price: 10 },
      { id: 'B', price: 20 },
    ]),
    expectProducts('Eine leere Liste ist gültig', '{"products":[]}', []),
    expectFailure('Kaputtes JSON ergibt `ok: false`', '{"products": [{"id": "A"'),
    expectFailure('Leerer Text ergibt `ok: false`', ''),
    expectFailure('`products` fehlt: `ok: false`', '{"generatedAt":"heute"}'),
    expectFailure('`products` ist kein Array: `ok: false`', '{"products":{"id":"A"}}'),
    expectFailure('Der Text `null` wirft keine Ausnahme', 'null'),
  ],
};

export default module;
