import { describe, expect, it } from 'vitest';
import { openDatabase } from './connection.js';
import { migrate, migrateTo } from './migrate.js';

describe('migrate', () => {
  it('legt alle Tabellen an und setzt die letzte Version', () => {
    const db = openDatabase(':memory:');
    migrate(db);
    const tables = db
      .prepare(`SELECT name FROM sqlite_master WHERE type='table'`)
      .all()
      .map((r) => (r as { name: string }).name);
    expect(tables).toEqual(
      expect.arrayContaining([
        'project_progress',
        'notes',
        'reflection_answers',
        'quiz_attempts',
        'own_cards',
        'card_state',
      ]),
    );
    expect(db.prepare(`SELECT value FROM settings WHERE key='schema_version'`).get()).toEqual({
      value: '2',
    });
  });

  it('ist wiederholbar', () => {
    const db = openDatabase(':memory:');
    migrate(db);
    expect(() => migrate(db)).not.toThrow();
  });

  it('stellt gespeicherte Lernstände auf die IDs je Track um', () => {
    const db = openDatabase(':memory:');
    migrateTo(db, 1);
    const t = '2026-01-01T00:00:00.000Z';
    db.exec(`
      INSERT INTO project_progress VALUES ('013', '${t}', '${t}'), ('000', '${t}', '${t}');
      INSERT INTO notes VALUES ('026', 'Notiz', '', '${t}');
      INSERT INTO reflection_answers VALUES ('002-refl-01', '002', 'Antwort', '${t}');
      INSERT INTO quiz_attempts (project_id, question_id, phase, answer, correct, created_at)
        VALUES ('031', '031-quiz-01', 'before', '5', 0, '${t}');
      INSERT INTO own_cards (id, project_id, front, back, created_at) VALUES (7, '004', 'F', 'B', '${t}');
      INSERT INTO card_state (card_id, project_id, box, due_at) VALUES
        ('001-card-02', '001', 3, '${t}'), ('own-7', '004', 1, '${t}');
    `);

    migrate(db);

    const all = (sql: string) => db.prepare(sql).all();
    expect(all('SELECT project_id FROM project_progress ORDER BY project_id')).toEqual([
      { project_id: '000' },
      { project_id: 'A-003' },
    ]);
    expect(all('SELECT project_id FROM notes')).toEqual([{ project_id: 'A-001.1' }]);
    expect(all('SELECT question_id, project_id FROM reflection_answers')).toEqual([
      { question_id: 'A-002.1-refl-01', project_id: 'A-002.1' },
    ]);
    expect(all('SELECT question_id, project_id FROM quiz_attempts')).toEqual([
      { question_id: 'A-002.3-quiz-01', project_id: 'A-002.3' },
    ]);
    expect(all('SELECT project_id FROM own_cards')).toEqual([{ project_id: 'A-004' }]);
    expect(all('SELECT card_id, project_id, box FROM card_state ORDER BY card_id')).toEqual([
      { card_id: 'A-001-card-02', project_id: 'A-001', box: 3 },
      { card_id: 'own-7', project_id: 'A-004', box: 1 },
    ]);
  });
});
