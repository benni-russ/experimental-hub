import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { Icon } from '../design/components/Icon';
import { alignFirst, isOnPage, pageLabel } from './cardPages';

/** Ab dieser Breite des Abschnitts stehen zwei Karten nebeneinander. */
const TWO_COLUMNS_FROM = 600;

interface CardPagerProps<T> {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T) => ReactNode;
  /** Benennt den Bereich für Screenreader, etwa „Karten“ oder „Eigene Karten“. */
  label: string;
}

/**
 * Eine oder zwei Karten je Seite, weitere über ‹ und › erreichbar. Alle Karten
 * bleiben gerendert und liegen je Spalte in derselben Rasterzelle; so ist jede
 * Karte so hoch wie die höchste, die Höhe springt beim Blättern nicht, und
 * umgedrehte Karten bleiben umgedreht. Unsichtbare Karten sind inert.
 */
export function CardPager<T>({ items, getKey, renderItem, label }: CardPagerProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [perPage, setPerPage] = useState(1);
  const [first, setFirst] = useState(0);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => setPerPage(root.clientWidth >= TWO_COLUMNS_FROM ? 2 : 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  const total = items.length;
  const start = alignFirst(first, total, perPage);
  const atStart = start === 0;
  const atEnd = start + perPage >= total;

  function go(step: -1 | 1) {
    const next = alignFirst(start + step * perPage, total, perPage);
    setFirst(next);
    // Wird der gedrückte Knopf am Rand inaktiv, wandert der Fokus zum anderen.
    if (step === 1 && next + perPage >= total) prevRef.current?.focus();
    if (step === -1 && next === 0) nextRef.current?.focus();
  }

  return (
    <div className="card-pager" ref={rootRef} role="group" aria-label={label}>
      <ul className="plain-list card-pager-track" style={{ gridTemplateColumns: `repeat(${perPage}, minmax(0, 1fr))` }}>
        {items.map((item, i) => {
          const visible = isOnPage(i, start, perPage);
          return (
            <li
              key={getKey(item)}
              className={visible ? undefined : 'is-off'}
              style={{ gridColumn: (i % perPage) + 1, gridRow: 1 }}
              aria-hidden={visible ? undefined : 'true'}
              inert={!visible}
            >
              {renderItem(item)}
            </li>
          );
        })}
      </ul>
      {total > perPage ? (
        <div className="card-pager-nav">
          <button
            ref={prevRef}
            type="button"
            className="btn btn-secondary card-pager-button"
            aria-label="Vorherige Karten"
            disabled={atStart}
            onClick={() => go(-1)}
          >
            <Icon name="chevron-left" />
          </button>
          <span className="card-pager-position" aria-live="polite">
            {pageLabel(start, perPage, total)}
          </span>
          <button
            ref={nextRef}
            type="button"
            className="btn btn-secondary card-pager-button"
            aria-label="Nächste Karten"
            disabled={atEnd}
            onClick={() => go(1)}
          >
            <Icon name="chevron-right" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
