import type { StateResponse } from '@hub/shared';
import type Database from 'better-sqlite3';
import type { FastifyPluginAsync } from 'fastify';

export function stateRoutes(db: Database.Database, now: () => Date): FastifyPluginAsync {
  return async (app) => {
    app.get('/api/state', async (): Promise<StateResponse> => {
      const progress = db
        .prepare(
          `SELECT project_id AS projectId, started_at AS startedAt, last_opened_at AS lastOpenedAt
           FROM project_progress ORDER BY project_id`,
        )
        .all() as StateResponse['progress'];
      const answeredReflections = db
        .prepare(
          `SELECT question_id AS questionId, project_id AS projectId
           FROM reflection_answers ORDER BY question_id`,
        )
        .all() as StateResponse['answeredReflections'];
      const { count } = db
        .prepare('SELECT COUNT(*) AS count FROM card_state WHERE due_at <= ?')
        .get(now().toISOString()) as { count: number };
      return { progress, answeredReflections, dueCount: count };
    });
  };
}
