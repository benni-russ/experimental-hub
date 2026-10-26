import { useId } from 'react';
import { SegmentedControl } from '../../design/components/SegmentedControl';
import type { FeedEntry, FeedIssue } from '../../personalization/inspectFeed';

export type FeedPane = 'raw' | 'table';

const COLUMNS = ['id', 'title', 'category', 'price', 'availability', 'updatedAt', 'imageLink'] as const;

interface FeedViewProps {
  text: string;
  entries: FeedEntry[];
  issues: FeedIssue[];
  /** Index des markierten Eintrags, oder null */
  marked: number | null;
  pane: FeedPane;
  onPane: (pane: FeedPane) => void;
  headingId: string;
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

// Zeichen und Wort tragen den Fehlerzustand; die Farbe hilft nur beim Überfliegen.
const SIGN = { drop: '✕', repair: '⚠', warn: '⚠' } as const;
const WORD = { drop: 'aussortiert', repair: 'repariert', warn: 'Hinweis' } as const;

/** Schwerste Aktion unter den Issues: aussortieren vor reparieren vor Hinweis. */
function worst(issues: FeedIssue[]): 'drop' | 'repair' | 'warn' | undefined {
  if (issues.some((i) => i.action === 'drop')) return 'drop';
  if (issues.some((i) => i.action === 'repair')) return 'repair';
  if (issues.some((i) => i.action === 'warn')) return 'warn';
  return undefined;
}

function show(value: unknown): string {
  if (value === undefined) return 'fehlt';
  if (typeof value === 'string') return value === '' ? '(leer)' : `„${value}“`;
  return String(value);
}

/** Der Feed als Rohtext mit Zeilennummern und als Tabelle. Fehlerhafte Zellen tragen Zeichen und Wort. */
export function FeedView({ text, entries, issues, marked, pane, onPane, headingId }: FeedViewProps) {
  const id = useId();
  const rawLines = text.split('\n');

  // Je Eintrag: Zeilenbereich im Rohtext. Er reicht bis vor den nächsten Eintrag; beim letzten
  // so weit, wie der eingerückt ausgegebene Eintrag Zeilen hat (der Rohtext ist so erzeugt).
  const ranges = entries.map((e, i) => {
    const next = entries[i + 1];
    const own = (JSON.stringify(e.data, null, 2) ?? '').split('\n').length;
    return { from: e.line, to: next ? next.line - 1 : Math.min(rawLines.length, e.line + own - 1) };
  });
  const entryOfLine = (line: number) => entries.findIndex((_, i) => line >= ranges[i]!.from && line <= ranges[i]!.to);
  const issuesOf = (index: number) => issues.filter((i) => i.index === index);

  return (
    <section className="fi-panel fi-feed" data-pane={pane} aria-labelledby={headingId}>
      <h3 id={headingId}>Der Feed</h3>
      <div className="fi-pane-switch">
        <span id={`${id}-pane`} className="visually-hidden">
          Ansicht
        </span>
        <SegmentedControl
          label="Ansicht"
          labelledBy={`${id}-pane`}
          options={[
            { value: 'raw', label: 'Rohtext' },
            { value: 'table', label: 'Tabelle' },
          ]}
          value={pane}
          onChange={onPane}
        />
      </div>
      <div className="fi-panes">
        <div className="fi-pane fi-pane-raw">
          <pre className="fi-raw" tabIndex={0} role="region" aria-label="Feed als Rohtext">
            {rawLines.map((line, i) => {
              const n = i + 1;
              const entry = entryOfLine(n);
              const entryIssues = entry >= 0 ? issuesOf(entry) : [];
              const level = worst(entryIssues);
              const isStart = entry >= 0 && ranges[entry]!.from === n;
              const isMarked = entry >= 0 && entry === marked;
              return (
                <span
                  key={n}
                  className={`fi-line${isMarked ? ' is-marked' : ''}${level ? ` is-${level}` : ''}`}
                  data-entry={isStart ? entries[entry]!.index : undefined}
                >
                  <span className="fi-line-no" aria-hidden="true">
                    {n}
                  </span>
                  <span className="fi-line-sign" aria-hidden="true">
                    {isMarked ? '▶' : isStart && level ? SIGN[level] : ''}
                  </span>
                  <span className="fi-line-text">{line || ' '}</span>
                </span>
              );
            })}
          </pre>
        </div>
        <div className="fi-pane fi-pane-table">
          <div className="table-scroll" tabIndex={0} role="region" aria-label="Feed als Tabelle">
            <table className="fi-table">
              <thead>
                <tr>
                  <th scope="col">Nr.</th>
                  {COLUMNS.map((c) => (
                    <th key={c} scope="col">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const data = isRecord(entry.data) ? entry.data : {};
                  const entryIssues = issuesOf(entry.index);
                  return (
                    <tr key={entry.index} className={entry.index === marked ? 'is-marked' : undefined} data-entry={entry.index}>
                      <th scope="row">{entry.index + 1}</th>
                      {COLUMNS.map((c) => {
                        const cellIssues = entryIssues.filter((i) => i.field === c);
                        const level = worst(cellIssues);
                        return (
                          <td key={c} className={level ? `fi-cell is-${level}` : undefined} title={cellIssues.map((i) => i.message).join(' ') || undefined}>
                            {level ? (
                              <span className="fi-cell-sign">
                                <span aria-hidden="true">{SIGN[level]}</span>
                                <span className="visually-hidden">{WORD[level]}: </span>
                              </span>
                            ) : null}
                            {show(data[c])}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <p className="fi-hint">✕ = wird aussortiert, ⚠ = wird repariert oder nur gemeldet. Die Zeilen- und Eintragsnummern zählen ab 1.</p>
    </section>
  );
}
