import { beforeEach, describe, expect, it } from 'vitest';
import { createTestContext, type TestContext } from './testHelpers.js';

let t: TestContext;
beforeEach(() => {
  t = createTestContext();
});

describe('POST /api/projects/:id/open', () => {
  it('legt beim ersten Öffnen Karten in Fach 1 an, sofort fällig', async () => {
    await t.open('A-001', ['A-001-card-01', 'A-001-card-02']);
    const due = await t.get('/api/review/due');
    expect(due.map((d: { cardId: string }) => d.cardId)).toEqual(['A-001-card-01', 'A-001-card-02']);
    expect(t.row('A-001-card-01')).toMatchObject({ box: 1, due_at: '2026-01-01T10:00:00.000Z' });
  });

  it('erneutes Öffnen behält den Lernstand', async () => {
    await t.open('A-001', ['A-001-card-01']);
    await t.post('/api/review/A-001-card-01', { known: true });
    await t.open('A-001', ['A-001-card-01']);
    expect(t.row('A-001-card-01')?.box).toBe(2);
  });

  it('erneutes Öffnen ergänzt neue und entfernt gestrichene Karten, eigene bleiben', async () => {
    await t.open('A-001', ['A-001-card-01', 'A-001-card-02']);
    const own = await t.post('/api/own-cards', { projectId: 'A-001', front: 'F', back: 'B' });
    await t.open('A-001', ['A-001-card-02', 'A-001-card-03']);
    expect(t.allCardIds()).toEqual(expect.arrayContaining(['A-001-card-02', 'A-001-card-03', `own-${own.id}`]));
    expect(t.allCardIds()).not.toContain('A-001-card-01');
  });

  it('fasst Karten anderer Projekte nicht an', async () => {
    await t.open('A-002.1', ['A-002.1-card-01']);
    await t.open('A-001', ['A-001-card-01']);
    expect(t.allCardIds()).toContain('A-002.1-card-01');
  });

  it('started_at bleibt beim zweiten Öffnen gleich, last_opened_at wandert', async () => {
    await t.open('A-001', []);
    t.setNow('2026-01-05T08:00:00.000Z');
    await t.open('A-001', []);
    const state = await t.get('/api/state');
    expect(state.progress).toEqual([
      { projectId: 'A-001', startedAt: '2026-01-01T10:00:00.000Z', lastOpenedAt: '2026-01-05T08:00:00.000Z' },
    ]);
  });

  it('lehnt ungültige Eingaben mit 400 INVALID_INPUT ab', async () => {
    const res = await t.postRaw('/api/projects/A-001/open', { cardIds: 'x' });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('INVALID_INPUT');
    const tooMany = await t.postRaw('/api/projects/A-001/open', {
      cardIds: Array.from({ length: 501 }, (_, i) => `c${i}`),
    });
    expect(tooMany.statusCode).toBe(400);
  });
});
