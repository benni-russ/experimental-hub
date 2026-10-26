import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { CheckModule } from '../../../codeTask/types';
import { PRODUCTS } from '../products';
import { createProductApi } from './productApi';

type LoadSafely = (url: string) => Promise<unknown>;

/** Ruft loadSafely auf; eine Ausnahme ist hier selbst schon ein Fehlschlag. */
async function settle(exports: Record<string, unknown>, url: string): Promise<unknown> {
  try {
    return await (exports.loadSafely as LoadSafely)(url);
  } catch (err) {
    throw new CheckFailure(
      `\`loadSafely('${url}')\` hat geworfen (${formatValue(err)}). Sie soll stattdessen \`{ ok: false, error }\` zurückgeben.`,
    );
  }
}

/** Erwartet `{ ok: false, error }` mit dem Stichwort in `error`; liefert die Meldung. */
async function failureMessage(exports: Record<string, unknown>, url: string, keyword: string): Promise<string> {
  const result = await settle(exports, url);
  const r = (typeof result === 'object' && result !== null ? result : {}) as { ok?: unknown; error?: unknown };
  if (r.ok !== false || typeof r.error !== 'string') {
    throw new CheckFailure(
      `\`loadSafely('${url}')\`: erwartet \`{ ok: false, error: '…' }\`, bekommen ${formatValue(result)}`,
    );
  }
  if (!r.error.includes(keyword)) {
    throw new CheckFailure(`Die Meldung soll „${keyword}“ enthalten, sie lautet ${formatValue(r.error)}.`);
  }
  return r.error;
}

const module: CheckModule = {
  exportsNeeded: ['loadSafely'],
  globals: () => ({ fetch: createProductApi().fetch }),
  checks: [
    {
      name: "`loadSafely('/products')` liefert `{ ok: true, data }` mit der Liste",
      async run({ exports }) {
        expectEqual(await settle(exports, '/products'), { ok: true, data: PRODUCTS }, "`loadSafely('/products')`");
      },
    },
    {
      name: "Netzwerkausfall (`/offline`): `error` nennt „Netzwerk“",
      run: async ({ exports }) => void (await failureMessage(exports, '/offline', 'Netzwerk')),
    },
    {
      name: "HTTP-Fehler (`/missing`): `error` nennt „404“",
      run: async ({ exports }) => void (await failureMessage(exports, '/missing', '404')),
    },
    {
      name: "Kaputtes JSON (`/broken`): `error` nennt „JSON“",
      run: async ({ exports }) => void (await failureMessage(exports, '/broken', 'JSON')),
    },
    {
      name: 'Die drei Fehlermeldungen unterscheiden sich',
      async run({ exports }) {
        const messages = [
          await failureMessage(exports, '/offline', 'Netzwerk'),
          await failureMessage(exports, '/missing', '404'),
          await failureMessage(exports, '/broken', 'JSON'),
        ];
        if (new Set(messages).size !== messages.length) {
          throw new CheckFailure(`Mindestens zwei Meldungen sind gleich: ${formatValue(messages)}`);
        }
      },
    },
  ],
};

export default module;
