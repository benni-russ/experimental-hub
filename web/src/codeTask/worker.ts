import { handleTask } from './handleTask';
import { CHECKS } from './registry';
import type { RunResult } from './types';

const post = (m: RunResult) => (globalThis as unknown as { postMessage(m: unknown): void }).postMessage(m);

// Dünne Hülle: Nachricht annehmen, Ergebnis zurückschicken.
globalThis.addEventListener('message', (event) => {
  const { taskId, code } = (event as MessageEvent<{ taskId: string; code: string }>).data;
  void handleTask(CHECKS, taskId, code).then(post);
});
