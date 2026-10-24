import { TRACKS, type Card, type ReviewItem, type TrackId } from '@hub/shared';

export interface ResolvedReviewItem {
  cardId: string;
  projectId: string;
  front: string;
  back: string;
  projectTitle: string;
  track: TrackId;
}

export type ReviewProjectLookup = (projectId: string) => {
  title: string;
  track: TrackId;
  cards: Card[];
} | undefined;

/**
 * Macht aus den fälligen Items anzeigbare Karten. Eigene Karten bringen ihren
 * Text mit, Projektkarten werden im Inhalt des Projekts gesucht. Items ohne
 * Treffer (gestrichene Karte, Projekt nicht registriert) fallen weg.
 */
export function resolveReviewItems(items: ReviewItem[], lookup: ReviewProjectLookup): ResolvedReviewItem[] {
  const result: ResolvedReviewItem[] = [];
  for (const item of items) {
    const project = lookup(item.projectId);
    if (!project) continue;
    if (item.cardId.startsWith('own-')) {
      if (item.front === undefined || item.back === undefined) continue;
      result.push({
        cardId: item.cardId,
        projectId: item.projectId,
        front: item.front,
        back: item.back,
        projectTitle: project.title,
        track: project.track,
      });
      continue;
    }
    const card = project.cards.find((c) => c.id === item.cardId);
    if (!card) continue;
    result.push({
      cardId: item.cardId,
      projectId: item.projectId,
      front: card.front,
      back: card.back,
      projectTitle: project.title,
      track: project.track,
    });
  }
  return result;
}

/** Die Runde startet erst mit Daten, die nach dem Einhängen geladen wurden. */
export function canFreezeRound(query: { data: unknown; isFetchedAfterMount: boolean; isError: boolean }): boolean {
  // Scheitert das frische Laden, bleibt die Runde offen und zeigt den Fehler statt des Cache-Stands.
  return query.data !== undefined && query.isFetchedAfterMount && !query.isError;
}

export type ReviewScope =
  | { kind: 'all' }
  | { kind: 'track'; track: TrackId }
  | { kind: 'project'; projectId: string };

/** Liest den Bereich der Lernrunde aus der Adresse. Das Projekt hat Vorrang vor dem Thema. */
export function parseReviewScope(params: URLSearchParams): ReviewScope {
  const projectId = params.get('projekt');
  if (projectId) return { kind: 'project', projectId };
  const track = TRACKS.find((t) => t.id === params.get('thema'));
  if (track) return { kind: 'track', track: track.id };
  return { kind: 'all' };
}

export function reviewScopeHref(scope: ReviewScope): string {
  const params = new URLSearchParams();
  if (scope.kind === 'track') params.set('thema', scope.track);
  if (scope.kind === 'project') params.set('projekt', scope.projectId);
  const query = params.toString();
  return query ? `/lernrunde?${query}` : '/lernrunde';
}

export function filterByScope(items: ResolvedReviewItem[], scope: ReviewScope): ResolvedReviewItem[] {
  if (scope.kind === 'track') return items.filter((i) => i.track === scope.track);
  if (scope.kind === 'project') return items.filter((i) => i.projectId === scope.projectId);
  return items;
}

export interface TopicGroup {
  track: TrackId;
  label: string;
  count: number;
  projects: { projectId: string; title: string; count: number }[];
}

const trackIndex = (track: TrackId) => TRACKS.findIndex((t) => t.id === track);
const byTitle = (a: string, b: string) => a.localeCompare(b, 'de');

/** Fällige Karten je Thema (in TRACKS-Reihenfolge), darin je Projekt nach Titel. Leere Themen fehlen. */
export function groupByTopic(items: ResolvedReviewItem[]): TopicGroup[] {
  const groups: TopicGroup[] = [];
  for (const track of TRACKS) {
    const projects = new Map<string, { projectId: string; title: string; count: number }>();
    let count = 0;
    for (const item of items) {
      if (item.track !== track.id) continue;
      count += 1;
      const entry = projects.get(item.projectId);
      if (entry) entry.count += 1;
      else projects.set(item.projectId, { projectId: item.projectId, title: item.projectTitle, count: 1 });
    }
    if (count === 0) continue;
    groups.push({
      track: track.id,
      label: track.label,
      count,
      projects: [...projects.values()].sort((a, b) => byTitle(a.title, b.title)),
    });
  }
  return groups;
}

/**
 * Sortiert nach Thema, dann Projekttitel. Die Karten eines Projekts bleiben
 * zusammen und in Eingabereihenfolge (auch bei gleichem Titel zweier Projekte).
 */
export function orderByTopic(items: ResolvedReviewItem[]): ResolvedReviewItem[] {
  const firstSeen = new Map<string, number>();
  for (const item of items) if (!firstSeen.has(item.projectId)) firstSeen.set(item.projectId, firstSeen.size);
  return items
    .map((item, index) => ({ item, index }))
    .sort(
      (a, b) =>
        trackIndex(a.item.track) - trackIndex(b.item.track) ||
        byTitle(a.item.projectTitle, b.item.projectTitle) ||
        (firstSeen.get(a.item.projectId) ?? 0) - (firstSeen.get(b.item.projectId) ?? 0) ||
        a.index - b.index,
    )
    .map((e) => e.item);
}

/** Gibt es die Karte noch? Eigene Karten zählen, wenn das Projekt bekannt ist. */
export function isKnownCard(item: { cardId: string; projectId: string }, lookup: ReviewProjectLookup): boolean {
  const project = lookup(item.projectId);
  if (!project) return false;
  return item.cardId.startsWith('own-') || project.cards.some((c) => c.id === item.cardId);
}
