// Nachgebauter Server für Aufgabe 2: antwortet auf `/item` der Reihe nach mit
// den vorgegebenen Schritten. Läuft im Prüf-Worker: nur Web-Globals, nichts aus React.
import { createFakeFetch } from '../../../http/fakeFetch';

/** Ein Statuscode oder 'netz' für einen Netzwerkausfall */
export type Step = number | 'netz';

/**
 * Frisches fetch je Aufruf. Der n-te Aufruf bekommt Schritt n; sind die Schritte
 * aufgebraucht, gilt der letzte weiter. Gezählt wird über `log`.
 */
export function createSequenceFetch(steps: Step[]): ReturnType<typeof createFakeFetch> {
  const last = steps.length - 1;
  // fakeFetch trägt die Anfrage ins Log ein, bevor es failNetwork und die Route fragt:
  // der Index der gerade laufenden Anfrage ist also log.length - 1.
  let log: ReturnType<typeof createFakeFetch>['log'] = [];
  const stepNow = (): Step => steps[Math.min(log.length - 1, last)] ?? 200;
  const fake = createFakeFetch(
    [
      {
        method: 'GET',
        path: '/item',
        respond: () => {
          const step = stepNow();
          const status = typeof step === 'number' ? step : 500;
          const body = status < 400 ? { name: 'Notizbuch' } : { error: `Status ${status}` };
          return { status, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) };
        },
      },
    ],
    { failNetwork: () => stepNow() === 'netz' },
  );
  log = fake.log;
  return fake;
}
