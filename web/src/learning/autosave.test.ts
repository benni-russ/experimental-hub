import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createAutosaver, type SaveStatus } from './autosave';

describe('createAutosaver', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup(save: (v: string) => Promise<void>) {
    const statuses: SaveStatus[] = [];
    const saver = createAutosaver(save, { delayMs: 800, onStatus: (s) => statuses.push(s) });
    return { saver, statuses };
  }

  it('speichert nur den letzten Wert nach der Pause', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const { saver, statuses } = setup(save);
    saver.schedule('a');
    await vi.advanceTimersByTimeAsync(300);
    saver.schedule('b');
    await vi.advanceTimersByTimeAsync(300);
    saver.schedule('c');
    expect(save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(800);
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith('c');
    expect(statuses[0]).toBe('pending');
    expect(statuses.at(-1)).toBe('saved');
  });

  it('meldet error und versucht es beim nächsten Tippen mit dem neuesten Wert', async () => {
    const save = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue(undefined);
    const { saver, statuses } = setup(save);
    saver.schedule('c');
    await vi.advanceTimersByTimeAsync(800);
    expect(statuses.at(-1)).toBe('error');
    saver.schedule('d');
    await vi.advanceTimersByTimeAsync(800);
    expect(save).toHaveBeenLastCalledWith('d');
    expect(statuses.at(-1)).toBe('saved');
  });

  it('flush speichert ausstehenden Wert sofort', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const { saver } = setup(save);
    saver.schedule('x');
    await saver.flush();
    expect(save).toHaveBeenCalledWith('x');
    // Timer wurde geleert: kein zweites Speichern
    await vi.advanceTimersByTimeAsync(2000);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('flush ohne ausstehenden Wert tut nichts', async () => {
    const save = vi.fn().mockResolvedValue(undefined);
    const { saver, statuses } = setup(save);
    await saver.flush();
    expect(save).not.toHaveBeenCalled();
    expect(statuses).toEqual([]);
  });

  it('verliert keinen Wert, der während eines laufenden Speicherns geschrieben wird', async () => {
    let release: () => void = () => {};
    const save = vi
      .fn()
      .mockImplementationOnce(() => new Promise<void>((r) => (release = r)))
      .mockResolvedValue(undefined);
    const { saver, statuses } = setup(save);
    saver.schedule('a');
    await vi.advanceTimersByTimeAsync(800);
    expect(save).toHaveBeenCalledTimes(1);
    saver.schedule('b'); // während 'a' noch gespeichert wird
    release();
    await vi.advanceTimersByTimeAsync(800);
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith('b');
    expect(statuses.at(-1)).toBe('saved');
  });
});
