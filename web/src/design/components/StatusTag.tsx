import type { ProjectStatus } from '../../projects/status';
import { STATUS_TEXT } from '../../projects/status';

// Gezeichnetes Status-Zeichen, dieselbe Grammatik wie die Punktreihe:
// leer = offen, halb = begonnen, Haken = durchgearbeitet.
export function StatusMark({ status }: { status: ProjectStatus }) {
  return (
    <svg className="status-mark" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      {status === 'done' ? (
        <path d="M2 6.5l2.5 2.5L10 3" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <>
          <circle cx="6" cy="6" r="4.75" stroke="currentColor" strokeWidth={1.5} />
          {status === 'started' ? <path d="M6 1.25a4.75 4.75 0 0 0 0 9.5z" fill="currentColor" /> : null}
        </>
      )}
    </svg>
  );
}

// Zeichen und Wort tragen den Status; die Fläche hilft nur beim Überfliegen.
export function StatusTag({ status }: { status: ProjectStatus }) {
  return (
    <span className={`tag tag-${status}`}>
      <StatusMark status={status} /> {STATUS_TEXT[status]}
    </span>
  );
}
