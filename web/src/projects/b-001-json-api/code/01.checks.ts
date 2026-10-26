import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { CheckModule } from '../../../codeTask/types';
import { PRODUCTS } from '../products';
import { createProductApi } from './productApi';

type LoadProducts = (url: string) => Promise<unknown>;

const module: CheckModule = {
  exportsNeeded: ['loadProducts'],
  globals: () => ({ fetch: createProductApi().fetch }),
  checks: [
    {
      name: "`loadProducts('/products')` liefert die Produktliste",
      async run({ exports }) {
        const result = await (exports.loadProducts as LoadProducts)('/products');
        expectEqual(result, PRODUCTS, "`loadProducts('/products')`");
      },
    },
    {
      name: "`loadProducts('/missing')` wirft einen Fehler mit „404“ in der Meldung",
      async run({ exports }) {
        let result: unknown;
        try {
          result = await (exports.loadProducts as LoadProducts)('/missing');
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          if (!message.includes('404')) {
            throw new CheckFailure(`Die Meldung soll „404“ enthalten, sie lautet ${formatValue(message)}.`);
          }
          return;
        }
        throw new CheckFailure(
          `Erwartet war ein Fehler, die Funktion hat aber ${formatValue(result)} zurückgegeben. Prüfe \`res.ok\`.`,
        );
      },
    },
    {
      name: 'Ein Aufruf von `loadProducts` ruft `fetch` genau einmal auf',
      async run({ rerun }) {
        // Eigenes fetch, damit sich die Aufrufe zählen lassen.
        const api = createProductApi();
        const { exports } = await rerun({ fetch: api.fetch });
        try {
          await (exports.loadProducts as LoadProducts)('/products');
        } catch {
          // Ob es klappt, prüft der erste Fall; hier zählt nur die Anzahl.
        }
        expectEqual(api.log.length, 1, 'Aufrufe von `fetch`');
      },
    },
  ],
};

export default module;
