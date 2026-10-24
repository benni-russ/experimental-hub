import { beforeEach, describe, expect, it } from 'vitest';
import { createTestContext, type TestContext } from './testHelpers.js';

let t: TestContext;
beforeEach(() => {
  t = createTestContext();
});

describe('Lernrunde', () => {
  it('nicht gewusst setzt auf Fach 1 und morgen', async () => {
    await t.open('001', ['001-card-01']);
    t.db.prepare('UPDATE card_state SET box = 3 WHERE card_id = ?').run('001-card-01');
    const res = await t.post('/api/review/001-card-01', { known: false });
    expect(res).toEqual({ box: 1, dueAt: '2026-01-02T10:00:00.000Z' });
    expect(t.row('001-card-01')?.last_reviewed_at).toBe('2026-01-01T10:00:00.000Z');
  });

  it('gewusst rückt ein Fach vor', async () => {
    await t.open('001', ['001-card-01']);
    const res = await t.post('/api/review/001-card-01', { known: true });
    expect(res).toEqual({ box: 2, dueAt: '2026-01-04T10:00:00.000Z' });
  });

  it('liefert nur fällige Karten, niedrigstes Fach zuerst', async () => {
    await t.open('001', ['001-card-01', '001-card-02', '001-card-03']);
    await t.post('/api/review/001-card-01', { known: true }); // Fach 2, in 3 Tagen
    t.db.prepare('UPDATE card_state SET box = 2 WHERE card_id = ?').run('001-card-03');
    const due = await t.get('/api/review/due');
    expect(due.map((d: { cardId: string }) => d.cardId)).toEqual(['001-card-02', '001-card-03']);
    t.setNow('2026-01-04T10:00:00.000Z');
    const later = await t.get('/api/review/due');
    expect(later.map((d: { cardId: string }) => d.cardId)).toEqual(['001-card-02', '001-card-03', '001-card-01']);
  });

  it('unbekannte Karte → 404', async () => {
    const res = await t.postRaw('/api/review/x', { known: true });
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe('NOT_FOUND');
  });

  it('known muss boolean sein', async () => {
    await t.open('001', ['001-card-01']);
    expect((await t.postRaw('/api/review/001-card-01', { known: 'ja' })).statusCode).toBe(400);
  });
});

describe('Vorschau', () => {
  const setDue = (cardId: string, dueAt: string) =>
    t.db.prepare('UPDATE card_state SET due_at = ? WHERE card_id = ?').run(dueAt, cardId);

  it('liefert Überfälliges und alles unter 7 Tagen, sortiert', async () => {
    await t.open('001', ['001-card-01', '001-card-02', '001-card-03']);
    setDue('001-card-01', '2025-12-31T10:00:00.000Z');
    setDue('001-card-02', '2026-01-08T09:59:59.999Z');
    setDue('001-card-03', '2026-01-08T10:00:00.000Z');
    expect(await t.get('/api/review/upcoming')).toEqual([
      { cardId: '001-card-01', projectId: '001', dueAt: '2025-12-31T10:00:00.000Z' },
      { cardId: '001-card-02', projectId: '001', dueAt: '2026-01-08T09:59:59.999Z' },
    ]);
  });

  it('gleiche Fälligkeit nach card_id', async () => {
    await t.open('001', ['001-card-02', '001-card-01']);
    setDue('001-card-01', '2026-01-03T10:00:00.000Z');
    setDue('001-card-02', '2026-01-03T10:00:00.000Z');
    const upcoming = await t.get('/api/review/upcoming');
    expect(upcoming.map((u: { cardId: string }) => u.cardId)).toEqual(['001-card-01', '001-card-02']);
  });

  it('eigene Karte ohne Text fehlt', async () => {
    await t.open('001', ['001-card-01']);
    const created = await t.post('/api/own-cards', { projectId: '001', front: 'F', back: 'B' });
    t.db
      .prepare("INSERT INTO card_state (card_id, project_id, box, due_at) VALUES ('own-999', '001', 1, ?)")
      .run('2026-01-02T10:00:00.000Z');
    const upcoming = await t.get('/api/review/upcoming');
    const ids = upcoming.map((u: { cardId: string }) => u.cardId);
    expect(ids).toContain(`own-${created.id}`);
    expect(ids).not.toContain('own-999');
  });
});
