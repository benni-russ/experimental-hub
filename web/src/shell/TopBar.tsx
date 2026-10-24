import { useEffect, useRef, useState, type RefObject } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { Icon } from '../design/components/Icon';
import { Kbd } from '../design/components/Kbd';
import { searchPath } from '../search/search';
import type { Mode } from '../theme';
import { Bell } from './Bell';
import { isSearchHotkey, isTypingTarget } from './hotkey';
import { SIDEBAR_ID } from './Sidebar';

const SEARCH_PATH = '/suche';

/** Nennt den Modus, zu dem umgeschaltet wird, mit Verb. */
export function modeLabel(next: Mode): string {
  return next === 'dunkel' ? 'Zu dunklem Modus wechseln' : 'Zu hellem Modus wechseln';
}

/**
 * Suchzeile: Tippen führt sofort auf /suche?q=…. Der erste Buchstabe legt
 * einen History-Eintrag an (Zurück führt zur vorigen Seite), alle weiteren
 * ersetzen ihn. Das Feld hält seinen Wert selbst und übernimmt den aus der
 * Adresse nur, solange es nicht fokussiert ist – sonst überholt die Adresse
 * beim schnellen Tippen den Wert und Buchstaben gehen verloren.
 */
function SearchField() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const onSearchPage = pathname === SEARCH_PATH;
  const urlQuery = onSearchPage ? (params.get('q') ?? '') : '';
  const [value, setValue] = useState(urlQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  // Schon auf dem Weg zu /suche, auch wenn die Adresse noch nicht neu gezeichnet ist.
  const startedRef = useRef(false);

  useEffect(() => {
    if (document.activeElement !== inputRef.current) setValue(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    if (!onSearchPage) startedRef.current = false;
  }, [onSearchPage]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { key, ctrlKey, metaKey, altKey } = e;
      if (!isSearchHotkey({ key, ctrlKey, metaKey, altKey, typing: isTypingTarget(e.target) })) return;
      e.preventDefault();
      inputRef.current?.focus();
      inputRef.current?.select();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <form
      role="search"
      className="topbar-search"
      onSubmit={(e) => {
        e.preventDefault();
        navigate(searchPath(value), { replace: onSearchPage });
      }}
    >
      <label htmlFor="suche-feld" className="visually-hidden">
        Suchen
      </label>
      <Icon name="search" size={18} />
      <input
        ref={inputRef}
        id="suche-feld"
        type="search"
        className="topbar-search-input"
        placeholder="Versuche, Karten, Notizen suchen"
        autoComplete="off"
        enterKeyHint="search"
        aria-keyshortcuts="/"
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          setValue(next);
          navigate(searchPath(next), { replace: onSearchPage || startedRef.current });
          startedRef.current = true;
        }}
      />
      {value === '' ? (
        <span className="topbar-search-key" aria-hidden="true">
          <Kbd>/</Kbd>
        </span>
      ) : null}
    </form>
  );
}

export function TopBar({
  menuRef,
  drawerOpen,
  onOpenDrawer,
  nextMode,
  onToggleMode,
}: {
  menuRef: RefObject<HTMLButtonElement | null>;
  drawerOpen: boolean;
  onOpenDrawer: () => void;
  nextMode: Mode;
  onToggleMode: () => void;
}) {
  const label = modeLabel(nextMode);
  return (
    <header className="topbar">
      <button
        ref={menuRef}
        type="button"
        className="icon-button topbar-menu"
        aria-label="Menü öffnen"
        aria-expanded={drawerOpen}
        aria-controls={SIDEBAR_ID}
        onClick={onOpenDrawer}
      >
        <Icon name="menu" size={20} />
      </button>
      <SearchField />
      <div className="topbar-actions">
        <Bell />
        <button type="button" className="icon-button theme-toggle" aria-label={label} title={label} onClick={onToggleMode}>
          <Icon name={nextMode === 'dunkel' ? 'moon' : 'sun'} size={20} />
        </button>
      </div>
    </header>
  );
}
