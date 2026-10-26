import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { Check, CheckModule } from '../../../codeTask/types';

type RankProducts = (products: unknown, purchasedIds: unknown, scores: unknown, n: number) => unknown;

interface Item {
  id: string;
  availability: 'in_stock' | 'out_of_stock';
}

const inStock = (id: string): Item => ({ id, availability: 'in_stock' });
const soldOut = (id: string): Item => ({ id, availability: 'out_of_stock' });

/** Prüft die Rückgabe (Liste von IDs) und dass keine Eingabe verändert wurde. */
function expectRanking(name: string, products: Item[], purchased: string[], scores: Record<string, number>, n: number, expected: string[]): Check {
  return {
    name,
    run({ exports }) {
      const fn = exports.rankProducts;
      if (typeof fn !== 'function') {
        throw new CheckFailure(`\`rankProducts\` soll eine Funktion sein, ist aber ${formatValue(fn)}.`);
      }
      const before = structuredClone({ products, purchased, scores });
      const result = (fn as RankProducts)(products, purchased, scores, n);
      expectEqual(result, expected, 'Reihenfolge der IDs');
      expectEqual({ products, purchased, scores }, before, 'Eingaben nach dem Aufruf');
    },
  };
}

const module: CheckModule = {
  exportsNeeded: ['rankProducts'],
  checks: [
    expectRanking('Sortiert absteigend nach Score', [inStock('A'), inStock('B'), inStock('C')], [], { A: 0.2, B: 0.9, C: 0.5 }, 3, ['B', 'C', 'A']),
    expectRanking('Ausverkaufte Produkte fallen weg', [inStock('A'), soldOut('B'), inStock('C')], [], { A: 0.2, B: 0.9, C: 0.5 }, 3, ['C', 'A']),
    expectRanking('Schon gekaufte Produkte fallen weg', [inStock('A'), inStock('B'), inStock('C')], ['B'], { A: 0.2, B: 0.9, C: 0.5 }, 3, ['C', 'A']),
    expectRanking(
      'Beide Filter zugleich',
      [inStock('A'), soldOut('B'), inStock('C'), inStock('D')],
      ['C'],
      { A: 0.1, B: 0.9, C: 0.8, D: 0.4 },
      4,
      ['D', 'A'],
    ),
    expectRanking('Gleichstand: die kleinere `id` zuerst', [inStock('C'), inStock('A'), inStock('B')], [], { A: 0.5, B: 0.5, C: 0.5 }, 3, ['A', 'B', 'C']),
    expectRanking('Höchstens `n` Produkte kommen zurück', [inStock('A'), inStock('B'), inStock('C')], [], { A: 0.3, B: 0.2, C: 0.1 }, 2, ['A', 'B']),
    expectRanking('`n` größer als die Liste: alle Produkte', [inStock('A'), inStock('B')], [], { A: 0.3, B: 0.2 }, 10, ['A', 'B']),
    expectRanking(
      'Erst filtern, dann kürzen: Produkte nachrücken lassen',
      [soldOut('A'), inStock('B'), inStock('C'), inStock('D')],
      [],
      { A: 0.9, B: 0.8, C: 0.7, D: 0.6 },
      2,
      ['B', 'C'],
    ),
    expectRanking('Ein fehlender Score zählt als `0`', [inStock('A'), inStock('B')], [], { B: 0.1 }, 2, ['B', 'A']),
    expectRanking('Eine leere Liste ergibt `[]`', [], [], {}, 5, []),
    expectRanking('Die Eingaben bleiben unverändert, auch ihre Reihenfolge', [inStock('C'), inStock('A'), inStock('B')], ['A'], { A: 0.1, B: 0.2, C: 0.3 }, 3, ['C', 'B']),
  ],
};

export default module;
