import { Link } from 'react-router';
import type { Crumb } from './breadcrumbs';

/** Brotkrumen über der Überschrift; das letzte Glied ist die aktuelle Seite, ohne Link. */
export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Brotkrumen" className="breadcrumb">
      <ol>
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <li key={`${i}-${c.label}`}>
              {last || !c.to ? <span aria-current={last ? 'page' : undefined}>{c.label}</span> : <Link to={c.to}>{c.label}</Link>}
              {last ? null : (
                <span className="breadcrumb-sep" aria-hidden="true">
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
