import { describe, expect, it } from 'vitest';
import type { ContentMeta } from '@hub/shared';
import { meta as mdeMeta } from './001-mde/content';
import { allText, checkStructure } from './contentChecks';

const size = { quiz: 4, reflection: [2, 2] as [number, number], cards: [6, 8] as [number, number] };

describe('checkStructure', () => {
  it('001 ist gut', () => {
    expect(checkStructure(mdeMeta, size)).toEqual([]);
  });

  it('doppelte Karten-ID wird mit der ID gemeldet', () => {
    const copy: ContentMeta = {
      ...mdeMeta,
      cards: mdeMeta.cards.map((c, i) => (i === 1 ? { ...c, id: '001-card-01' } : c)),
    };
    const problems = checkStructure(copy, size);
    expect(problems.some((p) => p.includes('001-card-01'))).toBe(true);
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
      attachedTo: '001',
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
      quiz: mdeMeta.quiz.map((q) => (q.id === '001-quiz-01' ? { ...q, id: '001-quiz-09' } : q)),
    };
    expect(checkStructure(wrong, size).length).toBeGreaterThan(0);
  });
});

describe('checkStructure: erratbare Auswahlfragen', () => {
  const withOptions = (options: string[], correctIndex: number): ContentMeta => ({
    ...mdeMeta,
    quiz: mdeMeta.quiz.map((q) => (q.id === '001-quiz-02' && q.type === 'choice' ? { ...q, options, correctIndex } : q)),
  });

  it('meldet, wenn die richtige Option deutlich die längste ist', () => {
    const meta = withOptions(['Kurz.', 'Diese Antwort ist richtig und viel länger als alle anderen.', 'Auch kurz.'], 1);
    const problems = checkStructure(meta, size);
    expect(problems.some((p) => p.includes('001-quiz-02') && p.includes('längste'))).toBe(true);
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
