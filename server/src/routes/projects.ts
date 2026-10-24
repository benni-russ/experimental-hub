import type { AllNotesResponse, NotesResponse } from '@hub/shared';
import type Database from 'better-sqlite3';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { idParams, idSchema } from '../lib/schemas.js';

const openBody = z.object({
  cardIds: z.array(idSchema, { error: 'cardIds muss eine Liste sein.' }).max(500, 'Zu viele Karten (höchstens 500).'),
});

const notesBody = z.object({
  note: z.string({ error: 'Die Notiz fehlt.' }).max(20_000, 'Die Notiz ist zu lang (höchstens 20 000 Zeichen).'),
  postIdea: z
    .string({ error: 'Die Post-Idee fehlt.' })
    .max(20_000, 'Die Post-Idee ist zu lang (höchstens 20 000 Zeichen).'),
});

export function projectsRoutes(db: Database.Database, now: () => Date): FastifyPluginAsync {
  return async (app) => {
    app.post('/api/projects/:id/open', async (request, reply) => {
      const { id } = idParams.parse(request.params);
      const { cardIds } = openBody.parse(request.body);
      const stamp = now().toISOString();

      db.transaction(() => {
        db.prepare(
          `INSERT INTO project_progress (project_id, started_at, last_opened_at) VALUES (?, ?, ?)
           ON CONFLICT(project_id) DO UPDATE SET last_opened_at = excluded.last_opened_at`,
        ).run(id, stamp, stamp);

        const insert = db.prepare(
          `INSERT OR IGNORE INTO card_state (card_id, project_id, box, due_at) VALUES (?, ?, 1, ?)`,
        );
        for (const cardId of cardIds) insert.run(cardId, id, stamp);

        // Gestrichene Karten verschwinden; eigene Karten (own-...) bleiben immer.
        const keep = new Set(cardIds);
        const existing = db
          .prepare(`SELECT card_id AS cardId FROM card_state WHERE project_id = ? AND card_id NOT LIKE 'own-%'`)
          .all(id) as { cardId: string }[];
        const remove = db.prepare('DELETE FROM card_state WHERE card_id = ? AND project_id = ?');
        for (const { cardId } of existing) {
          if (!keep.has(cardId)) remove.run(cardId, id);
        }
      })();

      reply.code(204).send();
    });

    app.get('/api/projects/:id/notes', async (request): Promise<NotesResponse> => {
      const { id } = idParams.parse(request.params);
      const row = db
        .prepare('SELECT note, post_idea AS postIdea, updated_at AS updatedAt FROM notes WHERE project_id = ?')
        .get(id) as NotesResponse | undefined;
      return row ?? { note: '', postIdea: '', updatedAt: null };
    });

    app.put('/api/projects/:id/notes', async (request, reply) => {
      const { id } = idParams.parse(request.params);
      const body = notesBody.parse(request.body);
      db.prepare(
        `INSERT INTO notes (project_id, note, post_idea, updated_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(project_id) DO UPDATE SET
           note = excluded.note, post_idea = excluded.post_idea, updated_at = excluded.updated_at`,
      ).run(id, body.note, body.postIdea, now().toISOString());
      reply.code(204).send();
    });

    app.get('/api/notes', async (): Promise<AllNotesResponse> => {
      const notes = db
        .prepare(
          `SELECT project_id AS projectId, note, post_idea AS postIdea, updated_at AS updatedAt
           FROM notes ORDER BY project_id`,
        )
        .all() as AllNotesResponse['notes'];
      const reflections = db
        .prepare(
          `SELECT project_id AS projectId, question_id AS questionId, answer, updated_at AS updatedAt
           FROM reflection_answers ORDER BY project_id, question_id`,
        )
        .all() as AllNotesResponse['reflections'];
      return { notes, reflections };
    });
  };
}
