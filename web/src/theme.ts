// Hell/dunkel: ohne Wahl folgt die Seite dem System (prefers-color-scheme in
// tokens.css). Die Wahl setzt data-modus auf <html> und bleibt im Browser.
export type Mode = 'hell' | 'dunkel';

const KEY = 'hub-modus';

export function storedMode(): Mode | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'hell' || v === 'dunkel' ? v : null;
  } catch {
    return null;
  }
}

export function applyMode(mode: Mode | null): void {
  if (mode) document.documentElement.setAttribute('data-modus', mode);
  else document.documentElement.removeAttribute('data-modus');
}

export function saveMode(mode: Mode): void {
  try {
    localStorage.setItem(KEY, mode);
  } catch {
    // Privates Fenster o. Ä.: Die Wahl gilt dann nur für diese Sitzung.
  }
}

export function effectiveMode(): Mode {
  const set = document.documentElement.getAttribute('data-modus');
  if (set === 'hell' || set === 'dunkel') return set;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dunkel' : 'hell';
}
