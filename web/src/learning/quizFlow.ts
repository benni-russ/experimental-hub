import type { QuizAttempt, QuizQuestion } from '@hub/shared';

/**
 * Je Frage der Versuch der Phase `after`; `undefined`, wenn es keinen gibt oder
 * er nicht nach dem Neustart ("Nochmal") entstand. `restartedAfter` ist ein
 * `createdAt` vom Server (siehe `restartThreshold`); ISO, der Stringvergleich genügt.
 */
export function answersFor(
  questions: QuizQuestion[],
  attempts: QuizAttempt[],
  restartedAfter?: string,
): (QuizAttempt | undefined)[] {
  return questions.map((q) => {
    const found = attempts.find((a) => a.questionId === q.id && a.phase === 'after');
    if (!found) return undefined;
    if (restartedAfter !== undefined && found.createdAt <= restartedAfter) return undefined;
    return found;
  });
}

/**
 * Schwelle für „Nochmal“: der jüngste `createdAt` der vorhandenen Versuche.
 * Beide Seiten des Vergleichs stammen so von der Uhr des Servers, nie vom Browser.
 * Ohne Versuche ist die Schwelle der leere String, vor dem jeder Zeitstempel liegt.
 */
export function restartThreshold(attempts: QuizAttempt[]): string {
  return attempts.reduce((max, a) => (a.createdAt > max ? a.createdAt : max), '');
}

/** Index der ersten unbeantworteten Frage, −1 wenn alle beantwortet sind. */
export function firstOpenIndex(answers: (QuizAttempt | undefined)[]): number {
  return answers.findIndex((a) => a === undefined);
}

export function correctCount(answers: (QuizAttempt | undefined)[]): number {
  return answers.filter((a) => a?.correct).length;
}

/**
 * Zustand einer Auswahlfrage. Das Radio setzt nur den Entwurf (`picked`), erst
 * „Antwort prüfen“ legt die Antwort fest (`checked`). Danach ist die Frage gesperrt,
 * außer das Speichern ist fehlgeschlagen; neu antworten geht sonst nur über „Nochmal“.
 */
export function choiceState(
  picked: number | null,
  checked: number | null,
  saveFailed: boolean,
): { locked: boolean; canCheck: boolean } {
  const locked = checked !== null && !saveFailed;
  return { locked, canCheck: !locked && picked !== null };
}
