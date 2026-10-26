import { Icon } from '../../design/components/Icon';
import { issueKey, type Issue } from './validateEvent';

interface IssueListProps {
  issues: Issue[];
  /** Schlüssel des markierten Issues */
  marked: string | null;
  onMark: (issue: Issue | null) => void;
  headingId: string;
}

/** Ergebnis des Prüfers. Ein Klick auf ein Issue markiert seine Zeile im JSON, ein zweiter hebt das auf. */
export function IssueList({ issues, marked, onMark, headingId }: IssueListProps) {
  const ok = issues.length === 0;
  const summary = ok
    ? 'Keine Probleme: Das Event ist gültig.'
    : `${issues.length} ${issues.length === 1 ? 'Problem' : 'Probleme'} gefunden.`;

  return (
    <section className="ga4-panel" aria-labelledby={headingId}>
      <h3 id={headingId}>Prüfer</h3>
      <p className={`ga4-summary ${ok ? 'is-ok' : 'is-bad'}`} role="status" aria-atomic="true">
        <Icon name={ok ? 'check' : 'cross'} /> {summary}
      </p>
      {ok ? null : (
        <>
          <p className="ga4-hint">Wähl ein Problem, um seine Stelle im JSON zu markieren.</p>
          <ul className="ga4-issues">
            {issues.map((issue) => {
              const key = issueKey(issue);
              const pressed = key === marked;
              return (
                <li key={key}>
                  <button
                    type="button"
                    className="ga4-issue"
                    aria-pressed={pressed}
                    onClick={() => onMark(pressed ? null : issue)}
                  >
                    <span className="ga4-issue-head">
                      <code className="ga4-issue-code">{issue.code}</code>
                      <code className="ga4-issue-path">{issue.path || '(ganzes Event)'}</code>
                    </span>
                    <span className="ga4-issue-message">{issue.message}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
