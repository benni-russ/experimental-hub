import { CheckFailure, expectEqual, formatValue } from '../../../codeTask/assert';
import type { CheckContext, CheckModule } from '../../../codeTask/types';
import { createSequenceFetch, type Step } from './retryApi';

type FetchWithRetry = (url: string, tries: number) => Promise<Response>;

/** Läuft die Funktion mit einer eigenen Folge von Antworten; liefert Antwort oder Fehler und die Zahl der Aufrufe. */
async function attempt(
  ctx: CheckContext,
  steps: Step[],
  tries: number,
): Promise<{ response?: Response; error?: unknown; calls: number }> {
  const api = createSequenceFetch(steps);
  const { exports } = await ctx.rerun({ fetch: api.fetch });
  try {
    const response = await (exports.fetchWithRetry as FetchWithRetry)('/item', tries);
    return { response, calls: api.log.length };
  } catch (error) {
    return { error: error ?? 'kein Fehlerobjekt', calls: api.log.length };
  }
}

/** Zählt Aufrufe und prüft den Status der zurückgegebenen Antwort. */
async function expectAnswer(ctx: CheckContext, steps: Step[], tries: number, calls: number, status: number) {
  const out = await attempt(ctx, steps, tries);
  if (out.error !== undefined) {
    throw new CheckFailure(
      `Die Funktion hat geworfen (${formatValue(out.error)}), erwartet war eine Antwort mit Status ${status}.`,
    );
  }
  expectEqual(out.calls, calls, 'Aufrufe von `fetch`');
  if (!out.response || typeof out.response.status !== 'number') {
    throw new CheckFailure(`Erwartet war die Antwort mit Status ${status}, bekommen ${formatValue(out.response)}.`);
  }
  expectEqual(out.response.status, status, 'Status der zurückgegebenen Antwort');
}

const module: CheckModule = {
  exportsNeeded: ['fetchWithRetry'],
  globals: () => ({ fetch: createSequenceFetch([200]).fetch }),
  checks: [
    {
      name: '`503`, `503`, `200` mit `tries = 5`: drei Aufrufe, Antwort `200`',
      run: (ctx) => expectAnswer(ctx, [503, 503, 200], 5, 3, 200),
    },
    {
      name: '`404` mit `tries = 3`: ein Aufruf, keine Wiederholung',
      run: (ctx) => expectAnswer(ctx, [404], 3, 1, 404),
    },
    {
      name: 'Immer `500` mit `tries = 4`: genau vier Aufrufe, die letzte Antwort kommt zurück',
      run: (ctx) => expectAnswer(ctx, [500], 4, 4, 500),
    },
    {
      name: 'Netzwerkausfall, dann `200`: zwei Aufrufe, Antwort `200`',
      run: (ctx) => expectAnswer(ctx, ['netz', 200], 3, 2, 200),
    },
    {
      name: 'Immer Netzwerkausfall mit `tries = 3`: drei Aufrufe, dann wirft die Funktion',
      async run(ctx) {
        const out = await attempt(ctx, ['netz'], 3);
        expectEqual(out.calls, 3, 'Aufrufe von `fetch`');
        if (out.error === undefined) {
          throw new CheckFailure(
            `Ohne Antwort soll der Fehler weitergeworfen werden, die Funktion hat aber ${formatValue(out.response)} zurückgegeben.`,
          );
        }
      },
    },
    {
      name: '`429` mit `tries = 3`: ein Aufruf, `429` wird hier nicht wiederholt',
      run: (ctx) => expectAnswer(ctx, [429], 3, 1, 429),
    },
    {
      name: '`503` mit `tries = 1`: nur ein Aufruf, die Antwort kommt zurück',
      run: (ctx) => expectAnswer(ctx, [503], 1, 1, 503),
    },
  ],
};

export default module;
