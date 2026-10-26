import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Button } from '../../design/components/Button';
import { toDraft, toEvent, type EventDraft } from './draft';
import { EventForm } from './EventForm';
import { BROKEN, BROKEN_LABELS, VALID_PURCHASE, type BrokenId } from './fixtures';
import { IssueList } from './IssueList';
import { findLine, jsonLines } from './jsonLines';
import { issueKey, validateEvent, type Issue } from './validateEvent';
import './ga4.css';

const CLEAR = 'dataLayer.push({ ecommerce: null });';
const BROKEN_IDS = Object.keys(BROKEN_LABELS) as BrokenId[];

export default function Demo() {
  const id = useId();
  const [draft, setDraft] = useState<EventDraft>(() => toDraft(VALID_PURCHASE));
  const [marked, setMarked] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const codeRef = useRef<HTMLPreElement>(null);

  const event = useMemo(() => toEvent(draft), [draft]);
  const issues = useMemo(() => validateEvent(event), [event]);
  const lines = useMemo(() => jsonLines(event), [event]);

  // Die Markierung gilt nur, solange es das Issue noch gibt.
  const markedIssue = issues.find((i) => issueKey(i) === marked);
  const markedLine = markedIssue ? findLine(lines, markedIssue.path) : -1;

  useEffect(() => {
    if (markedLine < 0) return;
    codeRef.current?.querySelector('.is-marked')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [markedLine]);

  function load(next: object, label: string) {
    setDraft(toDraft(next));
    setMarked(null);
    setAnnouncement(`Beispiel „${label}“ geladen.`);
  }

  function mark(issue: Issue | null) {
    setMarked(issue ? issueKey(issue) : null);
    if (!issue) {
      setAnnouncement('Markierung aufgehoben.');
      return;
    }
    const line = findLine(lines, issue.path);
    const exact = lines[line]?.path === issue.path;
    // Zeile 1 ist das Leeren, Zeile 2 leer; das Event beginnt in Zeile 3.
    setAnnouncement(
      `${exact ? 'Markiert' : 'Das Feld fehlt; markiert ist die übergeordnete Stelle'}: Zeile ${line + 3}, ${lines[line]?.text.trim() ?? ''}`,
    );
  }

  const last = lines.length - 1;

  return (
    <div className="ga4-demo">
      <div className="ga4-examples" role="group" aria-labelledby={`${id}-examples`}>
        <span id={`${id}-examples`} className="ga4-label">
          Beispiel laden
        </span>
        <div className="ga4-example-buttons">
          <Button variant="secondary" onClick={() => load(VALID_PURCHASE, 'Gültiger Kauf')}>
            Gültiger Kauf
          </Button>
          {BROKEN_IDS.map((b) => (
            <Button key={b} variant="secondary" onClick={() => load(BROKEN[b], BROKEN_LABELS[b])}>
              <span className="visually-hidden">Kaputtes Beispiel: </span>
              {BROKEN_LABELS[b]}
            </Button>
          ))}
        </div>
        <p className="ga4-hint">Jedes kaputte Beispiel weicht an genau einer Stelle von einem gültigen Event ab.</p>
      </div>

      <div className="ga4-columns">
        <EventForm draft={draft} onChange={setDraft} />

        <div className="ga4-side">
          <section className="ga4-panel" aria-labelledby={`${id}-json`}>
            <h3 id={`${id}-json`}>Das fertige dataLayer.push</h3>
            <pre ref={codeRef} className="ga4-code" tabIndex={0} role="region" aria-label="Code der beiden dataLayer.push, live aus dem Formular">
              <span className="ga4-line">
                <span className="ga4-line-marker" aria-hidden="true" />
                {CLEAR}
              </span>
              <span className="ga4-line">
                <span className="ga4-line-marker" aria-hidden="true" />{' '}
              </span>
              {lines.map((line, i) => {
                const isMarked = i === markedLine;
                const text = `${i === 0 ? 'dataLayer.push(' : ''}${line.text}${i === last ? ');' : ''}`;
                return (
                  <span key={i} className={`ga4-line${isMarked ? ' is-marked' : ''}`}>
                    <span className="ga4-line-marker" aria-hidden="true">
                      {isMarked ? '▶' : ''}
                    </span>
                    {isMarked ? <mark>{text}</mark> : text}
                  </span>
                );
              })}
            </pre>
            <p className="ga4-hint">
              Das erste push leert das ecommerce-Objekt, damit nichts aus einem vorigen Event übrig bleibt.
            </p>
          </section>

          <IssueList issues={issues} marked={markedIssue ? marked : null} onMark={mark} headingId={`${id}-issues`} />
        </div>
      </div>

      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>
    </div>
  );
}
