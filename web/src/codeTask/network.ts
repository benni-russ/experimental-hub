// Namen, über die Code aus dem Worker echte Anfragen schicken oder speichern könnte.
const NETWORK_NAMES = [
  'fetch',
  'XMLHttpRequest',
  'WebSocket',
  'EventSource',
  'importScripts',
  'indexedDB',
  'caches',
] as const;

export const NETWORK_BLOCKED = (name: string) =>
  `\`${name}\` ist in dieser Übung gesperrt: Der Code schickt keine echten Anfragen ins Netz.`;

/**
 * Platzhalter, der bei jedem Gebrauch eine lesbare Meldung wirft: als
 * Aufruf (`fetch()`), mit `new` (`new WebSocket()`) und beim Zugriff auf
 * ein Feld (`indexedDB.open`). Eine normale `function`, damit `new` geht.
 */
function blocked(name: string): unknown {
  const fail = () => {
    throw new Error(NETWORK_BLOCKED(name));
  };
  return new Proxy(function () {}, { apply: fail, construct: fail, get: fail });
}

/** Sperr-Globals für den Nutzercode; die Globals des Prüfmoduls kommen danach und gewinnen. */
export function blockedGlobals(): Record<string, unknown> {
  return Object.fromEntries(NETWORK_NAMES.map((name) => [name, blocked(name)]));
}

/**
 * Überschreibt die Netz-Namen auf dem Worker-Global selbst, damit auch
 * `globalThis.fetch` oder `self.fetch` ins Leere laufen. Erst aufrufen,
 * wenn das Prüfmodul geladen ist.
 */
export function blockNetwork(scope: object): void {
  for (const name of NETWORK_NAMES) {
    try {
      Object.defineProperty(scope, name, { value: blocked(name), configurable: false, writable: false });
    } catch {
      // Nicht überschreibbar: dann bleibt es bei der Sperre über die Globals.
    }
  }
}
