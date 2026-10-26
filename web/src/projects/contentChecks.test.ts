import { describe, expect, it } from 'vitest';
import type { ContentMeta } from '@hub/shared';
import { meta as mdeMeta } from './a-001-mde/content';
import { allText, checkStructure } from './contentChecks';

const size = { quiz: 4, reflection: [2, 2] as [number, number], cards: [6, 8] as [number, number] };

describe('checkStructure', () => {
  it('A-001 ist gut', () => {
    expect(checkStructure(mdeMeta, size)).toEqual([]);
  });

  it('doppelte Karten-ID wird mit der ID gemeldet', () => {
    const copy: ContentMeta = {
      ...mdeMeta,
      cards: mdeMeta.cards.map((c, i) => (i === 1 ? { ...c, id: 'A-001-card-01' } : c)),
    };
    const problems = checkStructure(copy, size);
    expect(problems.some((p) => p.includes('A-001-card-01'))).toBe(true);
  });

  it('Unit ohne attachedTo wird gemeldet', () => {
    const unit: ContentMeta = { ...mdeMeta, kind: 'unit', quiz: [], attachedTo: undefined };
    const problems = checkStructure(unit, { quiz: 0, reflection: [1, 2], cards: [3, 5] });
    expect(problems.some((p) => p.includes('attachedTo'))).toBe(true);
  });

  it('Unit mit gesetztem attachedTo und leerem Quiz ist gut', () => {
    const unit: ContentMeta = {
      ...mdeMeta,
      kind: 'unit',
      quiz: [],
      attachedTo: 'A-001',
      intro: { text: mdeMeta.intro.text },
      cards: mdeMeta.cards.slice(0, 4),
    };
    expect(checkStructure(unit, { quiz: 0, reflection: [1, 2], cards: [3, 5] })).toEqual([]);
  });

  it('Umfang außerhalb der Grenzen wird gemeldet', () => {
    const tooFewCards: ContentMeta = { ...mdeMeta, cards: mdeMeta.cards.slice(0, 3) };
    expect(checkStructure(tooFewCards, size).length).toBeGreaterThan(0);
  });

  it('Schätzfrage mit falscher ID wird gemeldet', () => {
    const wrong: ContentMeta = {
      ...mdeMeta,
      quiz: mdeMeta.quiz.map((q) => (q.id === 'A-001-quiz-01' ? { ...q, id: 'A-001-quiz-09' } : q)),
    };
    expect(checkStructure(wrong, size).length).toBeGreaterThan(0);
  });
});

describe('checkStructure: erratbare Auswahlfragen', () => {
  const withOptions = (options: string[], correctIndex: number): ContentMeta => ({
    ...mdeMeta,
    quiz: mdeMeta.quiz.map((q) => (q.id === 'A-001-quiz-02' && q.type === 'choice' ? { ...q, options, correctIndex } : q)),
  });

  it('meldet, wenn die richtige Option deutlich die längste ist', () => {
    const meta = withOptions(['Kurz.', 'Diese Antwort ist richtig und viel länger als alle anderen.', 'Auch kurz.'], 1);
    const problems = checkStructure(meta, size);
    expect(problems.some((p) => p.includes('A-001-quiz-02') && p.includes('längste'))).toBe(true);
  });

  it('richtige Option nur wenig länger als die zweitlängste ist in Ordnung', () => {
    const meta = withOptions(['Eine falsche Antwort mit Text.', 'Die richtige Antwort mit Text.', 'Kurz.'], 1);
    expect(checkStructure(meta, size)).toEqual([]);
  });

  it('richtige Option nicht die längste ist in Ordnung', () => {
    const meta = withOptions(['Eine sehr lange falsche Antwort mit viel Text darin.', 'Richtig.', 'Kurz.'], 1);
    expect(checkStructure(meta, size)).toEqual([]);
  });
});

describe('allText', () => {
  it('enthält die Zahl aus der Schätzfrage', () => {
    expect(allText(mdeMeta)).toContain('14.751');
  });
});

describe('Code-Aufgaben', () => {
  const task = (id: string) => ({
    id,
    title: 'Titel der Aufgabe',
    prompt: 'Berechne den Mittelwert.',
    starter: 'function mean(xs) {}',
    hints: ['Erster Hinweis zur Summe.', 'Zweiter Hinweis zur Division.'],
    solution: 'function mean(xs) { return 0; }',
  });
  const withTasks = (...ids: string[]): ContentMeta => ({ ...mdeMeta, id: 'X-001', codeTasks: ids.map(task) });

  it('ungültige Code-ID wird mit der ID gemeldet', () => {
    const problems = checkStructure(withTasks('X-001-code-1'), size);
    expect(problems).toContain('Code-Aufgabe hat eine ungültige ID: X-001-code-1');
  });

  it('gültige Code-ID wird nicht beanstandet', () => {
    const problems = checkStructure(withTasks('X-001-code-01'), size);
    expect(problems.some((p) => p.includes('Code-Aufgabe'))).toBe(false);
  });

  it('doppelte Code-ID wird gemeldet', () => {
    const problems = checkStructure(withTasks('X-001-code-01', 'X-001-code-01'), size);
    expect(problems).toContain('ID doppelt vergeben: X-001-code-01');
  });

  it('allText enthält Titel, Aufgabentext und jeden Hinweis', () => {
    const text = allText(withTasks('X-001-code-01'));
    expect(text).toContain('Titel der Aufgabe');
    expect(text).toContain('Berechne den Mittelwert.');
    expect(text).toContain('Erster Hinweis zur Summe.');
    expect(text).toContain('Zweiter Hinweis zur Division.');
  });
});

describe('checkStructure: Backticks nur in Code-Aufgaben', () => {
  const BACKTICK = 'Backtick im reinen Text';

  it('meldet Backticks in Karten, Quiz, Reflexion, Einstieg und Kernfrage', () => {
    const quiz = mdeMeta.quiz.map((q, i) => (i === 1 ? { ...q, explanation: `${q.explanation} \`x\`` } : q));
    const cards = mdeMeta.cards.map((c, i) => (i === 0 ? { ...c, back: 'mit `code`' } : c));
    const reflection = mdeMeta.reflection.map((r, i) => (i === 0 ? { ...r, prompt: '`a`' } : r));
    for (const meta of [
      { ...mdeMeta, quiz },
      { ...mdeMeta, cards },
      { ...mdeMeta, reflection },
      { ...mdeMeta, intro: { ...mdeMeta.intro, text: '`x`' } },
      { ...mdeMeta, question: 'Was macht `x`?' },
    ]) {
      expect(checkStructure(meta, size).some((p) => p.startsWith(BACKTICK))).toBe(true);
    }
  });

  it('meldet Backticks im Titel einer Code-Aufgabe, nicht in Aufgabentext und Hinweisen', () => {
    const task = {
      id: 'A-001-code-01',
      title: 'Schreib `mean`',
      prompt: 'Gib `mean` zurück.',
      starter: '',
      hints: ['Nutze `reduce`.'],
      solution: '',
    };
    const problems = checkStructure({ ...mdeMeta, codeTasks: [task] }, size);
    expect(problems).toEqual(['Backtick im Titel der Code-Aufgabe A-001-code-01']);
    const plainTitle = checkStructure({ ...mdeMeta, codeTasks: [{ ...task, title: 'Schreib mean' }] }, size);
    expect(plainTitle).toEqual([]);
  });
});
