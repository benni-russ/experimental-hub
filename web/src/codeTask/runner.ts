import type { RunResult } from './types';

export interface WorkerLike {
  postMessage(m: unknown): void;
  terminate(): void;
  onmessage: ((e: { data: unknown }) => void) | null;
  onerror: ((e: unknown) => void) | null;
}

interface Active {
  worker: WorkerLike;
  timer: ReturnType<typeof setTimeout>;
  settle(result: RunResult | 'superseded'): void;
}

/**
 * Führt je Lauf einen frischen Worker aus. Ein neuer Lauf beendet den
 * laufenden (der liefert 'superseded'); nach `timeoutMs` ohne Antwort wird
 * der Worker hart beendet, so stoppt auch eine Endlosschleife.
 */
export function createRunner(createWorker: () => WorkerLike, timeoutMs = 2000) {
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
      const startFailure: RunResult = { status: 'error', message: 'Die Prüfung konnte nicht gestartet werden.' };
      let worker: WorkerLike;
      try {
        worker = createWorker();
      } catch {
        resolve(startFailure);
        return;
      }
      const current: Active = {
        worker,
        settle: resolve,
        timer: setTimeout(() => finish(current, { status: 'timeout' }), timeoutMs),
      };
      active = current;
      worker.onmessage = (e) => finish(current, e.data as RunResult);
      worker.onerror = () => finish(current, startFailure);
      try {
        worker.postMessage({ taskId, code });
      } catch {
        finish(current, startFailure);
      }
    });
  }

  return { run, cancel };
}

export const browserRunner = createRunner(
  () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }) as WorkerLike,
);
