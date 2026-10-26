import { CHECKS } from './registry';
import { runChecks } from './runChecks';
import type { RunResult } from './types';

const post = (m: RunResult) => (globalThis as unknown as { postMessage(m: unknown): void }).postMessage(m);

// Dünne Hülle: Aufgabe laden, Prüfkern ausführen, Ergebnis zurückschicken.
globalThis.addEventListener('message', (event) => {
  const { taskId, code } = (event as MessageEvent<{ taskId: string; code: string }>).data;
  void (async () => {
    const load = CHECKS[taskId];
    if (!load) {
      post({ status: 'error', message: 'Unbekannte Aufgabe' });
      return;
    }
    try {
      post(await runChecks((await load()).default, code));
    } catch (err) {
      post({ status: 'error', message: err instanceof Error ? err.message : String(err) });
    }
  })();
});
