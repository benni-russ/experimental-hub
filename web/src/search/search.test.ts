import { describe, expect, it } from 'vitest';
import { excerpt, matchesAll, searchHub, searchPath, searchTerms, type SearchSources } from './search';

describe('searchTerms', () => {
  it('trimmt, trennt an Leerraum und ignoriert Groß-/Kleinschreibung', () => {
    expect(searchTerms('  Minimum   EFFEKT ')).toEqual(['minimum', 'effekt']);
  });
  it('leerer Begriff ergibt keine Wörter', () => {
    expect(searchTerms('')).toEqual([]);
    expect(searchTerms('   ')).toEqual([]);
  });
});

describe('matchesAll', () => {
  it('alle Wörter müssen vorkommen, auch über mehrere Felder', () => {
    expect(matchesAll(['A/B-Test', 'Kleiner Unterschied'], ['test', 'unterschied'])).toBe(true);
    expect(matchesAll(['A/B-Test', 'Kleiner Unterschied'], ['test', 'power'])).toBe(false);
  });
  it('ohne Wörter passt nichts', () => {
    expect(matchesAll(['egal'], [])).toBe(false);
  });
});

describe('excerpt', () => {
  it('kurzer Text bleibt ganz, Zeilenumbrüche werden zu Leerzeichen', () => {
    expect(excerpt('Eins\nzwei  drei', ['zwei'])).toBe('Eins zwei drei');
  });
  it('langer Text: Ausschnitt um die Fundstelle mit Auslassungszeichen', () => {
    const text = `${'vorne '.repeat(20)}Fundstelle ${'hinten '.repeat(20)}`.trim();
    const result = excerpt(text, ['fundstelle'], 20);
    expect(result.startsWith('…')).toBe(true);
    expect(result.endsWith('…')).toBe(true);
    expect(result).toContain('Fundstelle');
    expect(result.length).toBeLessThan(60);
  });
  it('schneidet keine Wörter an', () => {
    const text = `${'Wortanfang '.repeat(10)}Ziel ${'Wortende '.repeat(10)}`.trim();
    const words = excerpt(text, ['ziel'], 15).replace(/…/g, '').trim().split(' ');
    for (const w of words) expect(['Wortanfang', 'Ziel', 'Wortende']).toContain(w);
  });
  it('ohne Fundstelle: Anfang des Texts', () => {
    const text = 'a '.repeat(100).trim();
    const result = excerpt(text, ['x'], 10);
    expect(result.startsWith('a')).toBe(true);
    expect(result.endsWith('…')).toBe(true);
  });
});

describe('searchPath', () => {
  it('kodiert den Begriff', () => {
    expect(searchPath('a b&c')).toBe('/suche?q=a+b%26c');
    expect(searchPath('')).toBe('/suche');
  });
});

const sources: SearchSources = {
  projects: [
    {
      id: '001',
      title: 'Kleinster erkennbarer Unterschied (MDE)',
      question: 'Wie viele Menschen braucht ein A/B-Test?',
      trackLabel: 'Experimentation & Data',
      cards: [
        { id: '001-card-01', front: 'Was ist die Power?', back: 'Die Chance, einen echten Unterschied zu sehen.' },
        { id: '001-card-02', front: 'Was ist Alpha?', back: 'Das Signifikanzniveau.' },
      ],
    },
    {
      id: '002',
      title: 'Caching im Web',
      question: 'Wann lädt der Browser neu?',
      trackLabel: 'Web & APIs',
      cards: [],
    },
  ],
  ownCards: [{ id: '7', projectId: '001', front: 'Eigene Frage zur Power', back: 'Eigene Antwort' }],
  notes: [{ projectId: '002', note: 'Cache-Control merken', postIdea: 'Post über Power-Analyse', updatedAt: 't' }],
  reflections: [{ projectId: '001', questionId: '001-refl-01', answer: 'Wie groß die Stichprobe sein muss', updatedAt: 't' }],
};

describe('searchHub', () => {
  it('leerer Begriff liefert nichts', () => {
    const r = searchHub('  ', sources);
    expect(r.total).toBe(0);
    expect(r.experiments).toEqual([]);
  });

  it('findet Versuche über Titel, Leitfrage und Track-Label', () => {
    expect(searchHub('mde', sources).experiments.map((e) => e.projectId)).toEqual(['001']);
    expect(searchHub('browser', sources).experiments.map((e) => e.projectId)).toEqual(['002']);
    expect(searchHub('web apis', sources).experiments.map((e) => e.projectId)).toEqual(['002']);
    // Wörter aus Titel und Leitfrage zusammen
    expect(searchHub('unterschied a/b-test', sources).experiments).toHaveLength(1);
  });

  it('findet Inhaltskarten und eigene Karten', () => {
    const r = searchHub('POWER', sources);
    expect(r.cards.map((c) => [c.projectId, c.own])).toEqual([
      ['001', false],
      ['001', true],
    ]);
    expect(r.cards[0]?.projectTitle).toBe('Kleinster erkennbarer Unterschied (MDE)');
  });

  it('findet Notizen, Post-Ideen und Reflexionen', () => {
    const r = searchHub('power', sources);
    expect(r.notes.map((n) => [n.projectId, n.label])).toEqual([['002', 'Post-Idee']]);
    expect(searchHub('stichprobe', sources).notes.map((n) => n.label)).toEqual(['Reflexion']);
    expect(searchHub('cache-control', sources).notes[0]?.projectTitle).toBe('Caching im Web');
  });

  it('zählt alle Treffer zusammen', () => {
    const r = searchHub('power', sources);
    expect(r.total).toBe(r.experiments.length + r.cards.length + r.notes.length);
    expect(r.total).toBe(3);
  });

  it('unbekanntes Projekt: ID als Titel', () => {
    const r = searchHub('verwaist', { ...sources, notes: [{ projectId: '099', note: 'verwaist', postIdea: '', updatedAt: 't' }] });
    expect(r.notes[0]?.projectTitle).toBe('099');
  });
});
