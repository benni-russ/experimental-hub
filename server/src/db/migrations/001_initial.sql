-- Zeitstempel überall ISO-8601 UTC (new Date().toISOString()), damit
-- Textvergleich = Zeitvergleich.

CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE project_progress (
  project_id     TEXT PRIMARY KEY,
  started_at     TEXT NOT NULL,
  last_opened_at TEXT NOT NULL
);

CREATE TABLE notes (
  project_id TEXT PRIMARY KEY,
  note       TEXT NOT NULL DEFAULT '',
  post_idea  TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL
);

CREATE TABLE reflection_answers (
  question_id TEXT PRIMARY KEY,
  project_id  TEXT NOT NULL,
  answer      TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE quiz_attempts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id  TEXT NOT NULL,
  question_id TEXT NOT NULL,
  phase       TEXT NOT NULL CHECK (phase IN ('before', 'after')),
  answer      TEXT NOT NULL,
  correct     INTEGER NOT NULL,
  created_at  TEXT NOT NULL
);

CREATE TABLE own_cards (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  front      TEXT NOT NULL,
  back       TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE card_state (
  card_id          TEXT PRIMARY KEY,
  project_id       TEXT NOT NULL,
  box              INTEGER NOT NULL CHECK (box BETWEEN 1 AND 5),
  due_at           TEXT NOT NULL,
  last_reviewed_at TEXT
);

CREATE INDEX idx_card_state_due_at ON card_state (due_at);
