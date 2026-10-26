import { describe, expect, it } from 'vitest';
import type { ReviewItem } from '@hub/shared';
import {
  canFreezeRound,
  filterByScope,
  groupByTopic,
  isKnownCard,
  orderByTopic,
  parseReviewScope,
  resolveReviewItems,
  reviewScopeHref,
  type ResolvedReviewItem,
  type ReviewProjectLookup,
  type ReviewScope,
} from './reviewItems';

const lookup: ReviewProjectLookup = (id) =>
  id === 'A-001'
    ? {
        title: 'Stichprobengröße',
        track: 'experimentation',
        cards: [{ id: 'A-001-card-01', front: 'Frage?', back: 'Antwort.' }],
      }
    : undefined;

const item = (cardId: string, projectId: string, extra: Partial<ReviewItem> = {}): ReviewItem => ({
  cardId,
  projectId,
  box: 1,
  dueAt: '2026-10-24T00:00:00.000Z',
  ...extra,
});

describe('resolveReviewItems', () => {
  it('nimmt Text und Titel einer eigenen Karte aus dem Item', () => {
    const [r] = resolveReviewItems([item('own-7', 'A-001', { front: 'V', back: 'R' })], lookup);
    expect(r).toEqual({
      cardId: 'own-7',
      projectId: 'A-001',
      front: 'V',
      back: 'R',
      projectTitle: 'Stichprobengröße',
      track: 'experimentation',
    });
  });

  it('findet eine Projektkarte im Inhalt des Projekts', () => {
    const [r] = resolveReviewItems([item('A-001-card-01', 'A-001')], lookup);
    expect(r).toEqual({
      cardId: 'A-001-card-01',
      projectId: 'A-001',
      front: 'Frage?',
      back: 'Antwort.',
      projectTitle: 'Stichprobengröße',
      track: 'experimentation',
    });
  });

  it('übernimmt den Track aus dem Lookup, auch für eigene Karten', () => {
    const [r] = resolveReviewItems([item('own-1', 'A-001', { front: 'a', back: 'b' })], lookup);
    expect(r?.track).toBe('experimentation');
  });

  it('überspringt eine gestrichene Karte', () => {
    expect(resolveReviewItems([item('A-001-card-99', 'A-001')], lookup)).toEqual([]);
  });

  it('überspringt Items eines nicht registrierten Projekts', () => {
    expect(resolveReviewItems([item('999-card-01', '999')], lookup)).toEqual([]);
  });

  it('behält die Reihenfolge der übrigen Items', () => {
    const out = resolveReviewItems(
      [item('A-001-card-01', 'A-001'), item('x', '999'), item('own-1', 'A-001', { front: 'a', back: 'b' })],
      lookup,
    );
    expect(out.map((r) => r.cardId)).toEqual(['A-001-card-01', 'own-1']);
  });

  it('überspringt eine eigene Karte ohne Text nicht durch Rückfall auf Projektkarten', () => {
    expect(resolveReviewItems([item('own-2', 'A-001')], lookup)).toEqual([]);
  });
});

const resolved = (
  cardId: string,
  projectId: string,
  projectTitle: string,
  track: ResolvedReviewItem['track'],
): ResolvedReviewItem => ({ cardId, projectId, front: 'f', back: 'b', projectTitle, track });

const sample: ResolvedReviewItem[] = [
  resolved('a1', 'A-003', 'Zebra-API', 'web'),
  resolved('b1', 'A-001', 'Stichprobe', 'experimentation'),
  resolved('a2', 'A-003', 'Zebra-API', 'web'),
  resolved('c1', '020', 'Äpfel-API', 'web'),
  resolved('d1', 'A-002.1', 'Stichprobe', 'ai'),
  resolved('d2', '003', 'Stichprobe', 'web'),
];

describe('parseReviewScope', () => {
  const parse = (query: string) => parseReviewScope(new URLSearchParams(query));

  it('liest ein Projekt', () => {
    expect(parse('?projekt=A-003')).toEqual({ kind: 'project', projectId: 'A-003' });
  });

  it('liest ein Thema', () => {
    expect(parse('?thema=web')).toEqual({ kind: 'track', track: 'web' });
  });

  it('gibt dem Projekt Vorrang vor dem Thema', () => {
    expect(parse('?projekt=A-003&thema=web')).toEqual({ kind: 'project', projectId: 'A-003' });
  });

  it('fällt bei Unbekanntem oder Leerem auf alles zurück', () => {
    expect(parse('?thema=quatsch')).toEqual({ kind: 'all' });
    expect(parse('?projekt=')).toEqual({ kind: 'all' });
    expect(parse('')).toEqual({ kind: 'all' });
  });
});

describe('reviewScopeHref', () => {
  it('baut die Adressen', () => {
    expect(reviewScopeHref({ kind: 'all' })).toBe('/lernrunde');
    expect(reviewScopeHref({ kind: 'track', track: 'experimentation' })).toBe('/lernrunde?thema=experimentation');
    expect(reviewScopeHref({ kind: 'project', projectId: 'A-003' })).toBe('/lernrunde?projekt=A-003');
  });

  it('kodiert Leerzeichen und &', () => {
    const href = reviewScopeHref({ kind: 'project', projectId: 'a b&c' });
    expect(href).not.toContain(' ');
    expect(href.split('?')[1]).not.toContain('&');
  });

  it('ergibt im Rundlauf denselben Bereich', () => {
    const scopes: ReviewScope[] = [
      { kind: 'all' },
      { kind: 'track', track: 'ai' },
      { kind: 'project', projectId: 'a b&c' },
    ];
    for (const scope of scopes) {
      expect(parseReviewScope(new URL('http://x' + reviewScopeHref(scope)).searchParams)).toEqual(scope);
    }
  });
});

describe('filterByScope', () => {
  it('liefert bei all alles', () => {
    expect(filterByScope(sample, { kind: 'all' })).toEqual(sample);
  });

  it('filtert nach Track', () => {
    expect(filterByScope(sample, { kind: 'track', track: 'ai' }).map((i) => i.cardId)).toEqual(['d1']);
  });

  it('filtert nach Projekt', () => {
    expect(filterByScope(sample, { kind: 'project', projectId: 'A-003' }).map((i) => i.cardId)).toEqual(['a1', 'a2']);
  });

  it('liefert bei unbekanntem Projekt nichts', () => {
    expect(filterByScope(sample, { kind: 'project', projectId: '999' })).toEqual([]);
  });
});

describe('groupByTopic', () => {
  const groups = groupByTopic(sample);

  it('ordnet Tracks wie TRACKS und lässt leere weg', () => {
    expect(groups.map((g) => g.track)).toEqual(['experimentation', 'web', 'ai']);
  });

  it('nimmt das Label aus TRACKS und zählt richtig', () => {
    expect(groups.map((g) => [g.label, g.count])).toEqual([
      ['Experimentation & Data', 1],
      ['Web & APIs', 4],
      ['AI & Automation', 1],
    ]);
  });

  it('sortiert Projekte nach Titel mit deutscher Sortierung', () => {
    const web = groups.find((g) => g.track === 'web');
    expect(web?.projects).toEqual([
      { projectId: '020', title: 'Äpfel-API', count: 1 },
      { projectId: '003', title: 'Stichprobe', count: 1 },
      { projectId: 'A-003', title: 'Zebra-API', count: 2 },
    ]);
  });
});

describe('orderByTopic', () => {
  it('sortiert nach Track, dann Titel', () => {
    expect(orderByTopic(sample).map((i) => i.cardId)).toEqual(['b1', 'c1', 'd2', 'a1', 'a2', 'd1']);
  });

  it('hält die Eingabereihenfolge je Projekt, auch bei gleichem Titel zweier Projekte', () => {
    const items = [
      resolved('x1', 'A-002.1', 'Gleich', 'web'),
      resolved('y1', 'A-001', 'Gleich', 'web'),
      resolved('x2', 'A-002.1', 'Gleich', 'web'),
      resolved('y2', 'A-001', 'Gleich', 'web'),
      resolved('e1', '005', 'Zeta', 'experimentation'),
    ];
    expect(orderByTopic(items).map((i) => i.cardId)).toEqual(['e1', 'x1', 'x2', 'y1', 'y2']);
  });
});

describe('isKnownCard', () => {
  it('kennt Projektkarte und eigene Karte', () => {
    expect(isKnownCard({ cardId: 'A-001-card-01', projectId: 'A-001' }, lookup)).toBe(true);
    expect(isKnownCard({ cardId: 'own-5', projectId: 'A-001' }, lookup)).toBe(true);
  });

  it('kennt unbekanntes Projekt und gestrichene Karte nicht', () => {
    expect(isKnownCard({ cardId: 'own-5', projectId: '999' }, lookup)).toBe(false);
    expect(isKnownCard({ cardId: 'A-001-card-99', projectId: 'A-001' }, lookup)).toBe(false);
  });
});

describe('canFreezeRound', () => {
  it('wartet auf frische Daten, wenn nur der Cache-Stand vorliegt', () => {
    expect(canFreezeRound({ data: [], isFetchedAfterMount: false, isError: false })).toBe(false);
  });

  it('startet mit Daten, die nach dem Einhängen geladen wurden', () => {
    expect(canFreezeRound({ data: [], isFetchedAfterMount: true, isError: false })).toBe(true);
  });

  it('friert keinen Cache-Stand ein, wenn das frische Laden scheitert', () => {
    expect(canFreezeRound({ data: [], isFetchedAfterMount: true, isError: true })).toBe(false);
  });

  it('startet nicht ohne Daten', () => {
    expect(canFreezeRound({ data: undefined, isFetchedAfterMount: true, isError: false })).toBe(false);
  });
});
