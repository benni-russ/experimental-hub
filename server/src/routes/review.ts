import { dueDate, nextBox, type ReviewItem, type ReviewResponse, type UpcomingItem } from '@hub/shared';
import type Database from 'better-sqlite3';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { notFound } from '../lib/errors.js';
import { idSchema } from '../lib/schemas.js';

const params = z.object({ cardId: idSchema });
const body = z.object({ known: z.boolean({ error: 'known muss wahr oder falsch sein.' }) });

export function reviewRoutes(db: Database.Database, now: () => Date): FastifyPluginAsync {
  return async (app) => {
    app.get('/api/review/due', async (): Promise<ReviewItem[]> => {
      const rows = db
        .prepare(
          `SELECT c.card_id AS cardId, c.project_id AS projectId, c.box, c.due_at AS dueAt,
                  o.front, o.back
           FROM card_state c
           LEFT JOIN own_cards o ON c.card_id = 'own-' || o.id
           WHERE c.due_at <= ?
           ORDER BY c.box ASC, c.due_at ASC, c.card_id ASC`,
        )
        .all(now().toISOString()) as (ReviewItem & { front: string | null; back: string | null })[];
      // front/back nur bei eigenen Karten; die Inhalte der Lernkarten liegen im Web-Client.
      return rows.map(({ front, back, ...item }) =>
        front !== null && back !== null ? { ...item, front, back } : item,
      );
    });

    // Vorschau: Überfälliges und alles, was in den nächsten sieben Tagen fällig wird (Grenze exklusiv).
    // Eigene Karten ohne Text (Zeile in card_state ohne own_cards) bleiben draußen.
    app.get('/api/review/upcoming', async (): Promise<UpcomingItem[]> => {
      const horizon = new Date(now().getTime() + 7 * 86_400_000).toISOString();
      return db
        .prepare(
          `SELECT c.card_id AS cardId, c.project_id AS projectId, c.due_at AS dueAt
           FROM card_state c LEFT JOIN own_cards o ON c.card_id = 'own-' || o.id
           WHERE c.due_at < ? AND (c.card_id NOT LIKE 'own-%' OR o.id IS NOT NULL)
           ORDER BY c.due_at ASC, c.card_id ASC`,
        )
        .all(horizon) as UpcomingItem[];
    });

    app.post('/api/review/:cardId', async (request): Promise<ReviewResponse> => {
      const { cardId } = params.parse(request.params);
      const { known } = body.parse(request.body);
      const current = db.prepare('SELECT box FROM card_state WHERE card_id = ?').get(cardId) as
        | { box: number }
        | undefined;
      if (!current) throw notFound('Die Karte gibt es nicht.');

      const reviewedAt = now();
      const box = nextBox(current.box, known);
      const dueAt = dueDate(box, reviewedAt).toISOString();
      db.prepare('UPDATE card_state SET box = ?, due_at = ?, last_reviewed_at = ? WHERE card_id = ?').run(
        box,
        dueAt,
        reviewedAt.toISOString(),
        cardId,
      );
      return { box, dueAt };
    });
  };
}
