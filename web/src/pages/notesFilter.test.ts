import { describe, expect, it } from 'vitest';
import type { ProjectNotes, ReflectionAnswer } from '@hub/shared';
import { filterNotes, type ProjectLookup } from './notesFilter';

const lookup: ProjectLookup = (id) =>
  id === 'A-001'
    ? { title: 'Stichprobengröße', reflection: [{ id: 'A-001-refl-01', prompt: 'Was war überraschend?' }] }
    : undefined;

const note = (projectId: string, n: string, postIdea = ''): ProjectNotes => ({
  projectId,
  note: n,
  postIdea,
  updatedAt: '2026-10-24T10:00:00Z',
});
const answer = (projectId: string, questionId: string, a: string): ReflectionAnswer => ({
  projectId,
  questionId,
  answer: a,
  updatedAt: '2026-10-24T10:00:00Z',
});

describe('filterNotes', () => {
  it('liefert ohne Suche alle Projekte mit Inhalt', () => {
    const r = filterNotes([note('A-001', 'Hallo')], [answer('A-001', 'A-001-refl-01', 'Viel')], lookup, '', false);
    expect(r).toHaveLength(1);
    expect(r[0]?.title).toBe('Stichprobengröße');
    expect(r[0]?.answers).toEqual([{ question: 'Was war überraschend?', answer: 'Viel' }]);
  });

  it('ignoriert Groß- und Kleinschreibung', () => {
    const notes = [note('A-001', 'Das Konfidenzintervall ist breit')];
    expect(filterNotes(notes, [], lookup, 'KONFIDENZ', false)).toHaveLength(1);
    expect(filterNotes(notes, [], lookup, 'stichprobengröße', false)).toHaveLength(1);
  });

  it('findet Wörter in Reflexionsantworten', () => {
    const r = filterNotes([], [answer('A-001', 'A-001-refl-01', 'Die Varianz wirkte klein')], lookup, 'varianz', false);
    expect(r).toHaveLength(1);
  });

  it('zeigt im Post-Ideen-Modus nur Post-Ideen', () => {
    const notes = [note('A-001', 'nur Notiz'), note('A-002.1', 'Notiz', 'Idee')];
    const r = filterNotes(notes, [answer('A-002.1', 'x', 'Antwort')], lookup, '', true);
    expect(r.map((g) => g.projectId)).toEqual(['A-002.1']);
    expect(r[0]?.note).toBe('');
    expect(r[0]?.answers).toEqual([]);
    expect(r[0]?.postIdea).toBe('Idee');
  });

  it('sucht im Post-Ideen-Modus nicht in ausgeblendeten Feldern', () => {
    const notes = [note('A-002.1', 'geheimwort', 'Idee')];
    expect(filterNotes(notes, [], lookup, 'geheimwort', true)).toHaveLength(0);
  });

  it('lässt leere und nur aus Leerzeichen bestehende Projekte weg', () => {
    const r = filterNotes([note('A-001', '   ', ' '), note('A-002.1', '')], [answer('A-002.1', 'q', '  ')], lookup, '', false);
    expect(r).toEqual([]);
  });

  it('nutzt die Projekt-ID, wenn das Projekt unbekannt ist', () => {
    const r = filterNotes([note('999', 'x')], [answer('999', 'q', 'a')], lookup, '', false);
    expect(r[0]?.title).toBe('999');
    expect(r[0]?.answers[0]?.question).toBe('q');
  });

  it('ignoriert Leerzeichen um die Suche', () => {
    expect(filterNotes([note('A-001', 'abc')], [], lookup, '  abc ', false)).toHaveLength(1);
  });
});
