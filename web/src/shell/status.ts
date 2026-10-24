// Statuskarte unten in der Seitenleiste: Ist der Server da, und hat das
// letzte Speichern geklappt? Rein, damit die Reihenfolge getestet ist.

export type StatusTone = 'ok' | 'busy' | 'error' | 'unknown';

export interface StatusInput {
  /** eine Änderung ist gerade unterwegs (ohne wartende) */
  saving: boolean;
  /** eine Änderung wartet, weil kein Netz da ist (react-query pausiert sie) */
  paused: boolean;
  /** Zeitpunkt (ms) des letzten erfolgreichen Speicherns in dieser Sitzung */
  lastSavedAt: number | null;
  /** Fehler des letzten Speicherns; null, wenn es geklappt hat */
  saveError: unknown;
  /** Fehler beim Laden des Lernstands */
  stateError: unknown;
  stateLoaded: boolean;
}

/** Kein Kontakt: Netz weg oder der Proxy erreicht den Dienst nicht. */
export function isUnreachable(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;
  const { code, status } = error as { code?: unknown; status?: unknown };
  return code === 'NETWORK' || status === 502 || status === 503 || status === 504;
}

export function formatClock(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export interface SaveState {
  /** Zeitpunkt (ms) des letzten erfolgreichen Speicherns */
  at: number | null;
  /** Fehler des letzten Speicherns; null nach einem Erfolg */
  error: unknown;
}

/**
 * Ein Schritt einer Mutation (Aktion aus dem Mutation-Cache) und was er für die
 * Statuskarte bedeutet. Nur Erfolg und endgültiger Fehler zählen; alles andere
 * gibt denselben Zustand zurück, damit React nicht neu zeichnet.
 */
export function nextSaveState(prev: SaveState, action: { type: string; error?: unknown }, now: number): SaveState {
  if (action.type === 'success') return { at: now, error: null };
  if (action.type === 'error') return { ...prev, error: action.error };
  return prev;
}

export function statusText(input: StatusInput): { tone: StatusTone; text: string } {
  // Wartet eine Änderung, ist kein Netz da; „Speichert …“ wäre gelogen.
  if (input.paused) return { tone: 'error', text: 'Server nicht erreichbar' };
  if (input.saving) return { tone: 'busy', text: 'Speichert …' };
  if (input.saveError) {
    return {
      tone: 'error',
      text: isUnreachable(input.saveError) ? 'Server nicht erreichbar' : 'Speichern fehlgeschlagen',
    };
  }
  if (input.stateError) {
    return {
      tone: 'error',
      text: isUnreachable(input.stateError) ? 'Server nicht erreichbar' : 'Server meldet einen Fehler',
    };
  }
  if (!input.stateLoaded) return { tone: 'unknown', text: 'Verbinde …' };
  const saved = input.lastSavedAt === null ? '' : ` · gespeichert ${formatClock(input.lastSavedAt)}`;
  return { tone: 'ok', text: `Server erreichbar${saved}` };
}
