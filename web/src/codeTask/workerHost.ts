import { cleanErrorMessage } from './errorMessage';
import { handleTask, type CheckLoaders } from './handleTask';
import { blockNetwork } from './network';
import { userErrorResult } from './runChecks';
import type { WorkerMessage } from './types';

/** Das, was der Worker von seinem Global braucht; im Test nachgestellt. */
export interface WorkerScope {
  addEventListener(type: string, listener: (event: Event) => void): void;
  postMessage(message: unknown): void;
}

/**
 * Verdrahtet den Worker: Aufgabe annehmen, nach dem Laden des Prüfmoduls
 * das Netz sperren und `ready` melden, dann das Ergebnis schicken. Fehler,
 * die später im Nutzercode auftreten (Timer, nicht abgefangene Promise),
 * werden abgefangen und als Fehler im eigenen Code gemeldet; der Runner
 * nimmt die erste Antwort und beendet den Worker.
 */
export function installWorker(scope: WorkerScope, checks: CheckLoaders): void {
  const post = (m: WorkerMessage) => scope.postMessage(m);

  scope.addEventListener('message', (event) => {
    const { taskId, code } = (event as MessageEvent<{ taskId: string; code: string }>).data;
    void handleTask(checks, taskId, code, () => {
      blockNetwork(scope);
      post({ status: 'ready' });
    }).then(post);
  });

  scope.addEventListener('error', (event) => {
    event.preventDefault();
    const { error, message } = event as ErrorEvent;
    if (error instanceof Error) post(userErrorResult(error));
    else post({ status: 'error', message: cleanErrorMessage(String(message ?? error)) });
  });

  scope.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    post(userErrorResult((event as PromiseRejectionEvent).reason));
  });
}
