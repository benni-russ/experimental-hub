import { cleanErrorMessage } from './errorMessage';
import type { RunResult, WorkerMessage } from './types';

export interface WorkerLike {
  postMessage(m: unknown): void;
  terminate(): void;
  onmessage: ((e: { data: unknown }) => void) | null;
  onerror: ((e: unknown) => void) | null;
}

interface Active {
  worker: WorkerLike;
  /** Erst die Ladezeitgrenze, nach `ready` die Laufzeitgrenze */
  timer: ReturnType<typeof setTimeout>;
  settle(result: RunResult | 'superseded'): void;
}

const START_FAILURE: RunResult = { status: 'error', message: 'Die Prüfung konnte nicht gestartet werden.' };
const LOAD_FAILURE: RunResult = { status: 'error', message: 'Die Prüfung konnte nicht geladen werden.' };

/**
 * Fehler, der den Worker verlässt. Trägt er eine Meldung, stammt er (in aller
 * Regel) aus dem Nutzercode, etwa aus einem Timer; ohne Meldung kam der
 * Worker gar nicht erst hoch.
 */
function workerErrorResult(event: unknown): RunResult {
  const message = (event as { message?: unknown } | null)?.message;
  return typeof message === 'string' && message !== ''
    ? { status: 'error', message: cleanErrorMessage(message) }
    : START_FAILURE;
}

/**
 * Führt je Lauf einen frischen Worker aus. Ein neuer Lauf beendet den
 * laufenden (der liefert 'superseded'). Der Worker meldet `ready`, sobald
 * das Prüfmodul geladen ist; erst dann beginnen die `timeoutMs`, nach denen
 * er hart beendet wird, so stoppt auch eine Endlosschleife. Bleibt `ready`
 * länger als `loadTimeoutMs` aus, gilt die Prüfung als nicht geladen.
 */
export function createRunner(createWorker: () => WorkerLike, timeoutMs = 2000, loadTimeoutMs = 15_000) {
  let active: Active | null = null;

  function finish(run: Active, result: RunResult | 'superseded') {
    clearTimeout(run.timer);
    run.worker.onmessage = null;
    run.worker.onerror = null;
    run.worker.terminate();
    if (active === run) active = null;
    run.settle(result);
  }

  function cancel() {
    if (active) finish(active, 'superseded');
  }

  function run(taskId: string, code: string): Promise<RunResult | 'superseded'> {
    cancel();
    return new Promise((resolve) => {
      let worker: WorkerLike;
      try {
        worker = createWorker();
      } catch {
        resolve(START_FAILURE);
        return;
      }
      const current: Active = {
        worker,
        settle: resolve,
        timer: setTimeout(() => finish(current, LOAD_FAILURE), loadTimeoutMs),
      };
      active = current;
      worker.onmessage = (e) => {
        const data = e.data as WorkerMessage;
        if (data.status === 'ready') {
          clearTimeout(current.timer);
          current.timer = setTimeout(() => finish(current, { status: 'timeout' }), timeoutMs);
          return;
        }
        finish(current, data);
      };
      worker.onerror = (e) => finish(current, workerErrorResult(e));
      try {
        worker.postMessage({ taskId, code });
      } catch {
        finish(current, START_FAILURE);
      }
    });
  }

  return { run, cancel };
}

/** Eigener Runner je Aufgabe, damit Läufe verschiedener Aufgaben einander nicht abbrechen. */
export const createBrowserRunner = () =>
  createRunner(
    () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }) as WorkerLike,
);
