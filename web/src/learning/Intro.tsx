import type { ContentMeta, QuizAttempt } from '@hub/shared';
import { EstimateQuestion } from './EstimateQuestion';

export function Intro({
  meta,
  attempts,
  loadError,
}: {
  meta: ContentMeta;
  /** undefined solange die Versuche noch laden */
  attempts: QuizAttempt[] | undefined;
  /** Fehlertext, wenn das Laden der Versuche scheiterte */
  loadError?: string;
}) {
  const question = meta.quiz.find((q) => q.id === meta.intro.estimateQuestionId);
  return (
    <div className="intro">
      <p>{meta.intro.text}</p>
      {question && question.type === 'estimate' ? (
        <section className="intro-estimate" aria-labelledby="intro-estimate-kicker">
          <p id="intro-estimate-kicker" className="intro-estimate-kicker">
            Deine Einschätzung
          </p>
          {attempts ? (
            <EstimateQuestion
              projectId={meta.id}
              question={question}
              phase="before"
              saved={attempts.find((a) => a.questionId === question.id && a.phase === 'before')}
            />
          ) : loadError ? (
            <p className="field-error" role="alert">
              Gespeicherte Antworten konnten nicht geladen werden ({loadError}).
            </p>
          ) : (
            <p className="muted">Lädt …</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
