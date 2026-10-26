import { expectEqual } from '../../../codeTask/assert';
import type { CheckModule } from '../../../codeTask/types';
import { PRODUCTS, type Product } from '../products';

type CheapInStock = (products: Product[], maxPrice: number) => unknown;

/** Erwartung, unabhängig vom Nutzercode gerechnet. */
const expected = (maxPrice: number) =>
  PRODUCTS.filter((p) => p.inStock && p.price <= maxPrice).sort((a, b) => a.price - b.price);

// Jede Prüfung bekommt eine eigene Kopie, damit ein Fehler in einer nicht die nächste verfälscht.
const call = (exports: Record<string, unknown>, maxPrice: number) =>
  (exports.cheapInStock as CheapInStock)(structuredClone(PRODUCTS), maxPrice);

const module: CheckModule = {
  exportsNeeded: ['cheapInStock'],
  checks: [
    {
      name: 'Lieferbare Produkte bis 10 Euro, nach Preis sortiert',
      run: ({ exports }) => expectEqual(call(exports, 10), expected(10), '`cheapInStock(products, 10)`'),
    },
    {
      name: 'Die Grenze zählt mit: bei `maxPrice` 4.5 ist das Notizbuch dabei',
      run: ({ exports }) => expectEqual(call(exports, 4.5), expected(4.5), '`cheapInStock(products, 4.5)`'),
    },
    {
      name: 'Nicht lieferbare fallen weg, auch wenn der Preis passt',
      run: ({ exports }) => expectEqual(call(exports, 100), expected(100), '`cheapInStock(products, 100)`'),
    },
    {
      name: 'Eine leere Liste bleibt leer',
      run: ({ exports }) => expectEqual((exports.cheapInStock as CheapInStock)([], 50), [], '`cheapInStock([], 50)`'),
    },
    {
      name: 'Die übergebene Liste bleibt unverändert',
      run({ exports }) {
        const input = structuredClone(PRODUCTS);
        const before = structuredClone(input);
        (exports.cheapInStock as CheapInStock)(input, 10);
        expectEqual(input, before, 'Die Liste nach dem Aufruf');
      },
    },
  ],
};

export default module;
