import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import type { QuizAttempt, QuizQuestion } from '@hub/shared';
import { useSaveQuizAttempt } from '../api';
import { InsightBox } from '../design/components/InsightBox';
import { EstimateQuestion, fmt } from './EstimateQuestion';
import { Icon } from '../design/components/Icon';
import { Button } from '../design/components/Button';
import { Disclosure } from '../design/components/Disclosure';
import { ProgressDots } from '../design/components/ProgressDots';
import type { ProjectStatus } from '../projects/status';
import { formatNumber } from './numbers';
import { answersFor, choiceState, correctCount, firstOpenIndex, restartThreshold } from './quizFlow';

type Choice = Extract<QuizQuestion, { type: 'choice' }>;

function ChoiceQuestion({
  projectId,
  question,
  saved,
  onAnswered,
}: {
  projectId: string;
  question: Choice;
  saved?: QuizAttempt;
  onAnswered: (answer: string, correct: boolean) => void;
}) {
  const save = useSaveQuizAttempt();
  const initial = saved ? Number(saved.answer) : null;
  // Pfeiltasten in der Radiogruppe ändern nur den Entwurf; festgelegt wird mit „Antwort prüfen“.
  const [picked, setPicked] = useState<number | null>(initial);
  const [checked, setChecked] = useState<number | null>(initial);
  const { locked, canCheck } = choiceState(picked, checked, save.isError);
  const feedbackRef = useRef<HTMLParagraphElement>(null);
  const focusFeedback = useRef(false);
  useEffect(() => {
    if (!focusFeedback.current) return;
    focusFeedback.current = false;
    feedbackRef.current?.focus();
  });

  function choose(index: number) {
    if (locked) return;
    focusFeedback.current = true;
    setChecked(index);
    onAnswered(String(index), index === question.correctIndex);
    save.mutate({
      projectId,
      questionId: question.id,
      phase: 'after',
      answer: String(index),
      correct: index === question.correctIndex,
    });
  }

  const correct = checked === question.correctIndex;
  return (
    <fieldset className="choice">
      <legend className="question-prompt">{question.prompt}</legend>
      {question.options.map((option, i) => (
        <label key={i} className="choice-option">
          <input
            type="radio"
            name={question.id}
            checked={picked === i}
            disabled={locked}
            onChange={() => setPicked(i)}
          />
          <span>{option}</span>
        </label>
      ))}
      {locked ? null : (
        <div className="choice-check">
          <Button disabled={!canCheck} onClick={() => picked !== null && choose(picked)}>
            Antwort prüfen
          </Button>
        </div>
      )}
      {save.isError ? (
        <p className="field-error" role="alert">
          Nicht gespeichert: {save.error.message}
        </p>
      ) : null}
      <div aria-live="polite">
        {checked !== null ? (
          <>
            <p ref={feedbackRef} tabIndex={-1} className={correct ? 'result result-ok' : 'result result-wrong'}>
              <Icon name={correct ? 'check' : 'cross'} /> {correct ? 'Richtig' : 'Nicht ganz'}
            </p>
            <InsightBox>{question.explanation}</InsightBox>
          </>
        ) : null}
      </div>
    </fieldset>
  );
}

/** Eigene und richtige Antwort als Text, für die Ergebnisliste. */
function answerTexts(question: QuizQuestion, attempt: QuizAttempt): { own: string; right: string } {
  if (question.type === 'choice') {
    return {
      own: question.options[Number(attempt.answer)] ?? attempt.answer,
      right: question.options[question.correctIndex] ?? '',
    };
  }
  const n = Number(attempt.answer);
  return {
    own: `${Number.isFinite(n) ? fmt(n) : attempt.answer} ${question.unit}`,
    right: `${formatNumber(question.answer)} ${question.unit}`,
  };
}

function QuizResult({
  questions,
  answers,
  headingRef,
  onRestart,
}: {
  questions: QuizQuestion[];
  answers: (QuizAttempt | undefined)[];
  headingRef: RefObject<HTMLHeadingElement | null>;
  onRestart: () => void;
}) {
  return (
    <div className="quiz-result">
      <h3 ref={headingRef} tabIndex={-1} className="quiz-step-heading">
        {correctCount(answers)} von {questions.length} richtig
      </h3>
      <ul className="quiz-result-list">
        {questions.map((q, i) => {
          const attempt = answers[i];
          if (!attempt) return null;
          const texts = answerTexts(q, attempt);
          return (
            <li key={q.id}>
              <Disclosure
                summary={
                  <>
                    <span className={attempt.correct ? 'result result-ok' : 'result result-wrong'}>
                      <Icon name={attempt.correct ? 'check' : 'cross'} />{' '}
                      {attempt.correct ? 'Richtig' : 'Nicht ganz'}
                    </span>
                    <span className="quiz-result-prompt">{q.prompt}</span>
                  </>
                }
                openLabel="Antwort verbergen"
                closedLabel="Antwort zeigen"
              >
                <p>Deine Antwort: {texts.own}</p>
                <p>Richtige Antwort: {texts.right}</p>
                <InsightBox>{q.explanation}</InsightBox>
              </Disclosure>
            </li>
          );
        })}
      </ul>
      <Button variant="secondary" onClick={onRestart}>
        <Icon name="retry" size={18} />
        Nochmal
      </Button>
    </div>
  );
}

function QuizSteps({
  projectId,
  questions,
  attempts,
  estimateQuestionId,
}: {
  projectId: string;
  questions: QuizQuestion[];
  attempts: QuizAttempt[];
  estimateQuestionId?: string;
}) {
  // Schwelle für „Nochmal“: jüngster `createdAt` vom Server beim Klick, nie die Uhr des Browsers.
  const [restartedAfter, setRestartedAfter] = useState<string | undefined>(undefined);
  // Zählt die Neustarts; Teil des Schlüssels, damit jede Frage danach leer beginnt.
  const [round, setRound] = useState(0);
  // Gerade gegebene Antworten: gelten, bis der Server sie zurückliefert, und hängen nicht von ihm ab.
  const [given, setGiven] = useState<Record<string, QuizAttempt>>({});
  const answers = answersFor(questions, attempts, restartedAfter).map((a, i) => given[questions[i]?.id ?? ''] ?? a);
  const [index, setIndex] = useState<number | 'result'>(() => {
    const open = firstOpenIndex(answers);
    return open === -1 ? 'result' : open;
  });
  const headingRef = useRef<HTMLHeadingElement>(null);
  // Fokus nur auf ausdrücklichen Wunsch („Weiter“, „Zum Ergebnis“, „Nochmal“), nie beim Laden
  // (auch nicht, wenn StrictMode den Effekt doppelt ausführt).
  const shouldFocus = useRef(false);
  useEffect(() => {
    if (!shouldFocus.current) return;
    shouldFocus.current = false;
    headingRef.current?.focus();
  }, [index]);

  function goTo(next: number | 'result') {
    shouldFocus.current = true;
    setIndex(next);
  }

  function restart() {
    setRestartedAfter(restartThreshold(attempts));
    setRound((n) => n + 1);
    setGiven({});
    goTo(0);
  }

  if (index === 'result') {
    return <QuizResult questions={questions} answers={answers} headingRef={headingRef} onRestart={restart} />;
  }

  const q = questions[index];
  if (!q) return null;
  const questionId = q.id;
  const current = answers[index];
  const isLast = index === questions.length - 1;
  const statuses: ProjectStatus[] = questions.map((_, i) =>
    answers[i] ? 'done' : i === index ? 'started' : 'open',
  );
  function answered(answer: string, correct: boolean) {
    setGiven((g) => ({
      ...g,
      [questionId]: {
        projectId,
        questionId,
        phase: 'after',
        answer,
        correct,
        createdAt: new Date().toISOString(),
      },
    }));
  }
  // Nach „Nochmal“ startet die Frage leer: neuer Schlüssel, `saved` kommt nur aus gültigen Antworten.
  const key = `${q.id}-${round}`;
  return (
    <div className="quiz">
      <div className="quiz-step-head">
        <h3 ref={headingRef} tabIndex={-1} className="quiz-step-heading">
          Frage {index + 1} von {questions.length}
        </h3>
        <ProgressDots statuses={statuses} />
      </div>
      {q.type === 'estimate' ? (
        <EstimateQuestion
          key={key}
          projectId={projectId}
          question={q}
          phase="after"
          saved={current}
          before={
            q.id === estimateQuestionId
              ? attempts.find((a) => a.questionId === q.id && a.phase === 'before')
              : undefined
          }
          lockAfterAnswer
          onAnswered={answered}
        />
      ) : (
        <ChoiceQuestion key={key} projectId={projectId} question={q} saved={current} onAnswered={answered} />
      )}
      {current ? (
        <Button onClick={() => goTo(isLast ? 'result' : index + 1)}>
          {isLast ? 'Zum Ergebnis' : 'Weiter'}
        </Button>
      ) : null}
    </div>
  );
}

export function Quiz({
  projectId,
  questions,
  attempts,
  estimateQuestionId,
}: {
  projectId: string;
  questions: QuizQuestion[];
  attempts: QuizAttempt[] | undefined;
  estimateQuestionId?: string;
}) {
  if (!attempts) return <p className="muted">Lädt …</p>;
  // Die Schätzfrage steht vorne (stabil sortiert, sonst bleibt die Reihenfolge).
  const ordered = [...questions].sort((a, b) => Number(b.type === 'estimate') - Number(a.type === 'estimate'));
  return (
    <QuizSteps
      projectId={projectId}
      questions={ordered}
      attempts={attempts}
      estimateQuestionId={estimateQuestionId}
    />
  );
}
