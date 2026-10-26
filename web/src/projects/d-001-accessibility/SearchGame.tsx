import { useEffect, useId, useReducer, useRef, useState } from 'react';
import { Button } from '../../design/components/Button';
import { Icon } from '../../design/components/Icon';
import { StatusMark } from '../../design/components/StatusTag';
import { ALT_CHOICES, BARRIERS, buildPage, isFixed, type Barrier, type BarrierId } from '../../experience/productPage';
import { AuditPanel } from './AuditPanel';
import { badAltChoice, barrierAt, counts, gameReducer, INITIAL } from './game';
import { PERSPECTIVES, Perspectives } from './Perspectives';

const barrier = (id: BarrierId): Barrier => BARRIERS.find((b) => b.id === id)!;
const perspectiveLabel = (b: Barrier) => PERSPECTIVES.find((p) => p.value === b.perspectiveHint)!.label;

/** Status eines gefundenen Eintrags: Zeichen und Wort wie im StatusTag. */
function FoundTag({ id, fixes }: { id: BarrierId; fixes: Parameters<typeof isFixed>[1] }) {
  if (isFixed(id, fixes)) {
    return (
      <span className="tag tag-done">
        <StatusMark status="done" /> behoben
      </span>
    );
  }
  const bad = id === 'alt' && badAltChoice(fixes);
  return (
    <span className="tag tag-started">
      <StatusMark status="started" /> {bad ? 'gefunden, nicht behoben' : 'gefunden'}
    </span>
  );
}

export function SearchGame() {
  const id = useId();
  const [state, dispatch] = useReducer(gameReducer, INITIAL);
  const [searchMode, setSearchMode] = useState(false);
  // Nach einem Fund oder einer Behebung springt der Fokus auf die Ergebniszeile, damit er nicht
  // mit dem verschwundenen Knopf auf <body> fällt und Tab direkt zu „Beheben“ führt.
  const [focusTick, setFocusTick] = useState(0);
  const resultRef = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    if (focusTick > 0) resultRef.current?.focus();
  }, [focusTick]);

  const page = buildPage(state.fixes);
  const { found, fixed, total } = counts(state);
  const pick = state.lastPick;
  const picked = pick?.barrierId ? barrier(pick.barrierId) : null;
  const badAlt = badAltChoice(state.fixes);

  function onPick(nodeId: string) {
    // Nur bei einem Fund springt der Fokus; „Hier ist nichts falsch“ sagt die Live-Region an.
    const hit = barrierAt(nodeId, state.fixes) !== null;
    dispatch({ type: 'pick', nodeId });
    if (hit) setFocusTick((t) => t + 1);
  }
  function fix(barrierId: BarrierId) {
    dispatch({ type: 'fix', barrierId });
    setFocusTick((t) => t + 1);
  }
  function chooseAlt(text: string) {
    dispatch({ type: 'chooseAlt', text });
    setFocusTick((t) => t + 1);
  }
  function reset() {
    dispatch({ type: 'reset' });
    setSearchMode(false);
  }

  let result = null;
  if (pick && picked) {
    if (pick.fixed) {
      const stillBad = picked.id === 'alt' && badAlt;
      result = stillBad ? (
        <>
          <p className="a11y-result-line" tabIndex={-1} ref={resultRef}>
            <strong>Gewählt: „{badAlt}“. Gefunden, nicht behoben.</strong>
          </p>
          <p>Der Prüfer ist damit zufrieden, aber wer die Seite vorgelesen bekommt, erfährt weiterhin nicht, was auf dem Bild zu sehen ist.</p>
        </>
      ) : (
        <p className="a11y-result-line" tabIndex={-1} ref={resultRef}>
          <strong>Behoben: {picked.title}.</strong>
        </p>
      );
    } else {
      result = (
        <>
          <p className="a11y-result-line" tabIndex={-1} ref={resultRef}>
            <strong>Gefunden: {picked.title}</strong>
          </p>
          <p>{picked.why}</p>
          {picked.id === 'alt' ? (
            <div className="a11y-choices" role="group" aria-label={picked.fixLabel}>
              <span className="a11y-label">{picked.fixLabel}:</span>
              {ALT_CHOICES.map((c) => (
                <Button key={c.text} variant="secondary" onClick={() => chooseAlt(c.text)}>
                  „{c.text}“
                </Button>
              ))}
            </div>
          ) : (
            <div>
              <Button onClick={() => fix(picked.id)}>{picked.fixLabel}</Button>
            </div>
          )}
        </>
      );
    }
  } else if (pick) {
    result = (
      <p className="a11y-result-line" tabIndex={-1} ref={resultRef}>
        Hier ist nichts falsch.
      </p>
    );
  }

  const hint = state.hint ? barrier(state.hint) : null;
  const foundList = BARRIERS.filter((b) => state.found.has(b.id));

  return (
    <div className="a11y-game">
      <div className="a11y-toolbar">
        <Button variant="secondary" aria-pressed={searchMode} aria-describedby={`${id}-mode`} onClick={() => setSearchMode((on) => !on)}>
          <Icon name="search" /> Barrieren suchen
        </Button>
        <p className="a11y-counter" aria-live="polite" aria-atomic="true">
          <span>
            <Icon name="search" size={14} /> gefunden {found} von {total}
          </span>
          <span aria-hidden="true"> · </span>
          <span>
            <Icon name="check" size={14} /> behoben {fixed} von {total}
          </span>
        </p>
        <div className="a11y-actions">
          <Button variant="quiet" onClick={() => dispatch({ type: 'hint' })} disabled={found === total}>
            Tipp
          </Button>
          <Button variant="quiet" onClick={() => dispatch({ type: 'revealAll' })} disabled={found === total}>
            Alle zeigen
          </Button>
          <Button variant="quiet" onClick={reset}>
            <Icon name="retry" /> Zurücksetzen
          </Button>
        </div>
      </div>
      <p className="a11y-hint" id={`${id}-mode`}>
        {searchMode
          ? 'Suchmodus an: Jedes Element der Seite und jede Ansagezeile ist jetzt ein Knopf. Wähl aus, was dir verdächtig vorkommt.'
          : 'Schalte „Barrieren suchen“ ein und wähle dann Elemente der Seite oder Zeilen der Ansage aus.'}
      </p>
      {/* Die Live-Region steht immer im Baum und wird nur gefüllt, damit die erste Ansage nicht verloren geht. */}
      <p className="a11y-tip" aria-live="polite">
        {hint ? (
          <>
            <Icon name="info" size={16} /> Tipp, am besten im Blickwinkel {perspectiveLabel(hint)}: {hint.hint}
          </>
        ) : null}
      </p>

      <Perspectives page={page} searchMode={searchMode} onPick={onPick} />

      {/* Bei Fund, Behebung und Alt-Wahl springt der Fokus auf die Ergebniszeile; das sagt sie an.
          Deshalb ist der Ergebnisbereich keine Live-Region (sonst doppelte Ansage). Nur „Hier ist
          nichts falsch“ bewegt den Fokus nicht und geht über die eigene, immer vorhandene Statuszeile. */}
      <div className="a11y-result">{result}</div>
      <p className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {pick && !picked ? 'Hier ist nichts falsch.' : ''}
      </p>

      {foundList.length > 0 ? (
        <section className="a11y-panel" aria-labelledby={`${id}-found`}>
          <h3 id={`${id}-found`}>Gefundene Barrieren</h3>
          <ul className="a11y-found">
            {foundList.map((b) => (
              <li key={b.id}>
                <span className="a11y-found-title">{b.title}</span>
                <FoundTag id={b.id} fixes={state.fixes} />
                {b.id === 'alt' && badAlt ? <span className="a11y-hint">Der gewählte Text „{badAlt}“ beschreibt das Bild nicht.</span> : null}
                {isFixed(b.id, state.fixes) ? null : (
                  <Button variant="quiet" aria-label={`${b.title} ansehen`} onClick={() => onPick(b.elementId)}>
                    Ansehen
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <AuditPanel fixes={state.fixes} />
    </div>
  );
}
