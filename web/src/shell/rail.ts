// Gemerkt im Browser, ob die Seitenleiste als Schiene eingeklappt ist. Schon
// der Zugriff auf localStorage kann werfen (privates Fenster, gesperrte
// Website-Daten); dann bleibt sie ausgeklappt bzw. gilt die Wahl nur bis zum
// Neuladen.

export const RAIL_KEY = 'hub-seitenleiste-schmal';

type StorageGetter<K extends keyof Storage> = () => Pick<Storage, K>;

export const browserStorage = () => window.localStorage;

export function readRail(storage: StorageGetter<'getItem'>): boolean {
  try {
    return storage().getItem(RAIL_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeRail(storage: StorageGetter<'setItem'>, rail: boolean): void {
  try {
    storage().setItem(RAIL_KEY, rail ? '1' : '0');
  } catch {
    // Nicht merkbar: gilt nur bis zum Neuladen.
  }
}
