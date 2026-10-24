import { useEffect, useRef, useState } from 'react';
import type { QuizAttempt, QuizQuestion } from '@hub/shared';
import { useSaveQuizAttempt } from '../api';
import { Button } from '../design/components/Button';
import { InsightBox } from '../design/components/InsightBox';
import { formatNumber, parseGermanNumber } from './numbers';
import { Icon } from '../design/components/Icon';

type Estimate = Extract<QuizQuestion, { type: 'estimate' }>;

export function isEstimateCorrect(question: Estimate, guess: number): boolean {
  return Math.abs(guess - question.answer) <= question.tolerance * question.answer;
}

export function fmt(n: number): string {
  return formatNumber(n, Number.isInteger(n) ? 0 : 2);
}

function show(attempt: QuizAttempt | undefined): string | null {
  if (!attempt) return null;
  const n = Number(attempt.answer);
  return Number.isFinite(n) ? fmt(n) : null;
}

/**
 * Im Einstieg zählt nur die erste Schätzung: danach ist die Eingabe gesperrt.
 * Im Quiz sperrt `lockAfterAnswer` auch die Phase `after`; neu antworten geht nur über „Nochmal“.
 */
export function isEstimateLocked(
  phase: 'before' | 'after',
  sent: number | null,
  failed: boolean,
  lockAfterAnswer = false,
): boolean {
  return (phase === 'before' || lockAfterAnswer) && sent !== null && !failed;
}

/**
 * Schätzfrage. `before` (Einstieg) zeigt keine Auflösung; `after` (Wissenscheck)
 * zeigt nach der Antwort Vorher/Nachher/richtig als Erkenntnis-Box.
 */
export function EstimateQuestion({
  projectId,
  question,
  phase,
  saved,
  before,
  lockAfterAnswer = false,
  onAnswered,
}: {
  projectId: string;
  question: Estimate;
  phase: 'before' | 'after';
  saved?: QuizAttempt;
  before?: QuizAttempt;
  lockAfterAnswer?: boolean;
  /** Sofort nach dem Absenden, unabhängig davon, ob der Server schon geantwortet hat. */
  onAnswered?: (answer: string, correct: boolean) => void;
}) {
  const save = useSaveQuizAttempt();
  const [text, setText] = useState(show(saved) ?? '');
  const [hint, setHint] = useState<string | null>(null);
  // Zuletzt abgesendete Schätzung (sofort sichtbar, bevor der Server antwortet).
  const [sent, setSent] = useState<number | null>(saved ? Number(saved.answer) : null);
  const locked = isEstimateLocked(phase, sent, save.isError, lockAfterAnswer);
  const inputId = `estimate-${question.id}-${phase}`;
  // Nach dem Absenden verschwindet der fokussierte Knopf: Fokus auf die Rückmeldung legen.
  const feedbackRef = useRef<HTMLDivElement>(null);
  const focusFeedback = useRef(false);
  useEffect(() => {
    if (!focusFeedback.current) return;
    focusFeedback.current = false;
    feedbackRef.current?.focus();
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (locked) return;
    const value = parseGermanNumber(text);
    if (value === null) {
      setHint('Bitte eine Zahl eingeben');
      return;
    }
    setHint(null);
    focusFeedback.current = true;
    setSent(value);
    const correct = isEstimateCorrect(question, value);
    onAnswered?.(String(value), correct);
    save.mutate({
      projectId,
      questionId: question.id,
      phase,
      answer: String(value),
      correct,
    });
  }

  const beforeText = show(before);
  return (
    <form className="estimate" onSubmit={submit} noValidate>
      <label htmlFor={inputId} className="question-prompt">
        {question.prompt}
      </label>
      {phase === 'after' && beforeText ? (
        <p className="muted">
          Deine Schätzung vorher: {beforeText} {question.unit}
        </p>
      ) : null}
      <div className="estimate-row">
        <input
          id={inputId}
          className="input"
          inputMode="decimal"
          autoComplete="off"
          value={text}
          aria-invalid={hint ? true : undefined}
          aria-describedby={hint ? `${inputId}-hint` : undefined}
          readOnly={locked}
          onChange={(e) => setText(e.target.value)}
        />
        <span className="estimate-unit">{question.unit}</span>
        {locked ? null : (
          <Button type="submit" disabled={save.isPending}>
            {phase === 'before' ? 'Schätzung merken' : 'Antwort prüfen'}
          </Button>
        )}
      </div>
      {hint ? (
        <p id={`${inputId}-hint`} className="field-error" role="alert">
          {hint}
        </p>
      ) : null}
      {save.isError ? (
        <p className="field-error" role="alert">
          Nicht gespeichert: {save.error.message}
        </p>
      ) : null}
      {/* Immer gerendert, damit Screenreader den Inhalt ansagen, sobald er erscheint */}
      <div aria-live="polite">
        {phase === 'before' && sent !== null && !save.isError ? (
          <div ref={feedbackRef} tabIndex={-1} className="estimate-feedback">
            <p className="muted">Gemerkt – Auflösung im Wissenscheck</p>
          </div>
        ) : null}
        {phase === 'after' && sent !== null ? (
          <div ref={feedbackRef} tabIndex={-1} className="estimate-feedback">
            <InsightBox title="Auflösung">
              <ul className="plain-list">
                <li>Deine Schätzung vorher: {beforeText ? `${beforeText} ${question.unit}` : 'keine'}</li>
                <li>
                  Deine Schätzung jetzt: {fmt(sent)} {question.unit} (
                  {isEstimateCorrect(question, sent) ? (
                    <>
                      <Icon name="check" /> nah genug
                    </>
                  ) : (
                    <>
                      <Icon name="cross" /> daneben
                    </>
                  )}
                  )
                </li>
                <li>
                  Richtige Antwort: {formatNumber(question.answer)} {question.unit}
                </li>
              </ul>
              <p>{question.explanation}</p>
            </InsightBox>
          </div>
        ) : null}
      </div>
    </form>
  );
}
