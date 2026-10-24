import type { ProjectNotes, ReflectionAnswer, ReflectionPrompt } from '@hub/shared';

export type ProjectLookup = (
  projectId: string,
) => { title: string; reflection: ReflectionPrompt[] } | undefined;

export interface NoteGroup {
  projectId: string;
  title: string;
  note: string;
  postIdea: string;
  answers: { question: string; answer: string }[];
}

/**
 * Gruppiert Notizen, Post-Ideen und Reflexionsantworten je Projekt, filtert
 * ohne Groß-/Kleinschreibung und lässt Projekte ohne sichtbaren Inhalt weg.
 * Im Post-Ideen-Modus zählt nur, was auch angezeigt wird.
 */
export function filterNotes(
  notes: ProjectNotes[],
  reflections: ReflectionAnswer[],
  lookup: ProjectLookup,
  query: string,
  postIdeasOnly: boolean,
): NoteGroup[] {
  const needle = query.trim().toLowerCase();
  const groups = new Map<string, NoteGroup>();
  const group = (projectId: string): NoteGroup => {
    let g = groups.get(projectId);
    if (!g) {
      g = { projectId, title: lookup(projectId)?.title ?? projectId, note: '', postIdea: '', answers: [] };
      groups.set(projectId, g);
    }
    return g;
  };

  for (const n of notes) {
    const note = n.note.trim();
    const postIdea = n.postIdea.trim();
    if (!postIdeasOnly && note) group(n.projectId).note = note;
    if (postIdea) group(n.projectId).postIdea = postIdea;
  }
  if (!postIdeasOnly) {
    for (const r of reflections) {
      const answer = r.answer.trim();
      if (!answer) continue;
      const question = lookup(r.projectId)?.reflection.find((q) => q.id === r.questionId)?.prompt ?? r.questionId;
      group(r.projectId).answers.push({ question, answer });
    }
  }

  return [...groups.values()]
    .filter((g) => g.note || g.postIdea || g.answers.length > 0)
    .filter((g) => {
      if (!needle) return true;
      const haystack = [g.title, g.note, g.postIdea, ...g.answers.map((a) => a.answer)];
      return haystack.some((s) => s.toLowerCase().includes(needle));
    })
    .sort((a, b) => a.title.localeCompare(b.title, 'de'));
}
