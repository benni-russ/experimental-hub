import type Database from 'better-sqlite3';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), 'migrations');

/**
 * Der Stand steht in derselben Datenbank, die er beschreibt. Beim ersten Start
 * gibt es die settings-Tabelle noch nicht -- dann ist der Stand 0.
 */
function currentVersion(db: Database.Database): number {
  const tableExists = db
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'settings'`)
    .get();
  if (!tableExists) return 0;

  const row = db.prepare(`SELECT value FROM settings WHERE key = 'schema_version'`).get() as
    | { value: string }
    | undefined;
  return row ? Number(row.value) : 0;
}

function setVersion(db: Database.Database, version: number): void {
  db.prepare(
    `INSERT INTO settings (key, value) VALUES ('schema_version', ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
  ).run(String(version));
}

export function migrate(db: Database.Database): void {
  migrateTo(db, Infinity);
}

/** Bis einschließlich Version `target`; für Tests, die einen alten Stand brauchen. */
export function migrateTo(db: Database.Database, target: number): void {
  const current = currentVersion(db);
  const files = readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const version = Number(file.slice(0, 3));
    if (version <= current || version > target) continue;

    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    // Eine Transaktion je Datei: Bricht eine Migration in der Mitte ab, bleibt
    // keine halb umgebaute Datenbank zurück.
    db.transaction(() => {
      db.exec(sql);
      setVersion(db, version);
    })();
  }
}
