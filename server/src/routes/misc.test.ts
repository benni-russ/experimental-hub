import { beforeEach, describe, expect, it } from 'vitest';
import { createTestContext, type TestContext } from './testHelpers.js';

let t: TestContext;
beforeEach(() => {
  t = createTestContext();
});

describe('Gesundheit und Fehler', () => {
  it('health', async () => {
    expect(await t.get('/api/health')).toEqual({ status: 'ok' });
  });
  it('unbekannte API-Route → 404 JSON', async () => {
    const res = await t.getRaw('/api/gibt-es-nicht');
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe('NOT_FOUND');
  });
});

describe('Reflexion', () => {
  it('leere Reflexionsantwort löscht die Antwort', async () => {
    expect((await t.putRaw('/api/reflections/001-refl-01', { projectId: '001', answer: 'x' })).statusCode).toBe(204);
    expect((await t.get('/api/state')).answeredReflections).toEqual([
      { questionId: '001-refl-01', projectId: '001' },
    ]);
    await t.putRaw('/api/reflections/001-refl-01', { projectId: '001', answer: '  ' });
    expect((await t.get('/api/state')).answeredReflections).toEqual([]);
  });

  it('Antwort überschreibt und erscheint in /api/notes', async () => {
    await t.putRaw('/api/reflections/001-refl-01', { projectId: '001', answer: 'a' });
    t.setNow('2026-01-02T00:00:00.000Z');
    await t.putRaw('/api/reflections/001-refl-01', { projectId: '001', answer: 'b' });
    expect((await t.get('/api/notes')).reflections).toEqual([
      { projectId: '001', questionId: '001-refl-01', answer: 'b', updatedAt: '2026-01-02T00:00:00.000Z' },
    ]);
  });
});

describe('Notizen', () => {
  it('GET ohne Zeile liefert leere Strings', async () => {
    expect(await t.get('/api/projects/001/notes')).toEqual({ note: '', postIdea: '', updatedAt: null });
  });

  it('PUT speichert, GET liefert, /api/notes listet', async () => {
    expect((await t.putRaw('/api/projects/001/notes', { note: 'N', postIdea: 'P' })).statusCode).toBe(204);
    expect(await t.get('/api/projects/001/notes')).toEqual({
      note: 'N',
      postIdea: 'P',
      updatedAt: '2026-01-01T10:00:00.000Z',
    });
    expect((await t.get('/api/notes')).notes).toEqual([
      { projectId: '001', note: 'N', postIdea: 'P', updatedAt: '2026-01-01T10:00:00.000Z' },
    ]);
  });

  it('lehnt mehr als 20 000 Zeichen ab', async () => {
    const res = await t.putRaw('/api/projects/001/notes', { note: 'x'.repeat(20_001), postIdea: '' });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('INVALID_INPUT');
  });
});

describe('Quiz', () => {
  const body = { projectId: '001', questionId: '001-quiz-01', phase: 'before', answer: '5', correct: false };

  it('liefert die letzte Antwort je (Frage, Phase)', async () => {
    expect((await t.postRaw('/api/quiz-attempts', body)).statusCode).toBe(201);
    await t.postRaw('/api/quiz-attempts', { ...body, answer: '7', correct: true }); // gleiche created_at
    await t.postRaw('/api/quiz-attempts', { ...body, phase: 'after', answer: '9', correct: true });
    const list = await t.get('/api/quiz-attempts?projectId=001');
    expect(list).toHaveLength(2);
    expect(list).toEqual(
      expect.arrayContaining([
        { ...body, answer: '7', correct: true, createdAt: '2026-01-01T10:00:00.000Z' },
        { ...body, phase: 'after', answer: '9', correct: true, createdAt: '2026-01-01T10:00:00.000Z' },
      ]),
    );
  });

  it('ohne projectId → 400, ungültige Phase → 400', async () => {
    expect((await t.getRaw('/api/quiz-attempts')).statusCode).toBe(400);
    expect((await t.postRaw('/api/quiz-attempts', { ...body, phase: 'during' })).statusCode).toBe(400);
  });
});

describe('State', () => {
  it('dueCount entspricht review/due', async () => {
    await t.open('001', ['001-card-01', '001-card-02']);
    await t.post('/api/review/001-card-01', { known: true });
    const due = await t.get('/api/review/due');
    expect(due).toHaveLength(1);
    expect((await t.get('/api/state')).dueCount).toBe(1);
  });
});
