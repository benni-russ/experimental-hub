import { describe, expect, it } from 'vitest';
import { NETWORK_BLOCKED } from './network';
import type { CheckModule } from './types';
import { installWorker, type WorkerScope } from './workerHost';

const mod: CheckModule = { exportsNeeded: [], checks: [{ name: 'immer grün', run() {} }] };

/** Nachgestellter Worker-Kontext: EventTarget plus postMessage und ein echtes `fetch`. */
function fakeScope() {
  const target = new EventTarget();
  const posted: unknown[] = [];
  const scope = Object.assign(target, {
    postMessage: (m: unknown) => void posted.push(m),
    fetch: () => 'echtes Netz',
  }) as EventTarget & WorkerScope & { fetch: () => unknown };
  return { scope, posted };
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function errorEvent(type: string, extra: Record<string, unknown>) {
  return Object.assign(new Event(type, { cancelable: true }), extra);
}

describe('installWorker', () => {
  it('meldet „ready“ nach dem Laden und schickt dann das Ergebnis', async () => {
    const { scope, posted } = fakeScope();
    installWorker(scope, { t: () => Promise.resolve({ default: mod }) });
    scope.dispatchEvent(Object.assign(new Event('message'), { data: { taskId: 't', code: 'return {};' } }));
    await flush();
    expect(posted).toEqual([{ status: 'ready' }, { status: 'ok', results: [{ name: 'immer grün', passed: true }] }]);
  });

  it('sperrt nach dem Laden das Netz im Worker', async () => {
    const { scope } = fakeScope();
    installWorker(scope, { t: () => Promise.resolve({ default: mod }) });
    scope.dispatchEvent(Object.assign(new Event('message'), { data: { taskId: 't', code: 'return {};' } }));
    await flush();
    expect(() => scope.fetch()).toThrow(NETWORK_BLOCKED('fetch'));
  });

  it('ein später Fehler (z. B. im Timer) wird zum Fehler im eigenen Code', () => {
    const { scope, posted } = fakeScope();
    installWorker(scope, {});
    const event = errorEvent('error', { error: new Error('kaputt im Timer'), message: 'Uncaught Error: kaputt im Timer' });
    scope.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(posted).toEqual([{ status: 'error', message: 'kaputt im Timer' }]);
  });

  it('nimmt die Meldung, wenn das Fehlerobjekt fehlt', () => {
    const { scope, posted } = fakeScope();
    installWorker(scope, {});
    scope.dispatchEvent(errorEvent('error', { error: null, message: 'Uncaught TypeError: x is not a function' }));
    expect(posted).toEqual([{ status: 'error', message: 'TypeError: x is not a function' }]);
  });

  it('eine unbehandelte Ablehnung wird zum Fehler im eigenen Code', () => {
    const { scope, posted } = fakeScope();
    installWorker(scope, {});
    const event = errorEvent('unhandledrejection', { reason: new Error('abgelehnt') });
    scope.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(posted).toEqual([{ status: 'error', message: 'abgelehnt' }]);
  });

  it('meldet die Zeile, wenn der Fehler aus aufgabe.js stammt', async () => {
    const { scope, posted } = fakeScope();
    installWorker(scope, {});
    let err: unknown;
    try {
      new Function('\nthrow new Error("zwei")\n//# sourceURL=aufgabe.js')();
    } catch (e) {
      err = e;
    }
    scope.dispatchEvent(errorEvent('error', { error: err, message: 'Uncaught Error: zwei' }));
    expect(posted).toEqual([{ status: 'error', message: 'zwei', line: 2 }]);
  });
});
