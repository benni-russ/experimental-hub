// Vor allen Datumsaufrufen: Tagesgrenzen und Sommerzeit sollen in Berlin geprüft werden.
process.env.TZ = 'Europe/Berlin';

import { describe, expect, it } from 'vitest';
import type { ContentMeta, StateResponse, UpcomingItem } from '@hub/shared';
import { dueForecast, trackProgress } from './todayStats';

describe('Testumgebung', () => {
  it('läuft in Europe/Berlin mit Sommerzeitwechsel am 25.10.2026', () => {
    expect(new Date(2026, 9, 24, 12).getTimezoneOffset()).toBe(-120);
    expect(new Date(2026, 9, 25, 12).getTimezoneOffset()).toBe(-60);
  });
});

const meta = (id: string, track: ContentMeta['track'], kind: ContentMeta['kind'] = 'project'): ContentMeta => ({
  id,
  slug: id,
  title: id,
  track,
  kind,
  question: '?',
  buildsOn: [],
  leadsTo: [],
  intro: { text: '' },
  quiz: [],
  reflection: [{ id: `${id}-r1`, prompt: '?' }],
  cards: [],
});

describe('trackProgress', () => {
  const metas = [
    meta('a1', 'web'),
    meta('a2', 'web'),
    meta('a3', 'web'),
    meta('b1', 'experimentation'),
    meta('b2', 'experimentation'),
    meta('u1', 'experimentation', 'unit'),
  ];
  const state: StateResponse = {
    progress: [
      { projectId: 'a1' },
      { projectId: 'a2' },
      { projectId: 'b1' },
      { projectId: 'u1' },
    ] as StateResponse['progress'],
    answeredReflections: [{ projectId: 'a1', questionId: 'a1-r1' }] as StateResponse['answeredReflections'],
    dueCount: 0,
  };

  it('zählt Zustände je Track, ignoriert Mini-Einheiten und hält die TRACKS-Reihenfolge', () => {
    expect(trackProgress(metas, state)).toEqual([
      { track: 'experimentation', label: 'Experimentation & Data', done: 0, started: 1, open: 1, total: 2 },
      { track: 'web', label: 'Web & APIs', done: 1, started: 1, open: 1, total: 3 },
    ]);
  });

  it('lässt Tracks ohne Projekte weg', () => {
    expect(trackProgress([], state)).toEqual([]);
    expect(trackProgress([meta('u1', 'ai', 'unit')], state)).toEqual([]);
  });
});

describe('dueForecast', () => {
  const now = new Date(2026, 9, 24, 15, 0);
  const at = (dueAt: Date, cardId = 'c'): UpcomingItem => ({
    cardId,
    projectId: '001',
    dueAt: dueAt.toISOString(),
  });
  const all = (_item: UpcomingItem) => true;
  const counts = (items: UpcomingItem[], isKnown = all) => dueForecast(items, isKnown, now).map((d) => d.count);

  it('liefert bei leerer Liste sieben Tage mit 0', () => {
    expect(counts([])).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it('zählt für heute nur, was jetzt fällig ist, wie Glocke und Lernrunde', () => {
    const items = [at(new Date(2026, 9, 23, 8, 0)), at(now), at(new Date(2026, 9, 24, 15, 1)), at(new Date(2026, 9, 24, 23, 59))];
    expect(counts(items)).toEqual([2, 0, 0, 0, 0, 0, 0]);
  });

  it('ordnet 00:00 Uhr morgen dem Index 1 zu', () => {
    expect(counts([at(new Date(2026, 9, 25, 0, 0))])).toEqual([0, 1, 0, 0, 0, 0, 0]);
  });

  it('lässt Karten ab dem Tag nach dem letzten Tag weg', () => {
    expect(counts([at(new Date(2026, 9, 31, 0, 0))])).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(counts([at(new Date(2026, 9, 30, 23, 59))])).toEqual([0, 0, 0, 0, 0, 0, 1]);
  });

  it('zählt keine Karten, die isKnown ablehnt', () => {
    const items = [at(new Date(2026, 9, 24, 10, 0), 'x'), at(new Date(2026, 9, 24, 11, 0), 'y')];
    expect(counts(items, (i) => i.cardId !== 'x')).toEqual([1, 0, 0, 0, 0, 0, 0]);
  });

  it('beschriftet heute mit „Heute“ und die übrigen Tage mit Wochentag ohne Punkt', () => {
    const labels = dueForecast([], all, now).map((d) => d.label);
    expect(labels[0]).toBe('Heute');
    expect(labels[1]).toBe('So 25.');
    expect(labels[2]).toBe('Mo 26.');
  });

  it('hält die Tagesgrenze bei 00:00 Uhr lokal über den Sommerzeitwechsel', () => {
    // 25.10. hat 25 Stunden; mit +24 h läge die Grenze zum 26.10. schon um 23:00 Uhr.
    const items = [at(new Date(2026, 9, 25, 23, 30)), at(new Date(2026, 9, 26, 0, 0))];
    expect(counts(items)).toEqual([0, 1, 1, 0, 0, 0, 0]);
    const dates = dueForecast([], all, now).map((d) => d.date);
    expect(dates.every((d) => d.getHours() === 0 && d.getMinutes() === 0)).toBe(true);
  });

  it('liefert mindestens einen Tag', () => {
    expect(dueForecast([], all, now, 0)).toHaveLength(1);
    expect(dueForecast([at(new Date(2026, 9, 23))], all, now, -3).map((d) => d.count)).toEqual([1]);
  });

  it('unterstützt eine andere Tageszahl', () => {
    expect(dueForecast([], all, now, 3)).toHaveLength(3);
  });
});
