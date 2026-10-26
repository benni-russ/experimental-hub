import { useId } from 'react';
import type { Snippet, TraceStep } from './traces';

const EMPTY: TraceStep = { line: 0, stack: [], micro: [], macro: [], console: [], note: '' };

function Column({ title, hint, items, labelId }: { title: string; hint: string; items: string[]; labelId: string }) {
  return (
    <section className="loop-column" aria-labelledby={labelId}>
      <h3 id={labelId}>{title}</h3>
      <p className="loop-column-hint">{hint}</p>
      {items.length === 0 ? (
        <p className="loop-empty">leer</p>
      ) : (
        <ol className="loop-items">
          {items.map((item, i) => (
            <li key={`${i}-${item}`} className="loop-item">
              {item}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/**
 * Code mit markierter Zeile, Call Stack, Microtasks, Macrotasks und Konsole
 * für einen Schritt. `index` −1 heißt: noch nichts gelaufen.
 */
export function LoopView({ snippet, index }: { snippet: Snippet; index: number }) {
  const id = useId();
  const current = index >= 0 ? (snippet.steps[index] ?? EMPTY) : EMPTY;
  const codeLines = snippet.code.split('\n');
  const width = String(codeLines.length).length;

  return (
    <div className="loop-view">
      <section className="loop-panel" aria-labelledby={`${id}-code`}>
        <h3 id={`${id}-code`}>Code</h3>
        <ol className="loop-code">
          {codeLines.map((text, i) => {
            const isCurrent = i + 1 === current.line;
            return (
              <li key={i} className={isCurrent ? 'loop-line is-current' : 'loop-line'} aria-current={isCurrent ? 'step' : undefined}>
                <span className="loop-line-marker" aria-hidden="true">
                  {isCurrent ? '▶' : ''}
                </span>
                <span className="loop-line-number" aria-hidden="true">
                  {String(i + 1).padStart(width, ' ')}
                </span>
                <code className="loop-line-text">{text === '' ? ' ' : text}</code>
                {isCurrent ? <span className="visually-hidden"> (läuft gerade)</span> : null}
              </li>
            );
          })}
        </ol>
      </section>

      <div className="loop-columns">
        {/* Oben auf dem Stapel wird gearbeitet: deshalb umgekehrt anzeigen. */}
        <Column
          title="Call Stack"
          hint="oben läuft gerade"
          items={[...current.stack].reverse()}
          labelId={`${id}-stack`}
        />
        <Column title="Microtasks" hint="vorne ist als Nächstes dran" items={current.micro} labelId={`${id}-micro`} />
        <Column title="Macrotasks" hint="vorne ist als Nächstes dran" items={current.macro} labelId={`${id}-macro`} />
      </div>

      <section className="loop-panel" aria-labelledby={`${id}-console`}>
        <h3 id={`${id}-console`}>Konsole</h3>
        {current.console.length === 0 ? (
          <p className="loop-empty">noch keine Ausgabe</p>
        ) : (
          <ol className="loop-console">
            {current.console.map((line, i) => (
              <li key={`${i}-${line}`}>
                <code>{line}</code>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
