import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '../../design/components/Button';
import { InsightBox } from '../../design/components/InsightBox';
import { SegmentedControl } from '../../design/components/SegmentedControl';
import { LoopView } from './LoopView';
import { SNIPPETS, sourceOrder, type Snippet, type SnippetId } from './traces';
import './eventLoop.css';

const OPTIONS = SNIPPETS.map((s) => ({ value: s.id, label: s.title }));

/** Pause je Schritt beim Abspielen */
const STEP_MS = 800;

type Direction = 'up' | 'down';

const byId = (id: SnippetId): Snippet => SNIPPETS.find((s) => s.id === id) ?? SNIPPETS[0]!;

export default function Demo() {
  const labelId = useId();
  const [snippetId, setSnippetId] = useState<SnippetId>('sync');
  const snippet = byId(snippetId);
  const steps = snippet.steps;
  const real = steps.at(-1)?.console ?? [];
  const last = steps.length - 1;

  // Ausgangsreihenfolge zum Schätzen: so, wie die Ausgaben im Code stehen.
  const [guess, setGuess] = useState<string[]>(() => sourceOrder(snippet.code));
  const [revealed, setRevealed] = useState(false);
  const [index, setIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [moveMessage, setMoveMessage] = useState('');

  const listRef = useRef<HTMLOListElement>(null);
  const pendingFocus = useRef<{ line: string; dir: Direction } | null>(null);

  function pick(id: SnippetId) {
    setSnippetId(id);
    setGuess(sourceOrder(byId(id).code));
    setRevealed(false);
    setIndex(-1);
    setPlaying(false);
    setMoveMessage('');
  }

  function move(from: number, dir: Direction) {
    const to = dir === 'up' ? from - 1 : from + 1;
    if (to < 0 || to >= guess.length) return;
    const next = [...guess];
    const [line] = next.splice(from, 1);
    next.splice(to, 0, line!);
    pendingFocus.current = { line: line!, dir };
    setGuess(next);
    setMoveMessage(`„${line}“ steht jetzt an Stelle ${to + 1} von ${next.length}.`);
  }

  // Nach dem Verschieben bleibt der Fokus beim verschobenen Eintrag. Ist sein
  // Knopf jetzt gesperrt (ganz oben oder unten), geht er auf den anderen.
  useLayoutEffect(() => {
    const target = pendingFocus.current;
    pendingFocus.current = null;
    if (!target || !listRef.current) return;
    const buttons = [...listRef.current.querySelectorAll<HTMLButtonElement>('button[data-line]')].filter(
      (b) => b.dataset.line === target.line,
    );
    const same = buttons.find((b) => b.dataset.dir === target.dir);
    (same && !same.disabled ? same : buttons.find((b) => !b.disabled))?.focus();
  }, [guess]);

  function toggleReveal() {
    if (revealed) {
      setGuess(sourceOrder(snippet.code));
      setRevealed(false);
      setIndex(-1);
      setPlaying(false);
    } else {
      setRevealed(true);
    }
    setMoveMessage('');
  }

  // Abspielen: alle 800 ms ein Schritt. Bei reduzierter Bewegung entfallen nur die
  // Übergänge im CSS; Schritt für Schritt bleibt, denn darum geht es.
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setIndex((i) => Math.min(i + 1, last)), STEP_MS);
    return () => clearInterval(timer);
  }, [playing, last]);

  useEffect(() => {
    if (playing && index >= last) setPlaying(false);
  }, [playing, index, last]);

  // Von Hand blättern hält das Abspielen an.
  function stepBy(delta: 1 | -1) {
    setPlaying(false);
    setIndex((i) => Math.min(Math.max(i + delta, -1), last));
  }

  function togglePlay() {
    if (playing) {
      setPlaying(false);
      return;
    }
    if (index >= last) setIndex(-1);
    setPlaying(true);
  }

  const rightCount = guess.filter((line, i) => line === real[i]).length;
  const current = index >= 0 ? steps[index] : undefined;
  const note = current
    ? `Schritt ${index + 1} von ${steps.length}: ${current.note}`
    : 'Noch nichts gelaufen. Drück auf „Schritt“ oder „Abspielen“.';

  return (
    <div className="loop-demo">
      <div className="loop-snippets">
        <span id={labelId} className="loop-label">
          Beispiel
        </span>
        <SegmentedControl label="Beispiel" labelledBy={labelId} options={OPTIONS} value={snippetId} onChange={pick} />
      </div>

      <section className="loop-guess" aria-labelledby={`${labelId}-guess`}>
        <h3 id={`${labelId}-guess`}>{revealed ? 'Deine Reihenfolge' : 'Erst schätzen: In welcher Reihenfolge erscheinen die Ausgaben?'}</h3>
        {revealed ? null : (
          <p className="loop-muted">
            Die Liste beginnt in Leserichtung, so wie die Ausgaben im Code stehen. Ordne sie mit „Auf“ und „Ab“, dann
            löse auf.
          </p>
        )}
        <pre className="loop-guess-code" tabIndex={0} role="region" aria-label={`Code des Beispiels ${snippet.title}`}>
          {snippet.code}
        </pre>
        <ol className="loop-guess-list" ref={listRef}>
          {guess.map((line, i) => {
            const right = line === real[i];
            return (
              <li key={line} className={`loop-guess-item${revealed ? (right ? ' is-right' : ' is-wrong') : ''}`}>
                <span className="loop-guess-position" aria-hidden="true">
                  {i + 1}.
                </span>
                <code className="loop-guess-line">{line}</code>
                {revealed ? (
                  <span className="loop-verdict">
                    <span aria-hidden="true">{right ? '✓' : '✗'}</span>{' '}
                    {right ? 'richtig' : `falsch, hier erscheint „${real[i]}“`}
                  </span>
                ) : (
                  <span className="loop-move">
                    <Button
                      variant="quiet"
                      data-line={line}
                      data-dir="up"
                      aria-label={`Auf: „${line}“ nach oben`}
                      disabled={i === 0}
                      onClick={() => move(i, 'up')}
                    >
                      <span aria-hidden="true">↑</span> Auf
                    </Button>
                    <Button
                      variant="quiet"
                      data-line={line}
                      data-dir="down"
                      aria-label={`Ab: „${line}“ nach unten`}
                      disabled={i === guess.length - 1}
                      onClick={() => move(i, 'down')}
                    >
                      <span aria-hidden="true">↓</span> Ab
                    </Button>
                  </span>
                )}
              </li>
            );
          })}
        </ol>
        <div className="loop-actions">
          <Button variant={revealed ? 'secondary' : 'primary'} onClick={toggleReveal}>
            {revealed ? 'Noch einmal schätzen' : 'Auflösen'}
          </Button>
          {revealed ? (
            <p className="loop-score" role="status">
              {rightCount} von {guess.length} an der richtigen Stelle.
            </p>
          ) : null}
        </div>
      </section>

      {revealed ? (
        <>
          {/* aria-disabled statt disabled: Der Fokus bleibt auf dem Knopf, auch am Anfang oder Ende. */}
          <div className="loop-controls" role="group" aria-label="Schritte">
            <Button variant="secondary" onClick={() => stepBy(-1)} aria-disabled={index < 0}>
              Zurück
            </Button>
            <Button variant="secondary" onClick={() => stepBy(1)} aria-disabled={index >= last}>
              Schritt
            </Button>
            <Button variant="primary" onClick={togglePlay}>
              {playing ? 'Anhalten' : 'Abspielen'}
            </Button>
          </div>

          <p className="loop-note" aria-live="polite" aria-atomic="true">
            {note}
          </p>

          <LoopView snippet={snippet} index={index} />

          {index >= last ? (
            <InsightBox title="Die Regel">
              Erst läuft der synchrone Code bis zum Ende. Dann leert die Event Loop die Microtask-Queue ganz, und erst
              danach holt sie eine einzige Macrotask, bevor wieder alle Microtasks drankommen.
            </InsightBox>
          ) : null}
        </>
      ) : null}

      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {moveMessage}
      </p>
    </div>
  );
}
