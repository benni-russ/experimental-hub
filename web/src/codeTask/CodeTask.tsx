import { useCallback, useEffect, useRef, useState } from 'react';
import type { CodeTaskMeta } from '@hub/shared';
import { Button } from '../design/components/Button';
import { CodeBlock } from '../design/components/CodeBlock';
import { Disclosure } from '../design/components/Disclosure';
import { Icon } from '../design/components/Icon';
import { browserStorage } from '../shell/rail';
import { Editor } from './Editor';
import { describeResult, type ResultView } from './resultView';
import { browserRunner } from './runner';
import { readDraft, writeDraft } from './storage';
import { findSyntaxErrorLine } from './syntaxLine';

const SAVE_DELAY_MS = 500;

export function CodeTask({ task }: { task: CodeTaskMeta }) {
  const [initial] = useState(() => readDraft(browserStorage, task.id));
  const [code, setCode] = useState(initial?.code ?? task.starter);
  const [passed, setPassed] = useState(initial?.passed ?? false);
  const [view, setView] = useState<ResultView | null>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);

  // Aktueller Stand für verzögertes Speichern und Aufräumen.
  const latest = useRef({ code, passed });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dirty = useRef(false);
  const runSeq = useRef(0);

  const saveNow = useCallback(() => {
    clearTimeout(saveTimer.current);
    dirty.current = false;
    writeDraft(browserStorage, task.id, latest.current);
  }, [task.id]);

  // Beim Verlassen der Seite ein noch offenes Speichern nicht verlieren.
  useEffect(
    () => () => {
      clearTimeout(saveTimer.current);
      if (dirty.current) writeDraft(browserStorage, task.id, latest.current);
      runSeq.current += 1;
    },
    [task.id],
  );

  function change(next: string) {
    setCode(next);
    setErrorLine(null);
    latest.current = { ...latest.current, code: next };
    dirty.current = true;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(saveNow, SAVE_DELAY_MS);
  }

  async function run() {
    const seq = ++runSeq.current;
    const syntaxLine = findSyntaxErrorLine(latest.current.code);
    if (syntaxLine !== null) {
      // Offensichtlicher Syntaxfehler: kein Worker nötig.
      browserRunner.cancel();
      setView({ summary: `Syntaxfehler in Zeile ${syntaxLine}`, errorLine: syntaxLine, allPassed: false, items: [] });
      setErrorLine(syntaxLine);
      return;
    }
    const result = await browserRunner.run(task.id, latest.current.code);
    if (seq !== runSeq.current || result === 'superseded') return; // Ein neuerer Lauf gilt.
    const next = describeResult(result);
    setView(next);
    setErrorLine(next.errorLine);
    if (next.allPassed) latest.current = { ...latest.current, passed: true };
    setPassed(latest.current.passed);
    saveNow();
  }

  function reset() {
    if (!window.confirm('Eigenen Code verwerfen und die Vorlage laden?')) return;
    runSeq.current += 1;
    browserRunner.cancel();
    latest.current = { code: task.starter, passed: false };
    setCode(task.starter);
    setPassed(false);
    setView(null);
    setErrorLine(null);
    saveNow();
  }

  return (
    <article className="code-task">
      <h3 className="code-task-title">
        {task.title}
        {passed ? (
          <span className="code-task-done">
            <Icon name="check" />
            <span className="visually-hidden">Bestanden</span>
          </span>
        ) : null}
      </h3>
      {task.prompt.split('\n\n').map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      <Editor
        value={code}
        onChange={change}
        onRun={() => void run()}
        label={`Code für ${task.title}`}
        errorLine={errorLine}
      />
      <p className="code-task-hint muted">Tab rückt ein · Esc, dann Tab verlässt den Editor · Strg+Enter prüft</p>
      <div className="code-task-actions">
        <Button variant="primary" onClick={() => void run()}>
          Prüfen
        </Button>
        <Button variant="secondary" onClick={reset}>
          Zurücksetzen
        </Button>
      </div>
      <div className="code-task-result" aria-live="polite">
        {view ? (
          <>
            <p className={`code-task-summary${view.allPassed ? ' is-ok' : ''}`}>{view.summary}</p>
            {view.items.length > 0 ? (
              <ul className="code-task-checks">
                {view.items.map((item) => (
                  <li key={item.name} className={item.passed ? 'is-pass' : 'is-fail'}>
                    <span aria-hidden="true">{item.passed ? '✓' : '✗'}</span>
                    <span>
                      <span className="visually-hidden">{item.passed ? 'Bestanden: ' : 'Nicht bestanden: '}</span>
                      {item.name}
                      {item.message ? <span className="code-task-message">{item.message}</span> : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}
      </div>
      {task.hints.map((hint, i) => (
        <Disclosure key={i} summary={`Tipp ${i + 1}`}>
          <p>{hint}</p>
        </Disclosure>
      ))}
      <Disclosure summary="Musterlösung">
        <CodeBlock code={task.solution} label="Musterlösung" />
      </Disclosure>
    </article>
  );
}
