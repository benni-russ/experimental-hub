import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useDueCards, useReviewCard } from '../api';
import { Button } from '../design/components/Button';
import { Card } from '../design/components/Card';
import { FlipCard } from '../design/components/FlipCard';
import { TRACKS } from '@hub/shared';
import {
  canFreezeRound,
  filterByScope,
  groupByTopic,
  orderByTopic,
  parseReviewScope,
  resolveReviewItems,
  reviewScopeHref,
  type ResolvedReviewItem,
  type ReviewScope,
} from './reviewItems';
import { reviewLookup } from './reviewLookup';
import './review.css';
import { Icon } from '../design/components/Icon';
import { Kbd } from '../design/components/Kbd';
import { Breadcrumb } from '../shell/Breadcrumb';
import { breadcrumbFor } from '../shell/breadcrumbs';
import { isTypingTarget } from '../shell/hotkey';
import { REVIEW } from '../shell/nav';
import { dueHeadline } from '../shell/due';
import { TrackIcon } from '../design/components/TrackIcon';

export function Review() {
  const [params] = useSearchParams();
  const scope = parseReviewScope(params);
  // Ändert sich der Bereich (z. B. Link aus der Glocke), beginnt die Runde frisch.
  return <ScopedReview key={reviewScopeHref(scope)} scope={scope} />;
}

function ScopedReview({ scope }: { scope: ReviewScope }) {
  const due = useDueCards();
  // Die Liste wird einmal eingefroren, sobald frische Daten da sind (nicht der
  // Cache-Stand vom letzten Besuch): spätere Neuladungen (nach jeder Bewertung)
  // dürfen die Runde nicht umsortieren.
  const [items, setItems] = useState<ResolvedReviewItem[] | null>(null);
  const [started, setStarted] = useState(false);
  if (items === null && due.data && canFreezeRound(due)) {
    setItems(orderByTopic(filterByScope(resolveReviewItems(due.data, reviewLookup), scope)));
  }

  if (items === null) {
    if (due.isError) {
      return (
        <p className="field-error" role="alert">
          Die fälligen Karten konnten nicht geladen werden ({due.error.message}).
        </p>
      );
    }
    return <p className="muted">Lädt …</p>;
  }
  if (scope.kind === 'all' && !started && items.length > 0) {
    return <Overview items={items} onStart={() => setStarted(true)} />;
  }
  return <Round items={items} scope={scope} />;
}

function Overview({ items, onStart }: { items: ResolvedReviewItem[]; onStart: () => void }) {
  const groups = groupByTopic(items);
  return (
    <div className="review">
      <Breadcrumb crumbs={breadcrumbFor({ kind: 'page', label: REVIEW.label })} />
      <h1>Lernrunde</h1>
      <p className="muted">{dueHeadline(items.length)}</p>
      <div className="review-actions">
        <Button variant="primary" onClick={onStart}>
          Alle lernen
        </Button>
      </div>
      {groups.map((g) => (
        <section key={g.track} className="review-topic" aria-labelledby={`thema-${g.track}`}>
          <div className="review-topic-head">
            <h2 id={`thema-${g.track}`}>
              <TrackIcon track={g.track} size={20} /> {g.label} <span className="review-count">{g.count}</span>
            </h2>
            <Link to={reviewScopeHref({ kind: 'track', track: g.track })} className="btn btn-secondary">
              Thema lernen<span className="visually-hidden">: {g.label}</span>
            </Link>
          </div>
          <ul className="plain-list review-topic-list">
            {g.projects.map((p) => (
              <li key={p.projectId}>
                <Link to={reviewScopeHref({ kind: 'project', projectId: p.projectId })} className="review-topic-row">
                  <span className="review-topic-title">{p.title}</span>
                  <span className="review-count">{p.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ScopeLine({ scope, withLink = true }: { scope: ReviewScope; withLink?: boolean }) {
  if (scope.kind === 'all') return null;
  const text =
    scope.kind === 'track'
      ? `Thema: ${TRACKS.find((t) => t.id === scope.track)?.label ?? scope.track}`
      : `Projekt: ${reviewLookup(scope.projectId)?.title ?? scope.projectId}`;
  return (
    <p className="review-scope">
      <span>{text}</span>
      {withLink && (
        <Link to="/lernrunde" className="review-scope-link">
          Alle Themen
        </Link>
      )}
    </p>
  );
}

function Round({ items, scope }: { items: ResolvedReviewItem[]; scope: ReviewScope }) {
  const review = useReviewCard();
  const due = useDueCards();
  // Nach dem Neuladen noch etwas fällig (in anderen Themen)? Dann gibt es einen Weg dorthin.
  const moreDue = due.data !== undefined && resolveReviewItems(due.data, reviewLookup).length > 0;
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [known, setKnown] = useState(0);
  const [unknown, setUnknown] = useState(0);
  const revealRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  const summaryRef = useRef<HTMLHeadingElement>(null);
  // Sperrt sofort, nicht erst nach dem nächsten Rendern: zwei schnelle Tasten
  // dürfen dieselbe Karte nicht zweimal bewerten.
  const ratingRef = useRef(false);

  const current = items[index] as ResolvedReviewItem | undefined;
  const pending = review.isPending;

  const rate = (value: boolean) => {
    if (!current || ratingRef.current) return;
    ratingRef.current = true;
    review.mutate(
      { cardId: current.cardId, known: value },
      {
        onSettled: () => {
          ratingRef.current = false;
        },
        onSuccess: () => {
          if (value) setKnown((n) => n + 1);
          else setUnknown((n) => n + 1);
          setRevealed(false);
          setIndex((i) => i + 1);
        },
      },
    );
  };

  // Der Handler liest immer den aktuellen Stand über die Ref.
  const handlerRef = useRef<(e: KeyboardEvent) => void>(() => {});
  handlerRef.current = (e) => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey || isTypingTarget(e.target)) return;
    if (!current) return;
    const key = e.key.toLowerCase();
    if (key === ' ' && !revealed) {
      // Auf Knöpfen und Links gilt die eigene Leertasten-Aktion.
      if (e.target instanceof HTMLElement && e.target.closest('button, a')) return;
      e.preventDefault();
      setRevealed(true);
    } else if (revealed && (key === 'j' || key === 'n')) {
      e.preventDefault();
      rate(key === 'j');
    }
  };
  useEffect(() => {
    const listener = (e: KeyboardEvent) => handlerRef.current(e);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  // Fokus: neue Karte -> "Antwort zeigen", aufgedeckt -> Rückseite.
  // Ende -> Überschrift der Zusammenfassung. Nach einem Fehler läuft der
  // Effekt erneut, weil der fokussierte Knopf während des Speicherns gesperrt war.
  useEffect(() => {
    if (!current) {
      summaryRef.current?.focus();
      return;
    }
    if (revealed) answerRef.current?.focus();
    else revealRef.current?.querySelector('button')?.focus();
  }, [index, revealed, current, review.isError]);

  const crumbs = <Breadcrumb crumbs={breadcrumbFor({ kind: 'page', label: REVIEW.label })} />;

  if (items.length === 0 && scope.kind !== 'all') {
    return (
      <div className="review">
        {crumbs}
        <h1>Lernrunde</h1>
        <ScopeLine scope={scope} withLink={false} />
        <p className="muted">In diesem Bereich ist gerade nichts fällig.</p>
        <Link to="/lernrunde" className="btn btn-secondary">
          Alle Themen
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="review">
        {crumbs}
        <h1>Lernrunde</h1>
        <p className="muted">
          Gerade ist nichts fällig. Nächste Karten kommen, wenn du ein Projekt beginnst oder morgen.
        </p>
        <Link to="/" className="btn btn-secondary">
          Zu Heute
        </Link>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="review">
        {crumbs}
        <h1 ref={summaryRef} tabIndex={-1}>
          Lernrunde geschafft
        </h1>
        <Card>
          <ul className="plain-list review-summary">
            <li>
              <Icon name="check" /> Gewusst: <strong>{known}</strong>
            </li>
            <li>
              <Icon name="retry" /> Nicht gewusst: <strong>{unknown}</strong>
            </li>
          </ul>
        </Card>
        <div className="review-end">
          <Link to="/" className="btn btn-primary">
            Zu Heute
          </Link>
          {scope.kind !== 'all' && moreDue && (
            <Link to="/lernrunde" className="btn btn-secondary">
              Zu allen Themen
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="review">
      {crumbs}
      <h1>Lernrunde</h1>
      <ScopeLine scope={scope} />
      <p className="muted review-progress" aria-live="polite">
        {index + 1} von {items.length}
      </p>
      <div key={current.cardId}>
        <FlipCard
          label={current.projectTitle}
          flipped={revealed}
          backRef={answerRef}
          front={<p className="review-text">{current.front}</p>}
          back={<p className="review-text">{current.back}</p>}
        />
      </div>

      {review.isError && (
        <p className="field-error" role="alert">
          Die Bewertung wurde nicht gespeichert ({review.error.message}). Bitte versuche es noch einmal.
        </p>
      )}

      {revealed ? (
        <div className="review-actions">
          <Button variant="primary" disabled={pending} onClick={() => rate(true)}>
            <Icon name="check" /> Gewusst
          </Button>
          <Button variant="secondary" disabled={pending} onClick={() => rate(false)}>
            <Icon name="retry" /> Nicht gewusst
          </Button>
        </div>
      ) : (
        <div className="review-actions" ref={revealRef}>
          <Button onClick={() => setRevealed(true)}>
            Antwort zeigen
          </Button>
        </div>
      )}

      <p className="muted review-hint">
        <span className="visually-hidden">Tastatur: </span>
        {revealed ? (
          <>
            <Kbd>J</Kbd> gewusst · <Kbd>N</Kbd> nicht gewusst
          </>
        ) : (
          <>
            <Kbd>Leertaste</Kbd> Antwort zeigen
          </>
        )}
      </p>
    </div>
  );
}
