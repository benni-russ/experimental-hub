// Fühltest INP: echte Blockade des Hauptthreads und eine grobe Messung bis zum nächsten Bild.

/** Hält den Hauptthread `ms` Millisekunden lang beschäftigt (Schleife über performance.now()). */
export function blockFor(ms: number): void {
  const until = performance.now() + Math.max(0, ms);
  while (performance.now() < until) {
    // absichtlich leer: Die Schleife ist die lange Aufgabe.
  }
}

/** Dauer von der Eingabe bis zum nächsten Bild in ganzen Millisekunden, nie negativ. */
export function measureNextPaint(start: number, now: number): number {
  return Math.max(0, Math.round(now - start));
}

/** Die drei Knöpfe des Fühltests. */
export const BLOCK_DURATIONS = [50, 200, 600] as const;
