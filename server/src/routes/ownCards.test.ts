import { beforeEach, describe, expect, it } from 'vitest';
import { createTestContext, type TestContext } from './testHelpers.js';

let t: TestContext;
beforeEach(() => {
  t = createTestContext();
});

describe('eigene Karten', () => {
  it('lehnt leere und reine Leerzeichen ab', async () => {
    expect((await t.postRaw('/api/own-cards', { projectId: 'A-001', front: '   ', back: 'B' })).statusCode).toBe(400);
    expect((await t.postRaw('/api/own-cards', { projectId: 'A-001', front: 'F', back: '' })).statusCode).toBe(400);
    expect(
      (await t.postRaw('/api/own-cards', { projectId: 'A-001', front: 'x'.repeat(501), back: 'B' })).statusCode,
    ).toBe(400);
  });

  it('speichert getrimmt, legt Lernstand an und liefert sie fällig', async () => {
    const res = await t.postRaw('/api/own-cards', { projectId: 'A-001', front: '  F ', back: ' B  ' });
    expect(res.statusCode).toBe(201);
    const card = res.json();
    expect(card).toEqual({ id: expect.any(String), projectId: 'A-001', front: 'F', back: 'B' });
    expect(t.row(`own-${card.id}`)).toMatchObject({ box: 1, project_id: 'A-001' });
    const due = await t.get('/api/review/due');
    expect(due).toEqual([
      { cardId: `own-${card.id}`, projectId: 'A-001', box: 1, dueAt: '2026-01-01T10:00:00.000Z', front: 'F', back: 'B' },
    ]);
    expect(await t.get('/api/own-cards?projectId=A-001')).toEqual([card]);
  });

  it('GET ohne projectId liefert alle eigenen Karten, nach Projekt und ID sortiert', async () => {
    const a = await t.post('/api/own-cards', { projectId: 'A-002.1', front: 'A', back: 'a' });
    const b = await t.post('/api/own-cards', { projectId: 'A-001', front: 'B', back: 'b' });
    const c = await t.post('/api/own-cards', { projectId: 'A-001', front: 'C', back: 'c' });
    const res = await t.getRaw('/api/own-cards');
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([b, c, a]);
    expect(await t.get('/api/own-cards?projectId=A-002.1')).toEqual([a]);
  });

  it('GET mit leerer projectId → 400', async () => {
    expect((await t.getRaw('/api/own-cards?projectId=')).statusCode).toBe(400);
  });

  it('Löschen entfernt auch den Lernstand', async () => {
    const card = await t.post('/api/own-cards', { projectId: 'A-001', front: 'F', back: 'B' });
    expect((await t.deleteRaw(`/api/own-cards/${card.id}`)).statusCode).toBe(204);
    expect(t.row(`own-${card.id}`)).toBeUndefined();
    expect(await t.get('/api/own-cards?projectId=A-001')).toEqual([]);
  });

  it('Löschen einer unbekannten ID → 404', async () => {
    const res = await t.deleteRaw('/api/own-cards/999');
    expect(res.statusCode).toBe(404);
    expect(res.json().error.code).toBe('NOT_FOUND');
  });
});
