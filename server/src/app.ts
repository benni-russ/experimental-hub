import staticPlugin from '@fastify/static';
import type Database from 'better-sqlite3';
import Fastify, { type FastifyError, type FastifyInstance } from 'fastify';
import { existsSync } from 'node:fs';
import { ZodError } from 'zod';
import { ApiError } from './lib/errors.js';
import { ownCardsRoutes } from './routes/ownCards.js';
import { projectsRoutes } from './routes/projects.js';
import { quizRoutes } from './routes/quiz.js';
import { reflectionsRoutes } from './routes/reflections.js';
import { reviewRoutes } from './routes/review.js';
import { stateRoutes } from './routes/state.js';

export interface BuildAppOptions {
  /** Verzeichnis der gebauten Oberfläche; fehlt es, wird nur die API bedient. */
  webDist?: string;
  /** Uhr für alle Zeitstempel und Fälligkeitsvergleiche (Tests). */
  now?: () => Date;
  logger?: boolean;
}

export function buildApp(db: Database.Database, opts: BuildAppOptions = {}): FastifyInstance {
  const now = opts.now ?? (() => new Date());
  const app = Fastify({ logger: opts.logger ?? false });

  app.setErrorHandler((error: FastifyError | ApiError | ZodError, request, reply) => {
    if (error instanceof ApiError) {
      reply.code(error.statusCode).send({ error: { code: error.code, message: error.message } });
      return;
    }
    if (error instanceof ZodError) {
      reply.code(400).send({
        error: {
          code: 'INVALID_INPUT',
          message: error.issues.map((issue) => issue.message).join('; '),
        },
      });
      return;
    }
    const status = (error as FastifyError).statusCode;
    // Fehler von Fastify selbst (kaputtes JSON, zu großer Body): 4xx durchreichen.
    if (status && status >= 400 && status < 500) {
      reply.code(status).send({ error: { code: 'INVALID_INPUT', message: 'Die Anfrage ist ungültig.' } });
      return;
    }
    // Kein Stacktrace und keine interne Meldung in der Antwort.
    request.log.error(error);
    reply.code(500).send({ error: { code: 'INTERNAL', message: 'Unerwarteter Fehler.' } });
  });

  app.get('/api/health', async () => ({ status: 'ok' as const }));
  app.register(stateRoutes(db, now));
  app.register(projectsRoutes(db, now));
  app.register(reflectionsRoutes(db, now));
  app.register(quizRoutes(db, now));
  app.register(ownCardsRoutes(db, now));
  app.register(reviewRoutes(db, now));

  const serveWeb = opts.webDist !== undefined && existsSync(opts.webDist);
  if (serveWeb) {
    app.register(staticPlugin, { root: opts.webDist as string });
  }

  // Alles, was keine API-Route ist, bekommt die index.html -- der Router im
  // Browser übernimmt von dort.
  //
  // Ausgenommen sind die gebauten Dateien unter /assets/. Nach einem Update
  // tragen sie neue Namen im Dateinamen-Hash; ein Browser, der die alte
  // Seite noch offen hat, fragt die alten Namen nach. Bekäme er dafür die
  // index.html mit Status 200, würde er sie als JavaScript auszuwerten
  // versuchen -- der Fehler heißt dann "Failed to fetch dynamically
  // imported module" und sagt niemandem, dass eigentlich nur die Seite neu
  // geladen werden muss. Mit einem ehrlichen 404 steht das in der Konsole,
  // wo es hingehört.
  app.setNotFoundHandler((request, reply) => {
    if (request.url.startsWith('/api/') || !serveWeb) {
      reply.code(404).send({ error: { code: 'NOT_FOUND', message: 'Unbekannte Route.' } });
      return;
    }
    if (request.url.startsWith('/assets/')) {
      reply.code(404).type('text/plain; charset=utf-8').send('Diese Datei gibt es nicht (mehr). Seite neu laden.');
      return;
    }
    reply.sendFile('index.html');
  });

  return app;
}
