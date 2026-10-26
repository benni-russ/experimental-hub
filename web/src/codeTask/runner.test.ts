import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createRunner, type WorkerLike } from './runner';
import type { RunResult } from './types';

class FakeWorker implements WorkerLike {
  onmessage: ((e: { data: unknown }) => void) | null = null;
  onerror: ((e: unknown) => void) | null = null;
  posted: unknown[] = [];
  terminated = false;
  postMessage(m: unknown) {
    this.posted.push(m);
  }
  terminate() {
    this.terminated = true;
  }
  reply(data: RunResult) {
    this.onmessage?.({ data });
  }
}

function setup() {
  const workers: FakeWorker[] = [];
  const runner = createRunner(() => {
    const w = new FakeWorker();
    workers.push(w);
    return w;
  });
  return { workers, runner };
}

describe('createRunner', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('reicht die Antwort durch und beendet den Worker', async () => {
    const { workers, runner } = setup();
    const p = runner.run('t-1', 'return {};');
    expect(workers[0]?.posted).toEqual([{ taskId: 't-1', code: 'return {};' }]);
    workers[0]?.reply({ status: 'ok', results: [] });
    await expect(p).resolves.toEqual({ status: 'ok', results: [] });
    expect(workers[0]?.terminated).toBe(true);
  });

  it('meldet timeout nach 2000 ms und beendet den Worker', async () => {
    const { workers, runner } = setup();
    const p = runner.run('t-1', 'while (true) {}');
    await vi.advanceTimersByTimeAsync(1999);
    expect(workers[0]?.terminated).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await expect(p).resolves.toEqual({ status: 'timeout' });
    expect(workers[0]?.terminated).toBe(true);
  });

  it('ein zweiter Lauf ersetzt den ersten', async () => {
    const { workers, runner } = setup();
    const first = runner.run('t-1', 'a');
    const second = runner.run('t-1', 'b');
    await expect(first).resolves.toBe('superseded');
    expect(workers[0]?.terminated).toBe(true);
    workers[0]?.reply({ status: 'timeout' }); // später Nachzügler zählt nicht
    workers[1]?.reply({ status: 'ok', results: [] });
    await expect(second).resolves.toEqual({ status: 'ok', results: [] });
  });

  it('der Timer des ersten Laufs trifft den zweiten nicht', async () => {
    const { workers, runner } = setup();
    void runner.run('t-1', 'a');
    await vi.advanceTimersByTimeAsync(1500);
    const second = runner.run('t-1', 'b');
    await vi.advanceTimersByTimeAsync(1000);
    expect(workers[1]?.terminated).toBe(false);
    workers[1]?.reply({ status: 'ok', results: [] });
    await expect(second).resolves.toEqual({ status: 'ok', results: [] });
  });

  it('übersetzt onerror in eine verständliche Meldung', async () => {
    const { workers, runner } = setup();
    const p = runner.run('t-1', 'a');
    workers[0]?.onerror?.(new Event('error'));
    await expect(p).resolves.toEqual({
      status: 'error',
      message: 'Die Prüfung konnte nicht gestartet werden.',
    });
    expect(workers[0]?.terminated).toBe(true);
  });

  it('cancel beendet den laufenden Lauf', async () => {
    const { workers, runner } = setup();
    const p = runner.run('t-1', 'a');
    runner.cancel();
    await expect(p).resolves.toBe('superseded');
    expect(workers[0]?.terminated).toBe(true);
  });
});
