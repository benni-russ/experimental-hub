import { describe, expect, it } from 'vitest';
import type { AllNotesResponse } from '@hub/shared';
import { withNotes, withReflection } from './api';

const base: AllNotesResponse = {
  notes: [{ projectId: '000', note: 'alt', postIdea: '', updatedAt: 't0' }],
  reflections: [{ projectId: '000', questionId: 'q1', answer: 'alt', updatedAt: 't0' }],
};

describe('Cache-Aktualisierung beim Speichern', () => {
  it('ersetzt die Notiz des Projekts', () => {
    const r = withNotes(base, '000', { note: 'neu', postIdea: 'p' }, 't1');
    expect(r.notes).toEqual([{ projectId: '000', note: 'neu', postIdea: 'p', updatedAt: 't1' }]);
  });

  it('ersetzt eine Reflexionsantwort', () => {
    const r = withReflection(base, { questionId: 'q1', projectId: '000', answer: 'neu' }, 't1');
    expect(r.reflections).toHaveLength(1);
    expect(r.reflections[0]?.answer).toBe('neu');
  });

  it('entfernt eine leere Antwort wie der Server', () => {
    const r = withReflection(base, { questionId: 'q1', projectId: '000', answer: '  ' }, 't1');
    expect(r.reflections).toEqual([]);
  });
});
