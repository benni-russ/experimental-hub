import { EFFECTS, type FeedEntry, type FeedIssue, type IssueAction } from '../../personalization/inspectFeed';

export const issueKey = (i: FeedIssue) => `${i.index}:${i.field}:${i.code}`;

const SIGN: Record<IssueAction, string> = { drop: '✕', repair: '⚠', warn: 'ℹ' };
const WORD: Record<IssueAction, string> = { drop: 'aussortiert', repair: 'repariert', warn: 'Hinweis' };

interface IssueListProps {
  entries: FeedEntry[];
  issues: FeedIssue[];
  /** Schlüssel des markierten Issues */
  marked: string | null;
  onMark: (issue: FeedIssue | null) => void;
  headingId: string;
}

/** Zusammenfassung nach Einträgen: je Eintrag zählt die schwerste Aktion. */
export function summarize(entries: FeedEntry[], issues: FeedIssue[]) {
  let dropped = 0;
  let repaired = 0;
  let warned = 0;
  for (const e of entries) {
    const own = issues.filter((i) => i.index === e.index);
    if (own.some((i) => i.action === 'drop')) dropped++;
    else if (own.some((i) => i.action === 'repair')) repaired++;
    else if (own.some((i) => i.action === 'warn')) warned++;
  }
  return { total: entries.length, dropped, repaired, warned, clean: entries.length - dropped - repaired - warned };
}

/** Die Fehler des Feeds, gruppiert nach ihrer Wirkung auf Empfehlungen. Ein Klick markiert den Eintrag im Feed. */
export function IssueList({ entries, issues, marked, onMark, headingId }: IssueListProps) {
  const groups = new Map<string, FeedIssue[]>();
  for (const issue of issues) {
    const effect = EFFECTS[issue.code];
    groups.set(effect, [...(groups.get(effect) ?? []), issue]);
  }
  const s = summarize(entries, issues);

  return (
    <section className="fi-panel" aria-labelledby={headingId}>
      <h3 id={headingId}>Fehler nach Wirkung</h3>
      <p className="fi-summary">
        {s.total} Einträge: <strong>{s.clean} fehlerfrei</strong>, {s.dropped} aussortiert, {s.repaired} repariert, {s.warned} nur mit Hinweis.
      </p>
      {issues.length === 0 ? (
        <p className="fi-hint">Der Feed hat keine Fehler.</p>
      ) : (
        <>
          <p className="fi-hint">Wähl einen Fehler, um seinen Eintrag im Feed zu markieren; ein zweiter Klick hebt die Markierung auf.</p>
          {[...groups].map(([effect, list]) => (
            <div key={effect} className="fi-group">
              <h4>Wirkung: {effect}</h4>
              <ul className="fi-issues">
                {list.map((issue) => {
                  const key = issueKey(issue);
                  const pressed = key === marked;
                  const action = issue.action;
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        className="fi-issue"
                        aria-pressed={pressed}
                        disabled={issue.index < 0}
                        onClick={() => onMark(pressed ? null : issue)}
                      >
                        <span className="fi-issue-head">
                          <strong>{issue.productId ?? `Eintrag ${issue.index + 1}`}</strong>
                          <code className="fi-issue-field">{issue.field}</code>
                          {action ? (
                            <span className={`tag fi-tag fi-tag-${action}`}>
                              <span aria-hidden="true">{SIGN[action]}</span> {WORD[action]}
                            </span>
                          ) : null}
                        </span>
                        <span className="fi-issue-message">{issue.message}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </>
      )}
    </section>
  );
}
