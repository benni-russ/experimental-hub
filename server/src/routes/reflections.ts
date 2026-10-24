import type Database from 'better-sqlite3';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { idSchema } from '../lib/schemas.js';

const params = z.object({ questionId: idSchema });
const body = z.object({
  projectId: idSchema,
  answer: z.string({ error: 'Die Antwort fehlt.' }).max(20_000, 'Die Antwort ist zu lang (höchstens 20 000 Zeichen).'),
});

export function reflectionsRoutes(db: Database.Database, now: () => Date): FastifyPluginAsync {
  return async (app) => {
    app.put('/api/reflections/:questionId', async (request, reply) => {
      const { questionId } = params.parse(request.params);
      const { projectId, answer } = body.parse(request.body);

      if (answer.trim() === '') {
        // Eine leere Antwort gilt als nicht beantwortet.
        db.prepare('DELETE FROM reflection_answers WHERE question_id = ?').run(questionId);
      } else {
        db.prepare(
          `INSERT INTO reflection_answers (question_id, project_id, answer, updated_at) VALUES (?, ?, ?, ?)
           ON CONFLICT(question_id) DO UPDATE SET
             project_id = excluded.project_id, answer = excluded.answer, updated_at = excluded.updated_at`,
        ).run(questionId, projectId, answer, now().toISOString());
      }
      reply.code(204).send();
    });
  };
}
