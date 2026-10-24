import type { ReactNode } from 'react';

/** Gold-Rolle: nur für Erkenntnis (Auflösung, Vorher/Nachher, Veränderung). */
export function InsightBox({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <aside className="insight">
      {title ? <strong className="insight-title">{title}</strong> : null}
      <div>{children}</div>
    </aside>
  );
}
