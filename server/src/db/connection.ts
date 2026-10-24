import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Öffnet die Datenbank. ':memory:' ist erlaubt (Tests); das Elternverzeichnis
 * wird nur bei einem echten Dateipfad angelegt.
 *
 * Es gibt bewusst keine Modul-Singleton-Verbindung, und in keinem Modul gehört
 * ein `db.prepare(...)` auf oberste Ebene, auch nicht als vermeintliche
 * Optimierung. ESM wertet sämtliche Importe aus, bevor die erste Zeile von
 * index.ts an der Reihe ist; ein solches `prepare` trifft auf eine leere Datei
 * und beendet den Prozess mit "no such table". Auf einem Rechner mit
 * vorhandener Datenbank passiert das nie -- der Fehler zeigt sich nur beim
 * allerersten Start auf einem frischen Server. `prepare` gehört in die
 * Funktion, die es benutzt.
 */
export function openDatabase(path: string): Database.Database {
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true });
  }
  const db = new Database(path);
  // Ohne diese Zeile ignoriert SQLite alle REFERENCES-Angaben stillschweigend.
  db.pragma('foreign_keys = ON');
  // WAL: gleichzeitiges Lesen während eines Schreibvorgangs. Ein einfaches cp
  // der .db ist dadurch unvollständig; richtig ist "sqlite3 .backup".
  db.pragma('journal_mode = WAL');
  return db;
}
