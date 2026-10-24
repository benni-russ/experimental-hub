import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useDueCards } from '../api';
import { Icon } from '../design/components/Icon';
import { resolveReviewItems, reviewScopeHref } from '../pages/reviewItems';
import { reviewLookup } from '../pages/reviewLookup';
import { bellLabel, dueHeadline, groupDue } from './due';

const POPOVER_ID = 'faellig-feld';

/**
 * Glocke in der oberen Leiste: Zahl der fälligen Karten als Pille, ein Klick
 * öffnet die Aufschlüsselung je Projekt. Die Zahl kommt aus derselben Liste
 * wie die Lernrunde (gleiche Query, gleiche Auflösung), damit beide stimmen.
 */
export function Bell() {
  const due = useDueCards();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { pathname, search } = useLocation();
  const where = pathname + search;

  const groups = useMemo(() => (due.data ? groupDue(resolveReviewItems(due.data, reviewLookup)) : []), [due.data]);
  const total = groups.reduce((sum, g) => sum + g.count, 0);

  // Ein Ziel gewählt (z. B. „Lernrunde starten“): Das Feld geht zu.
  const [lastPath, setLastPath] = useState(where);
  if (lastPath !== where) {
    setLastPath(where);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    // Klick daneben schließt. Der Fokus springt nur zurück, wenn er im Feld
    // stand – sonst gehört er dem, was gerade angeklickt wurde.
    const onPointer = (e: PointerEvent) => {
      const wrap = wrapRef.current;
      if (!wrap || wrap.contains(e.target as Node)) return;
      const focusInside = wrap.contains(document.activeElement);
      setOpen(false);
      if (focusInside) buttonRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <div
      className="bell"
      ref={wrapRef}
      onBlur={(e) => {
        // Mit Tab aus dem Feld heraus: schließen.
        const next = e.relatedTarget;
        if (open && next instanceof Node && !e.currentTarget.contains(next)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        className="icon-button bell-button"
        aria-label={bellLabel(total)}
        aria-expanded={open}
        aria-controls={POPOVER_ID}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="bell" size={20} />
        {total > 0 ? (
          <span className="nav-badge" aria-hidden="true">
            {total}
          </span>
        ) : null}
      </button>
      <div id={POPOVER_ID} className="bell-popover" hidden={!open}>
        {due.data === undefined ? (
          due.isError ? (
            <p className="field-error">Die fälligen Karten konnten nicht geladen werden.</p>
          ) : (
            <p className="bell-note">Lädt …</p>
          )
        ) : total === 0 ? (
          <p className="bell-note">Gerade ist nichts fällig.</p>
        ) : (
          <>
            <p className="bell-title">{dueHeadline(total)}</p>
            <ul className="bell-list">
              {groups.map((g) => (
                <li key={g.projectId}>
                  <Link to={reviewScopeHref({ kind: 'project', projectId: g.projectId })} className="bell-row" onClick={() => setOpen(false)}>
                    <span className="bell-project">{g.title}</span>
                    <span className="bell-count">{g.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/lernrunde" className="btn btn-primary bell-start" onClick={() => setOpen(false)}>
              Lernrunde starten
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
