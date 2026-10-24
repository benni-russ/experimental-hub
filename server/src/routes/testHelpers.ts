import type Database from 'better-sqlite3';
import type { FastifyInstance, LightMyRequestResponse } from 'fastify';
import { buildApp } from '../app.js';
import { openDatabase } from '../db/connection.js';
import { migrate } from '../db/migrate.js';

export interface CardRow {
  card_id: string;
  project_id: string;
  box: number;
  due_at: string;
  last_reviewed_at: string | null;
}

type Injected = Promise<LightMyRequestResponse>;

export interface TestContext {
  app: FastifyInstance;
  db: Database.Database;
  setNow: (iso: string) => void;
  open: (projectId: string, cardIds: string[]) => Promise<void>;
  get: (url: string) => Promise<any>;
  post: (url: string, body: unknown) => Promise<any>;
  getRaw: (url: string) => Injected;
  postRaw: (url: string, body: unknown) => Injected;
  putRaw: (url: string, body: unknown) => Injected;
  deleteRaw: (url: string) => Injected;
  row: (cardId: string) => CardRow | undefined;
  allCardIds: () => string[];
}

export function createTestContext(startIso = '2026-01-01T10:00:00.000Z'): TestContext {
  const db = openDatabase(':memory:');
  migrate(db);
  let current = new Date(startIso);
  const app = buildApp(db, { now: () => current });

  const getRaw = (url: string) => app.inject({ method: 'GET', url });
  const postRaw = (url: string, body: unknown) => app.inject({ method: 'POST', url, payload: body as object });
  const putRaw = (url: string, body: unknown) => app.inject({ method: 'PUT', url, payload: body as object });
  const deleteRaw = (url: string) => app.inject({ method: 'DELETE', url });

  return {
    app,
    db,
    setNow: (iso) => {
      current = new Date(iso);
    },
    getRaw,
    postRaw,
    putRaw,
    deleteRaw,
    get: async (url) => (await getRaw(url)).json(),
    post: async (url, body) => (await postRaw(url, body)).json(),
    open: async (projectId, cardIds) => {
      const res = await postRaw(`/api/projects/${projectId}/open`, { cardIds });
      if (res.statusCode !== 204) throw new Error(`open fehlgeschlagen: ${res.statusCode} ${res.body}`);
    },
    row: (cardId) => db.prepare('SELECT * FROM card_state WHERE card_id = ?').get(cardId) as CardRow | undefined,
    allCardIds: () =>
      (db.prepare('SELECT card_id FROM card_state ORDER BY card_id').all() as { card_id: string }[]).map(
        (r) => r.card_id,
      ),
  };
}
