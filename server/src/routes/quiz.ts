import type { QuizAttempt } from '@hub/shared';
import type Database from 'better-sqlite3';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { idSchema, projectIdQuery } from '../lib/schemas.js';

const attemptBody = z.object({
  projectId: idSchema,
  questionId: idSchema,
  phase: z.enum(['before', 'after'], { error: 'Die Phase muss before oder after sein.' }),
  answer: z.string({ error: 'Die Antwort fehlt.' }).max(1_000, 'Die Antwort ist zu lang (höchstens 1 000 Zeichen).'),
  correct: z.boolean({ error: 'correct muss wahr oder falsch sein.' }),
});

export function quizRoutes(db: Database.Database, now: () => Date): FastifyPluginAsync {
  return async (app) => {
    app.post('/api/quiz-attempts', async (request, reply) => {
      const b = attemptBody.parse(request.body);
      db.prepare(
        `INSERT INTO quiz_attempts (project_id, question_id, phase, answer, correct, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).run(b.projectId, b.questionId, b.phase, b.answer, b.correct ? 1 : 0, now().toISOString());
      reply.code(201).send();
    });

    app.get('/api/quiz-attempts', async (request): Promise<QuizAttempt[]> => {
      const { projectId } = projectIdQuery.parse(request.query);
      // Die letzte nach id, nicht nach created_at: Zeitstempel können gleich sein.
      const rows = db
        .prepare(
          `SELECT project_id AS projectId, question_id AS questionId, phase, answer, correct,
                  created_at AS createdAt
           FROM quiz_attempts
           WHERE id IN (
             SELECT MAX(id) FROM quiz_attempts WHERE project_id = ? GROUP BY question_id, phase
           )
           ORDER BY id`,
        )
        .all(projectId) as (Omit<QuizAttempt, 'correct'> & { correct: number })[];
      return rows.map((r) => ({ ...r, correct: r.correct === 1 }));
    });
  };
}
