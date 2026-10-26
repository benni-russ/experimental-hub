import { CheckFailure } from '../../../codeTask/assert';
import type { Check, CheckContext, CheckModule } from '../../../codeTask/types';
import { VALID_PURCHASE } from '../../b-004-ga4-event-builder/fixtures';
import { validateEvent } from '../../b-004-ga4-event-builder/validateEvent';
import { createTestApi, type TestOutcome } from '../miniTest';
import { MUTANT_IDS, MUTANTS, type MutantId } from '../mutants';

// Dieses Modul läuft im Worker (registry.ts lädt es dort per import()).
// validateEvent, die Varianten und die Test-API entstehen also im Worker
// selbst; nichts davon muss per postMessage hinüber. Jede Prüfung führt den
// Code des Nutzers über ctx.rerun neu aus, mit einer frischen Test-API und der
// gewünschten Fassung von validateEvent, und startet dann dessen Tests.

/** Name der Variante in Prüfungen; dort dürfen Backticks Code setzen. */
const CHECK_LABEL: Record<MutantId, string> = {
  'no-tolerance': MUTANTS['no-tolerance'].label,
  'ignore-quantity': MUTANTS['ignore-quantity'].label,
  'lax-name': MUTANTS['lax-name'].label,
  'no-transaction-id': '`transaction_id` nicht geprüft',
};

/** Wonach ein Test fragen muss, um die Variante zu bemerken */
const HINT: Record<MutantId, string> = {
  'no-tolerance': 'Prüf einen `value`, der weniger als einen Cent neben der Summe liegt: Er ist gültig.',
  'ignore-quantity': 'Prüf ein Event mit einer Menge über 1, bei dem `value` die Menge mitzählt.',
  'lax-name': 'Prüf, dass ein Eventname mit Bindestrich `name_format` meldet.',
  'no-transaction-id': 'Prüf, dass ein `purchase` ohne `transaction_id` gemeldet wird.',
};

const tests = (n: number) => (n === 1 ? '1 Test' : `${n} Tests`);
const NO_TESTS = 'Noch kein Test registriert. Schreib Tests mit `test(name, () => { … })`.';

/** Führt den Nutzercode mit der angegebenen Fassung neu aus und startet seine Tests. */
async function runUserTests(ctx: CheckContext, validate: typeof validateEvent): Promise<TestOutcome[]> {
  const api = createTestApi();
  await ctx.rerun({
    test: api.test,
    expect: api.expect,
    validateEvent: validate,
    // Kopie: Ändert der Nutzer das Beispiel, bleibt es für den nächsten Lauf heil.
    VALID_PURCHASE: structuredClone(VALID_PURCHASE),
  });
  return api.runAll();
}

function describeFailure(outcomes: TestOutcome[]): string {
  const failed = outcomes.filter((o) => !o.passed);
  const [first] = failed;
  if (!first) return '';
  const more = failed.length > 1 ? ` (und ${failed.length - 1} weitere)` : '';
  return `„${first.name}“ scheitert: ${first.message ?? 'ohne Meldung'}${more}`;
}

function mutantCheck(id: MutantId): Check {
  return {
    name: `Die Variante „${CHECK_LABEL[id]}“ wird erwischt`,
    async run(ctx) {
      const original = await runUserTests(ctx, validateEvent);
      const mutant = await runUserTests(ctx, MUTANTS[id].validate);
      if (mutant.length === 0) throw new CheckFailure(NO_TESTS);
      // Erwischt hat nur ein Test, der am Original besteht und hier scheitert.
      const caught = mutant.some((o, i) => !o.passed && original[i]?.passed === true);
      if (caught) return;
      if (mutant.some((o) => !o.passed)) {
        throw new CheckFailure(
          `Die Tests, die hier scheitern, scheitern schon gegen die richtige \`validateEvent\`; das zählt nicht als erwischt. ${HINT[id]}`,
        );
      }
      const all = mutant.length === 1 ? 'Dein Test besteht' : `Alle ${mutant.length} Tests bestehen`;
      throw new CheckFailure(`${all} auch gegen diese Variante. ${HINT[id]}`);
    },
  };
}

const module: CheckModule = {
  exportsNeeded: [],
  globals: () => {
    const api = createTestApi();
    return {
      test: api.test,
      expect: api.expect,
      validateEvent,
      VALID_PURCHASE: structuredClone(VALID_PURCHASE),
    };
  },
  checks: [
    {
      name: 'Mindestens drei Tests sind registriert',
      async run(ctx) {
        const outcomes = await runUserTests(ctx, validateEvent);
        if (outcomes.length === 0) throw new CheckFailure(NO_TESTS);
        if (outcomes.length < 3) {
          throw new CheckFailure(`Erst ${tests(outcomes.length)} registriert; es sollen mindestens drei sein.`);
        }
      },
    },
    {
      name: 'Gegen die richtige `validateEvent` bestehen alle Tests',
      async run(ctx) {
        const outcomes = await runUserTests(ctx, validateEvent);
        if (outcomes.length === 0) throw new CheckFailure(NO_TESTS);
        const failure = describeFailure(outcomes);
        if (failure) throw new CheckFailure(failure);
      },
    },
    ...MUTANT_IDS.map(mutantCheck),
  ],
};

export default module;
