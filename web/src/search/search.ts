import type { Card, OwnCard, ProjectNotes, ReflectionAnswer } from '@hub/shared';

// Suche über Versuche, Karten und Notizen. Rein und ohne React, damit sie
// getestet werden kann; die Seite liefert die Quellen.

export interface SearchProject {
  id: string;
  title: string;
  question: string;
  trackLabel: string;
  cards: Card[];
}

export interface SearchSources {
  projects: SearchProject[];
  ownCards: OwnCard[];
  notes: ProjectNotes[];
  reflections: ReflectionAnswer[];
}

export interface ExperimentHit {
  projectId: string;
  title: string;
  question: string;
  trackLabel: string;
}

export interface CardHit {
  key: string;
  projectId: string;
  projectTitle: string;
  front: string;
  back: string;
  own: boolean;
}

export type NoteLabel = 'Notiz' | 'Post-Idee' | 'Reflexion';

export interface NoteHit {
  key: string;
  projectId: string;
  projectTitle: string;
  label: NoteLabel;
  excerpt: string;
}

export interface SearchResult {
  experiments: ExperimentHit[];
  cards: CardHit[];
  notes: NoteHit[];
  total: number;
}

/** Suchwörter: getrimmt, klein, an Leerraum getrennt. */
export function searchTerms(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

/** Jedes Wort muss in einem der Felder vorkommen. Ohne Wörter passt nichts. */
export function matchesAll(texts: readonly string[], terms: readonly string[]): boolean {
  if (terms.length === 0) return false;
  const haystack = texts.join('\n').toLowerCase();
  return terms.every((t) => haystack.includes(t));
}

/**
 * Ausschnitt um die erste Fundstelle, ohne Wörter anzuschneiden. Kurze Texte
 * bleiben ganz; ohne Fundstelle steht der Anfang da.
 */
export function excerpt(text: string, terms: readonly string[], radius = 60): string {
  const flat = text.replace(/\s+/g, ' ').trim();
  if (flat.length <= radius * 2) return flat;
  const lower = flat.toLowerCase();
  let hit = -1;
  let hitLength = 0;
  for (const t of terms) {
    const i = lower.indexOf(t);
    if (i !== -1 && (hit === -1 || i < hit)) {
      hit = i;
      hitLength = t.length;
    }
  }
  if (hit === -1) {
    hit = 0;
    hitLength = 0;
  }
  let start = Math.max(0, hit - radius);
  let end = Math.min(flat.length, hit + hitLength + radius);
  // Auf Wortgrenzen ziehen, aber nie über die Fundstelle hinaus.
  if (start > 0) {
    const space = flat.indexOf(' ', start);
    start = space !== -1 && space < hit ? space + 1 : start;
  }
  if (end < flat.length) {
    const space = flat.lastIndexOf(' ', end);
    end = space > hit + hitLength ? space : end;
  }
  return `${start > 0 ? '…' : ''}${flat.slice(start, end)}${end < flat.length ? '…' : ''}`;
}

/** Ziel der Suchzeile; ohne Begriff die leere Suchseite. */
export function searchPath(query: string): string {
  return query === '' ? '/suche' : `/suche?${new URLSearchParams({ q: query }).toString()}`;
}

export function searchHub(query: string, sources: SearchSources): SearchResult {
  const terms = searchTerms(query);
  const empty: SearchResult = { experiments: [], cards: [], notes: [], total: 0 };
  if (terms.length === 0) return empty;

  const byId = new Map(sources.projects.map((p) => [p.id, p]));
  const titleOf = (id: string) => byId.get(id)?.title ?? id;

  const experiments: ExperimentHit[] = sources.projects
    .filter((p) => matchesAll([p.title, p.question, p.trackLabel], terms))
    .map((p) => ({ projectId: p.id, title: p.title, question: p.question, trackLabel: p.trackLabel }));

  const cards: CardHit[] = [];
  for (const p of sources.projects) {
    for (const c of p.cards) {
      if (matchesAll([c.front, c.back], terms)) {
        cards.push({ key: c.id, projectId: p.id, projectTitle: p.title, front: c.front, back: c.back, own: false });
      }
    }
  }
  for (const c of sources.ownCards) {
    if (matchesAll([c.front, c.back], terms)) {
      cards.push({
        key: `own-${c.id}`,
        projectId: c.projectId,
        projectTitle: titleOf(c.projectId),
        front: c.front,
        back: c.back,
        own: true,
      });
    }
  }

  const notes: NoteHit[] = [];
  const addNote = (key: string, projectId: string, label: NoteLabel, text: string) => {
    if (text.trim() !== '' && matchesAll([text], terms)) {
      notes.push({ key, projectId, projectTitle: titleOf(projectId), label, excerpt: excerpt(text, terms) });
    }
  };
  for (const n of sources.notes) {
    addNote(`note-${n.projectId}`, n.projectId, 'Notiz', n.note);
    addNote(`idea-${n.projectId}`, n.projectId, 'Post-Idee', n.postIdea);
  }
  for (const r of sources.reflections) addNote(`refl-${r.questionId}`, r.projectId, 'Reflexion', r.answer);

  return { experiments, cards, notes, total: experiments.length + cards.length + notes.length };
}
