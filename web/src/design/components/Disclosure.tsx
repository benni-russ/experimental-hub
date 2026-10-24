import { useState } from 'react';
import type { ReactNode } from 'react';
import { Icon } from './Icon';

export function Disclosure({
  summary,
  children,
  defaultOpen = false,
  marker = 'chevron',
  openLabel,
  closedLabel,
}: {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  marker?: 'chevron' | 'help';
  /** Verborgener Text hinter dem Kopf, solange der Inhalt offen ist. */
  openLabel?: string;
  /** Verborgener Text hinter dem Kopf, solange der Inhalt zu ist. */
  closedLabel?: string;
}) {
  // Der native <details>-Zustand ist die Quelle; wir spiegeln ihn nur für den Text.
  const [open, setOpen] = useState(defaultOpen);
  const label = open ? openLabel : closedLabel;
  return (
    <details
      className="disclosure"
      open={defaultOpen}
      onToggle={(e) => setOpen(e.currentTarget.open)}
    >
      <summary>
        <span className="disclosure-summary">
          {summary}
          {label ? <span className="visually-hidden">. {label}</span> : null}
        </span>
        <span className="disclosure-marker" aria-hidden="true">
          {marker === 'help' ? (open ? '×' : '?') : <Icon name="chevron-down" />}
        </span>
      </summary>
      <div className="disclosure-body">{children}</div>
    </details>
  );
}
