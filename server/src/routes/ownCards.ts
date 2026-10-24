import type { OwnCard } from '@hub/shared';
import type Database from 'better-sqlite3';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { notFound } from '../lib/errors.js';
import { idParams, idSchema } from '../lib/schemas.js';

const optionalProjectIdQuery = z.object({ projectId: idSchema.optional() });

const side = (name: string) =>
  z
    .string({ error: `${name} fehlt.` })
    .trim()
    .min(1, `${name} darf nicht leer sein.`)
    .max(500, `${name} ist zu lang (höchstens 500 Zeichen).`);

const cardBody = z.object({ projectId: idSchema, front: side('Die Vorderseite'), back: side('Die Rückseite') });

export function ownCardsRoutes(db: Database.Database, now: () => Date): FastifyPluginAsync {
  return async (app) => {
    app.get('/api/own-cards', async (request): Promise<OwnCard[]> => {
      // Ohne projectId alle eigenen Karten (für die Suche).
      const { projectId } = optionalProjectIdQuery.parse(request.query);
      const select = 'SELECT id, project_id AS projectId, front, back FROM own_cards';
      const rows = (
        projectId === undefined
          ? db.prepare(`${select} ORDER BY project_id, id`).all()
          : db.prepare(`${select} WHERE project_id = ? ORDER BY id`).all(projectId)
      ) as (Omit<OwnCard, 'id'> & { id: number })[];
      return rows.map((r) => ({ ...r, id: String(r.id) }));
    });

    app.post('/api/own-cards', async (request, reply) => {
      const b = cardBody.parse(request.body);
      const stamp = now().toISOString();
      const id = db.transaction(() => {
        const result = db
          .prepare('INSERT INTO own_cards (project_id, front, back, created_at) VALUES (?, ?, ?, ?)')
          .run(b.projectId, b.front, b.back, stamp);
        const newId = String(result.lastInsertRowid);
        db.prepare('INSERT INTO card_state (card_id, project_id, box, due_at) VALUES (?, ?, 1, ?)').run(
          `own-${newId}`,
          b.projectId,
          stamp,
        );
        return newId;
      })();
      const card: OwnCard = { id, projectId: b.projectId, front: b.front, back: b.back };
      reply.code(201).send(card);
    });

    app.delete('/api/own-cards/:id', async (request, reply) => {
      const { id } = idParams.parse(request.params);
      const removed = db.transaction(() => {
        if (!/^\d+$/.test(id)) return false;
        const result = db.prepare('DELETE FROM own_cards WHERE id = ?').run(Number(id));
        if (result.changes === 0) return false;
        db.prepare('DELETE FROM card_state WHERE card_id = ?').run(`own-${id}`);
        return true;
      })();
      if (!removed) throw notFound('Die Karte gibt es nicht.');
      reply.code(204).send();
    });
  };
}
