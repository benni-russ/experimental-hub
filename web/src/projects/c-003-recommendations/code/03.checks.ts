import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { Check, CheckModule } from '../../../codeTask/types';

type CategoryAffinity = (events: unknown, now: string) => unknown;

const NOW = '2026-10-26T12:00:00Z';
const TOLERANCE = 1e-9;

type EventType = 'view' | 'cart' | 'purchase';
const ev = (type: EventType, category: string, daysAgo: number) => ({
  type,
  category,
  at: new Date(Date.parse(NOW) - daysAgo * 86_400_000).toISOString(),
});

/** Vergleicht das Profil mit Toleranz je Kategorie; die Eingabe muss unverändert bleiben. */
function expectProfile(name: string, events: ReturnType<typeof ev>[], expected: Record<string, number>): Check {
  return {
    name,
    run({ exports }) {
      const fn = exports.categoryAffinity;
      if (typeof fn !== 'function') {
        throw new CheckFailure(`\`categoryAffinity\` soll eine Funktion sein, ist aber ${formatValue(fn)}.`);
      }
      const before = structuredClone(events);
      const result = (fn as CategoryAffinity)(events, NOW);
      if (typeof result !== 'object' || result === null || Array.isArray(result)) {
        throw new CheckFailure(`\`categoryAffinity\` soll ein Objekt zurückgeben, liefert aber ${formatValue(result)}.`);
      }
      const actual = result as Record<string, unknown>;
      const keys = Object.keys(actual).sort();
      const wanted = Object.keys(expected).sort();
      const ok =
        keys.length === wanted.length &&
        keys.every((k, i) => k === wanted[i]) &&
        wanted.every((k) => typeof actual[k] === 'number' && Math.abs((actual[k] as number) - expected[k]!) <= TOLERANCE);
      if (!ok) throw new CheckFailure(`Profil: erwartet ${formatValue(expected)}, bekommen ${formatValue(result)}`);
      expectEqual(events, before, 'Eingabe nach dem Aufruf');
    },
  };
}

const module: CheckModule = {
  exportsNeeded: ['categoryAffinity'],
  checks: [
    expectProfile('Ein Ereignis: die Kategorie bekommt `1`', [ev('view', 'Jacken', 2)], { Jacken: 1 }),
    expectProfile('Ein leerer Verlauf ergibt `{}`', [], {}),
    expectProfile('Zwei gleiche Ereignisse heute: je die Hälfte', [ev('view', 'Jacken', 0), ev('view', 'Zubehör', 0)], { Jacken: 0.5, Zubehör: 0.5 }),
    // Ein Ereignis von vor 7 Tagen zählt halb so viel wie ein heutiges: 1 gegen 0,5 ergibt 2/3 zu 1/3.
    expectProfile('Vor 7 Tagen zählt halb so viel wie heute', [ev('view', 'Jacken', 0), ev('view', 'Laufschuhe', 7)], { Jacken: 2 / 3, Laufschuhe: 1 / 3 }),
    expectProfile('Vor 14 Tagen zählt ein Viertel', [ev('view', 'Jacken', 0), ev('view', 'Laufschuhe', 14)], { Jacken: 0.8, Laufschuhe: 0.2 }),
    expectProfile('Ein Kauf zählt fünfmal so viel wie ein Aufruf', [ev('purchase', 'Jacken', 0), ev('view', 'Laufschuhe', 0)], { Jacken: 5 / 6, Laufschuhe: 1 / 6 }),
    expectProfile('Ein Warenkorb zählt dreimal so viel wie ein Aufruf', [ev('cart', 'Jacken', 0), ev('view', 'Laufschuhe', 0)], { Jacken: 0.75, Laufschuhe: 0.25 }),
    expectProfile(
      'Mehrere Ereignisse einer Kategorie werden addiert',
      [ev('view', 'Jacken', 0), ev('view', 'Jacken', 0), ev('view', 'Laufschuhe', 0)],
      { Jacken: 2 / 3, Laufschuhe: 1 / 3 },
    ),
    expectProfile(
      'Gemischter Verlauf: drei Kategorien, Summe `1`',
      [ev('purchase', 'Jacken', 7), ev('cart', 'Zubehör', 0), ev('view', 'Laufschuhe', 0)],
      { Jacken: 2.5 / 6.5, Zubehör: 3 / 6.5, Laufschuhe: 1 / 6.5 },
    ),
  ],
};

export default module;
