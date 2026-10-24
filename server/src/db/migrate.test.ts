import { describe, expect, it } from 'vitest';
import { openDatabase } from './connection.js';
import { migrate } from './migrate.js';

describe('migrate', () => {
  it('legt alle Tabellen an und setzt Version 1', () => {
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
      value: '1',
    });
  });

  it('ist wiederholbar', () => {
    const db = openDatabase(':memory:');
    migrate(db);
    expect(() => migrate(db)).not.toThrow();
  });
});
