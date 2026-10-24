import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import { applyMode, effectiveMode, saveMode, type Mode } from './theme.js';
import { Icon } from './design/components/Icon';
import { HOME, NOTES, PATH, REVIEW, type NavItem } from './shell/nav';
import { browserStorage, readRail, writeRail } from './shell/rail';
import { Sidebar } from './shell/Sidebar';
import { TopBar, modeLabel } from './shell/TopBar';
import './shell/shell.css';

const DESKTOP = '(min-width: 768px)';

function useMode() {
  const [mode, setMode] = useState<Mode>(effectiveMode);
  const next: Mode = mode === 'dunkel' ? 'hell' : 'dunkel';
  const toggle = () => {
    applyMode(next);
    saveMode(next);
    setMode(next);
  };
  return { next, toggle };
}

function Slot({ item }: { item: NavItem }) {
  return (
    <NavLink to={item.to} end={item.end} className="tabbar-slot">
      <span className="tabbar-icon">
        <Icon name={item.icon} size={22} />
      </span>
      <span className="tabbar-label">{item.label}</span>
    </NavLink>
  );
}

// Die Leiste am unteren Rand auf schmalen Bildschirmen: Icon vor Wort, in der Mitte „Heute“ als großer runder Knopf.
// Der Modus-Schalter steht mobil hier statt oben, damit die Mitte symmetrisch bleibt.
function TabBar({ next, toggle }: ReturnType<typeof useMode>) {
  return (
    <nav className="tabbar" aria-label="Schnellnavigation">
      <Slot item={PATH} />
      <Slot item={REVIEW} />
      <div className="tabbar-center">
        <NavLink to={HOME.to} end className="tabbar-home" aria-label={HOME.label}>
          <Icon name={HOME.icon} size={26} />
        </NavLink>
      </div>
      <Slot item={NOTES} />
      <button type="button" className="tabbar-slot" aria-label={modeLabel(next)} onClick={toggle}>
        <span className="tabbar-icon">
          <Icon name={next === 'dunkel' ? 'moon' : 'sun'} size={22} />
        </span>
        <span className="tabbar-label" aria-hidden="true">
          {next === 'dunkel' ? 'Dunkel' : 'Hell'}
        </span>
      </button>
    </nav>
  );
}

export function Layout() {
  const mode = useMode();
  const { pathname } = useLocation();
  const [rail, setRail] = useState(() => readRail(browserStorage));
  const [drawerOpen, setDrawerOpen] = useState(false);
  // Wohin der Fokus nach dem Schließen geht. Erst nach dem Rendern setzbar:
  // Solange die Schublade offen ist, ist der Rest inert.
  const [focusAfterClose, setFocusAfterClose] = useState<'menu' | 'main' | null>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const mainRef = useRef<HTMLElement>(null);

  // Esc, Schleier, „Menü schließen“: zurück zum Menü-Knopf.
  const closeDrawer = () => {
    setDrawerOpen(false);
    setFocusAfterClose('menu');
  };

  const toggleRail = () => {
    const next = !rail;
    writeRail(browserStorage, next);
    setRail(next);
  };

  // Ein Ziel in der Schublade gewählt: Sie geht zu. Beim Rendern statt im
  // Effekt, damit die neue Seite nicht erst mit offener Schublade erscheint.
  const [lastPath, setLastPath] = useState(pathname);
  // Der Fokus gehört dann der neuen Seite, nicht dem Menü-Knopf.
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (drawerOpen) {
      setDrawerOpen(false);
      setFocusAfterClose('main');
    }
  }

  useEffect(() => {
    if (drawerOpen || focusAfterClose === null) return;
    (focusAfterClose === 'menu' ? menuRef : mainRef).current?.focus({ preventScroll: true });
    setFocusAfterClose(null);
  }, [drawerOpen, focusAfterClose]);

  // Esc schließt die Schublade; wird das Fenster breit, gibt es keine Schublade mehr.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    const wide = window.matchMedia(DESKTOP);
    const onWide = () => {
      if (wide.matches) setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    return () => {
      window.removeEventListener('keydown', onKey);
      wide.removeEventListener('change', onWide);
    };
    // closeDrawer setzt nur State und ist bei jedem Rendern gleichwertig.
  }, [drawerOpen]);

  const className = ['shell', rail ? 'shell-rail' : '', drawerOpen ? 'shell-drawer-open' : ''].filter(Boolean).join(' ');

  return (
    <div className={className}>
      {/* Bei offener Schublade gibt es nichts, wohin er springen könnte. */}
      <a className="skip-link" href="#inhalt" inert={drawerOpen}>
        Zum Inhalt springen
      </a>
      {/* Am Handy: Schleier hinter der offenen Schublade, ein Tipp schließt. */}
      <div className="shell-scrim" aria-hidden="true" onClick={closeDrawer} />
      <Sidebar
        rail={rail}
        onToggleRail={toggleRail}
        open={drawerOpen}
        onClose={closeDrawer}
      />
      {/* Hinter der offenen Schublade ist nichts bedienbar. */}
      <div className="shell-body" inert={drawerOpen}>
        <TopBar
          menuRef={menuRef}
          drawerOpen={drawerOpen}
          onOpenDrawer={() => setDrawerOpen(true)}
          nextMode={mode.next}
          onToggleMode={mode.toggle}
        />
        <main id="inhalt" ref={mainRef} className="shell-main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      <div className="shell-tabbar" inert={drawerOpen}>
        <TabBar {...mode} />
      </div>
    </div>
  );
}
