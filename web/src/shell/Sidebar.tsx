import { useEffect, useRef, type ReactNode } from 'react';
import { NavLink } from 'react-router';
import { Icon } from '../design/components/Icon';
import { EXTRA_LINKS, NAV } from './nav';
import { useServerStatus } from './useServerStatus';

/**
 * Die Seitenleiste: oben die Marke, dann die Bereiche, falls beim Bauen
 * gesetzt weitere Apps, unten die Statuskarte und das Einklappen.
 *
 * Ab 768 px steht sie fest links und lässt sich auf eine Schiene von 64 px
 * einklappen (12 px Rand, 10 px Polster, 20 px Icon – beim Einklappen
 * verschiebt sich nichts). Die Wörter blenden dort aus, bleiben aber für
 * Screenreader da; das Wort steht als Tooltip daneben (`data-tip`).
 *
 * Darunter ist dieselbe Leiste die Schublade hinter dem Menü-Knopf. Geschlossen
 * ist sie unsichtbar (`visibility: hidden`), damit die Tab-Taste nicht durch
 * Links läuft, die niemand sieht.
 */

export const SIDEBAR_ID = 'seitenleiste';

function Word({ children }: { children: ReactNode }) {
  return <span className="sidebar-word">{children}</span>;
}

function Brand() {
  return (
    <div className="sidebar-brand">
      <span className="brand-mark" aria-hidden="true">
        EH
      </span>
      <span className="sidebar-word brand-name">Experimental Hub</span>
    </div>
  );
}

function StatusCard() {
  const { tone, text } = useServerStatus();
  return (
    <div className="status-card" data-tip={text}>
      <span className={`status-dot status-dot-${tone}`} aria-hidden="true" />
      {/* „Server erreichbar · gespeichert 09:05“ steht in zwei Zeilen */}
      <span className="sidebar-word status-text">
        {text.split(' · ').map((line, i) => (
          <span key={i} className="status-line">
            {i > 0 ? <span className="visually-hidden"> · </span> : null}
            {line}
          </span>
        ))}
      </span>
    </div>
  );
}

export function Sidebar({
  rail,
  onToggleRail,
  open,
  onClose,
}: {
  rail: boolean;
  onToggleRail: () => void;
  /** nur unter 768 px: Schublade offen (ab 768 px schließt der Rahmen sie) */
  open: boolean;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Geht die Schublade auf, steht der Fokus in ihr. Wohin er beim Schließen
  // geht, entscheidet der Rahmen (Menü-Knopf oder neue Seite).
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  // Offen ist die Schublade ein modaler Dialog; sonst eine Landmarke.
  const dialog = open ? ({ role: 'dialog', 'aria-modal': true, 'aria-label': 'Menü' } as const) : { 'aria-label': 'Seitenleiste' };

  return (
    <aside id={SIDEBAR_ID} className="sidebar" {...dialog}>
      <div className="sidebar-head">
        <Brand />
        <button
          ref={closeRef}
          type="button"
          className="icon-button sidebar-close"
          aria-label="Menü schließen"
          onClick={onClose}
        >
          <Icon name="cross" size={20} />
        </button>
      </div>

      <nav className="sidebar-nav" aria-label="Hauptnavigation">
        <ul className="sidebar-list">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.end} className="sidebar-link" data-tip={item.label}>
                <Icon name={item.icon} size={20} />
                <Word>{item.label}</Word>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {EXTRA_LINKS.length > 0 ? (
        <nav className="sidebar-nav" aria-labelledby="h-links">
          <p id="h-links" className="sidebar-section">
            <Word>Weitere Apps</Word>
          </p>
          <ul className="sidebar-list">
            {EXTRA_LINKS.map((app) => (
              <li key={app.href}>
                <a href={app.href} className="sidebar-link" data-tip={app.label}>
                  <Icon name={app.icon} size={20} />
                  <Word>{app.label}</Word>
                  <span className="sidebar-external">
                    <Icon name="external" size={14} />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <div className="sidebar-foot">
        <StatusCard />
        <button
          type="button"
          className="sidebar-link sidebar-collapse"
          aria-label={rail ? 'Seitenleiste ausklappen' : 'Seitenleiste einklappen'}
          aria-expanded={!rail}
          aria-controls={SIDEBAR_ID}
          data-tip="Ausklappen"
          onClick={onToggleRail}
        >
          <Icon name="panel" size={20} />
          <Word>Einklappen</Word>
        </button>
      </div>
    </aside>
  );
}
