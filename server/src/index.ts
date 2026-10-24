import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildApp } from './app.js';
import { openDatabase } from './db/connection.js';
import { migrate } from './db/migrate.js';

if (existsSync('.env')) process.loadEnvFile('.env');

const db = openDatabase(process.env.DB_PATH ?? './data/hub.db');
migrate(db);

const webDist = join(dirname(fileURLToPath(import.meta.url)), '../../web/dist');
const app = buildApp(db, { webDist, logger: true });

// Sauber beenden: WAL in die Hauptdatei zurückschreiben, damit ein einfaches
// Kopieren der .db danach vollständig ist.
function shutdown(): void {
  app
    .close()
    .catch(() => undefined)
    .finally(() => {
      try {
        db.pragma('wal_checkpoint(TRUNCATE)');
        db.close();
      } finally {
        process.exit(0);
      }
    });
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Standardmäßig nur auf 127.0.0.1: Von außen kommt man über Caddy, und Caddy
// läuft auf demselben Rechner. Ein Dienst auf 0.0.0.0 wäre im ganzen Heimnetz
// erreichbar -- an Tailscale vorbei.
const port = Number(process.env.PORT ?? 4300);
const host = process.env.HOST ?? '127.0.0.1';
app.listen({ port, host }).catch((error) => {
  console.error(error);
  process.exit(1);
});
