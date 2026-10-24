export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

/**
 * Speichert verzögert den jeweils neuesten Wert. Gespeichert wird immer
 * nacheinander; ein Wert, der während eines laufenden Speicherns eintrifft,
 * wird danach gespeichert. Nach einem Fehler bleibt der Wert erhalten, bis ein
 * neuer geschrieben oder `flush` aufgerufen wird.
 */
export function createAutosaver<T>(
  save: (value: T) => Promise<void>,
  opts: { delayMs: number; onStatus: (s: SaveStatus) => void },
): { schedule(value: T): void; flush(): Promise<void> } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let latest: T | undefined;
  let hasValue = false;
  let chain: Promise<void> = Promise.resolve();

  function clearTimer() {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  }

  function run(): Promise<void> {
    clearTimer();
    chain = chain.then(async () => {
      if (!hasValue) return;
      const value = latest as T;
      hasValue = false;
      opts.onStatus('saving');
      try {
        await save(value);
        // Wurde währenddessen neu getippt, läuft schon ein neuer Timer.
        opts.onStatus(hasValue ? 'pending' : 'saved');
      } catch {
        // Ein inzwischen neu getippter Wert wird vom laufenden Timer gespeichert.
        const newerPending = hasValue;
        if (!newerPending) {
          latest = value;
          hasValue = true;
        }
        opts.onStatus(newerPending ? 'pending' : 'error');
      }
    });
    return chain;
  }

  return {
    schedule(value: T) {
      latest = value;
      hasValue = true;
      opts.onStatus('pending');
      clearTimer();
      timer = setTimeout(() => void run(), opts.delayMs);
    },
    flush: run,
  };
}
