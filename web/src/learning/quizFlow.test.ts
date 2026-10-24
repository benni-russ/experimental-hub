import { describe, expect, it } from 'vitest';
import type { QuizAttempt, QuizQuestion } from '@hub/shared';
import { answersFor, choiceState, correctCount, firstOpenIndex, restartThreshold } from './quizFlow';

function a(questionId: string, correct: boolean, createdAt: string): QuizAttempt {
  return { projectId: 'x', questionId, phase: 'after', answer: '0', correct, createdAt };
}

const qs = [{ id: 'x-quiz-01' }, { id: 'x-quiz-02' }, { id: 'x-quiz-03' }] as QuizQuestion[];

describe('quizFlow', () => {
  it('ordnet Versuche den Fragen zu, ignoriert before', () => {
    const r = answersFor(qs, [
      a('x-quiz-02', true, '2026-10-24T10:00:00Z'),
      { ...a('x-quiz-01', true, '2026-10-24T10:00:00Z'), phase: 'before' },
    ]);
    expect(r.map((x) => x?.questionId)).toEqual([undefined, 'x-quiz-02', undefined]);
  });

  it('erste offene Frage', () => {
    expect(firstOpenIndex([a('x-quiz-01', true, 't'), a('x-quiz-02', false, 't'), undefined])).toBe(2);
    expect(firstOpenIndex([a('x-quiz-01', true, 't'), undefined, undefined])).toBe(1);
    expect(
      firstOpenIndex([a('x-quiz-01', true, 't'), a('x-quiz-02', false, 't'), a('x-quiz-03', true, 't')]),
    ).toBe(-1);
  });

  it('zählt richtige', () =>
    expect(correctCount([a('x-quiz-01', true, 't'), a('x-quiz-02', false, 't'), undefined])).toBe(1));

  it('nach Neustart zählen nur Versuche nach der Schwelle', () => {
    const at = [a('x-quiz-01', true, '2026-10-24T10:00:00Z'), a('x-quiz-02', true, '2026-10-24T12:00:00Z')];
    expect(answersFor(qs, at, '2026-10-24T11:00:00Z').map((x) => x?.questionId)).toEqual([
      undefined,
      'x-quiz-02',
      undefined,
    ]);
    // Der Versuch, der die Schwelle gesetzt hat, zählt selbst nicht mehr.
    expect(answersFor(qs, at, '2026-10-24T12:00:00Z').every((x) => x === undefined)).toBe(true);
  });

  it('Schwelle ist der jüngste vorhandene Versuch, leer ohne Versuche', () => {
    expect(
      restartThreshold([
        a('x-quiz-01', true, '2026-10-24T10:00:00Z'),
        a('x-quiz-02', true, '2026-10-24T12:00:00Z'),
        a('x-quiz-03', true, '2026-10-24T11:00:00Z'),
      ]),
    ).toBe('2026-10-24T12:00:00Z');
    expect(restartThreshold([])).toBe('');
  });

  it('„Nochmal“ funktioniert auch, wenn die Uhr des Servers vorgeht', () => {
    // Server eine Stunde vor dem Browser: alte Antworten liegen in der Zukunft des Browsers.
    const old = [a('x-quiz-01', true, '2026-10-24T13:00:00Z'), a('x-quiz-02', false, '2026-10-24T13:00:05Z')];
    const browserNow = '2026-10-24T12:00:10Z';
    // Mit der Browseruhr als Schwelle gälten die alten Antworten weiter …
    expect(answersFor(qs, old, browserNow).filter(Boolean)).toHaveLength(2);
    // … mit der Schwelle aus den Serverdaten nicht.
    const threshold = restartThreshold(old);
    expect(answersFor(qs, old, threshold).every((x) => x === undefined)).toBe(true);
    // Eine neue Antwort danach (Serverzeit) zählt.
    const fresh = [a('x-quiz-01', false, '2026-10-24T13:01:00Z'), old[1]!];
    expect(answersFor(qs, fresh, threshold).map((x) => x?.questionId)).toEqual(['x-quiz-01', undefined, undefined]);
  });
});

describe('choiceState', () => {
  it('ohne Entwurf ist „Antwort prüfen“ aus', () =>
    expect(choiceState(null, null, false)).toEqual({ locked: false, canCheck: false }));

  it('ein Entwurf allein sperrt nicht', () =>
    expect(choiceState(2, null, false)).toEqual({ locked: false, canCheck: true }));

  it('nach dem Prüfen gesperrt', () => expect(choiceState(2, 2, false)).toEqual({ locked: true, canCheck: false }));

  it('nach einem Speicherfehler neu prüfbar', () =>
    expect(choiceState(1, 2, true)).toEqual({ locked: false, canCheck: true }));
});
